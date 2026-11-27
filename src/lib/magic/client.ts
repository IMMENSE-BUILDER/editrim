import { resolveSrc } from '../storage';
import { removeBackground, extractForegroundLayer, type RemoveBgOptions } from './segmentation';
import { inpaintImage, type InpaintOptions } from './inpaint';
import type { MagicWorkerRequest, MagicWorkerResponse } from './worker';

let workerSingleton: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (r: MagicWorkerResponse) => void; reject: (e: Error) => void }>();

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;
  if (!workerSingleton) {
    try {
      workerSingleton = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      workerSingleton.onmessage = (e: MessageEvent<MagicWorkerResponse>) => {
        const msg = e.data;
        const job = pending.get(msg.id);
        if (!job) return;
        pending.delete(msg.id);
        if (msg.ok) job.resolve(msg);
        else job.reject(new Error(msg.error));
      };
      workerSingleton.onerror = () => {
        for (const [, job] of pending) job.reject(new Error('Magic worker failed'));
        pending.clear();
        workerSingleton = null;
      };
    } catch {
      return null;
    }
  }
  return workerSingleton;
}

function runWorker(req: MagicWorkerRequest, transfer: Transferable[]): Promise<MagicWorkerResponse> {
  const w = getWorker();
  if (!w) {
    // Fallback main-thread execution
    return Promise.resolve().then(() => {
      const img = new ImageData(new Uint8ClampedArray(req.pixels), req.width, req.height);
      if (req.op === 'removeBg') {
        const res = removeBackground(img, req.opts);
        return { id: req.id, ok: true, op: 'removeBg', width: res.width, height: res.height, pixels: res.data.buffer };
      }
      const mask = new Uint8ClampedArray(req.mask);
      if (req.op === 'inpaint') {
        const res = inpaintImage(img, mask, req.opts);
        return { id: req.id, ok: true, op: 'inpaint', width: res.width, height: res.height, pixels: res.data.buffer };
      }
      const { foreground, bbox } = extractForegroundLayer(img, mask);
      const bg = inpaintImage(img, mask, req.opts);
      return {
        id: req.id,
        ok: true,
        op: 'magicGrab',
        fgWidth: foreground.width,
        fgHeight: foreground.height,
        fgPixels: foreground.data.buffer,
        bgWidth: bg.width,
        bgHeight: bg.height,
        bgPixels: bg.data.buffer,
        bbox,
      };
    });
  }
  return new Promise((resolve, reject) => {
    pending.set(req.id, { resolve, reject });
    w.postMessage(req, transfer);
  });
}

export async function loadImageDataFromSrc(src: string, maxSide = 1400): Promise<ImageData> {
  const resolved = await resolveSrc(src);
  const img = new Image();
  if (!resolved.startsWith('data:') && !resolved.startsWith('blob:')) {
    img.crossOrigin = 'anonymous';
  }
  img.src = resolved;
  await img.decode();
  const scale = Math.min(1, maxSide / Math.max(1, img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

export function imageDataToPngUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

function resizeMask(
  mask: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): Uint8ClampedArray {
  if (srcW === dstW && srcH === dstH) return new Uint8ClampedArray(mask);
  const out = new Uint8ClampedArray(dstW * dstH);
  for (let y = 0; y < dstH; y++) {
    const sy = Math.min(srcH - 1, Math.floor((y * srcH) / dstH));
    for (let x = 0; x < dstW; x++) {
      const sx = Math.min(srcW - 1, Math.floor((x * srcW) / dstW));
      out[y * dstW + x] = mask[sy * srcW + sx];
    }
  }
  return out;
}

function toArrayBuffer(u8: Uint8ClampedArray): ArrayBuffer {
  const buf = new ArrayBuffer(u8.byteLength);
  new Uint8ClampedArray(buf).set(u8);
  return buf;
}

export async function runRemoveBackground(src: string, opts?: RemoveBgOptions): Promise<string> {
  const img = await loadImageDataFromSrc(src, 1400);
  const id = nextId++;
  const pixels = toArrayBuffer(img.data);
  const res = await runWorker(
    { id, op: 'removeBg', width: img.width, height: img.height, pixels, opts },
    [pixels],
  );
  if (!res.ok || res.op !== 'removeBg') throw new Error('Background removal failed');
  return imageDataToPngUrl(new ImageData(new Uint8ClampedArray(res.pixels), res.width, res.height));
}

export async function runInpaint(
  src: string,
  mask: Uint8ClampedArray,
  maskW: number,
  maskH: number,
  opts?: InpaintOptions,
): Promise<string> {
  const img = await loadImageDataFromSrc(src, 1400);
  const scaledMask = resizeMask(mask, maskW, maskH, img.width, img.height);
  const id = nextId++;
  const pixels = toArrayBuffer(img.data);
  const maskBuf = toArrayBuffer(scaledMask);
  const res = await runWorker(
    { id, op: 'inpaint', width: img.width, height: img.height, pixels, mask: maskBuf, opts },
    [pixels, maskBuf],
  );
  if (!res.ok || res.op !== 'inpaint') throw new Error('Magic eraser failed');
  return imageDataToPngUrl(new ImageData(new Uint8ClampedArray(res.pixels), res.width, res.height));
}

export async function runMagicGrab(
  src: string,
  mask: Uint8ClampedArray,
  maskW: number,
  maskH: number,
  opts?: InpaintOptions,
): Promise<{
  foregroundUrl: string;
  backgroundUrl: string;
  bboxRatio: { x: number; y: number; w: number; h: number };
}> {
  const img = await loadImageDataFromSrc(src, 1400);
  const scaledMask = resizeMask(mask, maskW, maskH, img.width, img.height);
  const id = nextId++;
  const pixels = toArrayBuffer(img.data);
  const maskBuf = toArrayBuffer(scaledMask);
  const res = await runWorker(
    { id, op: 'magicGrab', width: img.width, height: img.height, pixels, mask: maskBuf, opts },
    [pixels, maskBuf],
  );
  if (!res.ok || res.op !== 'magicGrab') throw new Error('Magic grab failed');
  const foregroundUrl = imageDataToPngUrl(new ImageData(new Uint8ClampedArray(res.fgPixels), res.fgWidth, res.fgHeight));
  const backgroundUrl = imageDataToPngUrl(new ImageData(new Uint8ClampedArray(res.bgPixels), res.bgWidth, res.bgHeight));
  return {
    foregroundUrl,
    backgroundUrl,
    bboxRatio: {
      x: res.bbox.x / Math.max(1, img.width),
      y: res.bbox.y / Math.max(1, img.height),
      w: res.bbox.w / Math.max(1, img.width),
      h: res.bbox.h / Math.max(1, img.height),
    },
  };
}
