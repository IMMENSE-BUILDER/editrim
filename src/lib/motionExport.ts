import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import type { Design, DesignSize, Page } from './types';
import { preloadImages, renderPageCanvas } from './render';
import { downloadBlob, safeFilename } from './utils';

export type MotionFormat = 'gif' | 'mp4' | 'webm';

export type MotionExportOptions = {
  format: MotionFormat;
  fps: number;
  scale: number;
  pages: 'current' | 'all';
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
};

function even(n: number): number {
  const v = Math.max(2, Math.round(n));
  return v % 2 === 0 ? v : v - 1;
}

function fitToMaxSide(size: DesignSize, requestedScale: number, maxSide: number): { width: number; height: number; scale: number } {
  const rawW = size.width * requestedScale;
  const rawH = size.height * requestedScale;
  const longest = Math.max(rawW, rawH);
  const clampScale = longest > maxSide ? requestedScale * (maxSide / longest) : requestedScale;
  return {
    width: even(size.width * clampScale),
    height: even(size.height * clampScale),
    scale: clampScale,
  };
}

export async function exportMotion(
  design: Design,
  currentPage: number,
  opts: MotionExportOptions,
): Promise<{ files: number; format: MotionFormat }> {
  const targetPages: Page[] = opts.pages === 'all' ? design.pages : [design.pages[currentPage] ?? design.pages[0]];
  const baseName = safeFilename(design.title);

  // Warm image cache once across selected pages
  await Promise.all(targetPages.map(p => preloadImages(p)));

  const isGif = opts.format === 'gif';
  const fps = isGif ? Math.min(15, Math.max(6, opts.fps)) : Math.max(12, Math.min(30, opts.fps));
  const dims = isGif ? fitToMaxSide(design.size, opts.scale, 800) : fitToMaxSide(design.size, opts.scale, 1920);
  const effectiveScale = dims.width / design.size.width;

  const schedule: { page: Page; time: number }[] = [];
  for (const p of targetPages) {
    const dur = Math.max(1, p.duration ?? 4);
    const totalFrames = Math.max(2, Math.round(dur * fps));
    for (let f = 0; f < totalFrames; f++) {
      schedule.push({ page: p, time: f / fps });
    }
  }

  if (isGif) {
    const gif = GIFEncoder();
    const delayMs = Math.round(1000 / fps);
    for (let i = 0; i < schedule.length; i++) {
      if (opts.signal?.aborted) throw new Error('Cancelled');
      const { page, time } = schedule[i];
      const canvas = await renderPageCanvas(page, design.size, { scale: effectiveScale, time });
      const ctx = canvas.getContext('2d')!;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const palette = quantize(imgData.data, 256);
      const index = applyPalette(imgData.data, palette);
      gif.writeFrame(index, canvas.width, canvas.height, { palette, delay: delayMs, repeat: 0 });
      opts.onProgress?.(Math.round(((i + 1) / schedule.length) * 100));
    }
    gif.finish();
    const bytes = new Uint8Array(gif.bytesView());
    downloadBlob(new Blob([bytes], { type: 'image/gif' }), `${baseName}.gif`);
    return { files: 1, format: 'gif' };
  }

  if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') {
    throw new Error('VideoEncoder is not supported in this browser.');
  }

  const width = dims.width;
  const height = dims.height;
  const bitrate = Math.max(1_500_000, Math.round(width * height * fps * 0.12));
  const frameDurUs = Math.round(1_000_000 / fps);

  if (opts.format === 'mp4') {
    const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: 'avc', width, height, frameRate: fps },
      fastStart: 'in-memory',
    });

    const preferredCodec = width > 1280 || height > 720 ? 'avc1.640028' : 'avc1.42001f';
    const check = await VideoEncoder.isConfigSupported({ codec: preferredCodec, width, height, bitrate, framerate: fps });
    const codec = check.supported ? preferredCodec : 'avc1.42001f';

    let encoderErr: unknown = null;
    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: e => { encoderErr = e; },
    });
    encoder.configure({ codec, width, height, bitrate, framerate: fps });

    try {
      for (let i = 0; i < schedule.length; i++) {
        if (opts.signal?.aborted) throw new Error('Cancelled');
        if (encoderErr) throw encoderErr;
        const { page, time } = schedule[i];
        const canvas = await renderPageCanvas(page, design.size, { scale: effectiveScale, time });
        // Ensure exact even dims
        let srcCanvas = canvas;
        if (canvas.width !== width || canvas.height !== height) {
          const resized = document.createElement('canvas');
          resized.width = width;
          resized.height = height;
          resized.getContext('2d')!.drawImage(canvas, 0, 0, width, height);
          srcCanvas = resized;
        }
        const vf = new VideoFrame(srcCanvas, { timestamp: i * frameDurUs, duration: frameDurUs });
        try {
          encoder.encode(vf, { keyFrame: i % (fps * 2) === 0 });
        } finally {
          vf.close();
        }
        opts.onProgress?.(Math.round(((i + 1) / schedule.length) * 95));
      }
      await encoder.flush();
      if (encoderErr) throw encoderErr;
      muxer.finalize();
      opts.onProgress?.(100);
      downloadBlob(new Blob([target.buffer], { type: 'video/mp4' }), `${baseName}.mp4`);
      return { files: 1, format: 'mp4' };
    } finally {
      if (encoder.state !== 'closed') encoder.close();
    }
  }

  // WebM
  const { Muxer, ArrayBufferTarget } = await import('webm-muxer');
  const vp9Cfg = { codec: 'vp09.00.10.08', width, height, bitrate, framerate: fps };
  const vp9Supported = (await VideoEncoder.isConfigSupported(vp9Cfg)).supported;
  const webCodec = vp9Supported ? 'vp09.00.10.08' : 'vp8';
  const muxCodec = vp9Supported ? 'V_VP9' : 'V_VP8';

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: muxCodec, width, height, frameRate: fps },
  });

  let encoderErr: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: e => { encoderErr = e; },
  });
  encoder.configure({ codec: webCodec, width, height, bitrate, framerate: fps });

  try {
    for (let i = 0; i < schedule.length; i++) {
      if (opts.signal?.aborted) throw new Error('Cancelled');
      if (encoderErr) throw encoderErr;
      const { page, time } = schedule[i];
      const canvas = await renderPageCanvas(page, design.size, { scale: effectiveScale, time });
      let srcCanvas = canvas;
      if (canvas.width !== width || canvas.height !== height) {
        const resized = document.createElement('canvas');
        resized.width = width;
        resized.height = height;
        resized.getContext('2d')!.drawImage(canvas, 0, 0, width, height);
        srcCanvas = resized;
      }
      const vf = new VideoFrame(srcCanvas, { timestamp: i * frameDurUs, duration: frameDurUs });
      try {
        encoder.encode(vf, { keyFrame: i % (fps * 2) === 0 });
      } finally {
        vf.close();
      }
      opts.onProgress?.(Math.round(((i + 1) / schedule.length) * 95));
    }
    await encoder.flush();
    if (encoderErr) throw encoderErr;
    muxer.finalize();
    opts.onProgress?.(100);
    downloadBlob(new Blob([target.buffer], { type: 'video/webm' }), `${baseName}.webm`);
    return { files: 1, format: 'webm' };
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
}
