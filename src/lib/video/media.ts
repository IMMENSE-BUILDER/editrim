import type { VideoAsset, VideoAssetKind } from './types';

export type ProbeResult = { duration: number; width: number; height: number };

function waitEvent<T extends EventTarget>(target: T, event: string, timeout = 12_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      target.removeEventListener(event, onEvent);
      reject(new Error(`Timed out loading ${event}`));
    }, timeout);
    const onEvent = () => {
      window.clearTimeout(timer);
      target.removeEventListener(event, onEvent);
      resolve();
    };
    target.addEventListener(event, onEvent, { once: true });
  });
}

export async function probeMedia(src: string, kind: VideoAssetKind): Promise<ProbeResult> {
  if (kind === 'image') {
    const image = new Image();
    image.src = src;
    await waitEvent(image, 'load');
    return { duration: 0, width: image.naturalWidth, height: image.naturalHeight };
  }
  const el = document.createElement(kind === 'video' ? 'video' : 'audio');
  el.preload = 'metadata';
  el.src = src;
  await waitEvent(el, 'loadedmetadata');
  const media = el as HTMLVideoElement;
  return {
    duration: Number.isFinite(media.duration) ? media.duration : 0,
    width: media.videoWidth || 0,
    height: media.videoHeight || 0,
  };
}

function placeholderThumbnail(label: string, tone: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const gradient = ctx.createLinearGradient(0, 0, 320, 180);
  gradient.addColorStop(0, '#14130F');
  gradient.addColorStop(1, tone);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 320, 180);
  ctx.fillStyle = 'rgba(244,241,234,.9)';
  ctx.font = '600 18px Inter, sans-serif';
  ctx.fillText(label.slice(0, 28), 20, 150);
  return canvas.toDataURL('image/jpeg', 0.72);
}

export async function createVideoThumbnail(src: string, duration: number): Promise<string> {
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.src = src;
    await waitEvent(video, 'loadeddata');
    const target = Math.min(Math.max(0.08, duration * 0.2), Math.max(0.08, duration - 0.08));
    video.currentTime = target;
    await waitEvent(video, 'seeked');
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const ratio = Math.max(320 / video.videoWidth, 180 / video.videoHeight);
    const w = video.videoWidth * ratio;
    const h = video.videoHeight * ratio;
    ctx.drawImage(video, (320 - w) / 2, (180 - h) / 2, w, h);
    return canvas.toDataURL('image/jpeg', 0.75);
  } catch {
    return placeholderThumbnail('Video', '#2563EB');
  }
}

export async function createImageThumbnail(src: string): Promise<string> {
  try {
    const image = new Image();
    image.src = src;
    await waitEvent(image, 'load');
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const ratio = Math.max(320 / image.naturalWidth, 180 / image.naturalHeight);
    const w = image.naturalWidth * ratio;
    const h = image.naturalHeight * ratio;
    ctx.drawImage(image, (320 - w) / 2, (180 - h) / 2, w, h);
    return canvas.toDataURL('image/jpeg', 0.76);
  } catch {
    return placeholderThumbnail('Image', '#8B5CFF');
  }
}

export async function extractWaveform(file: File, bins = 72): Promise<number[] | undefined> {
  if (file.size > 60 * 1024 * 1024) return undefined;
  try {
    const buffer = await file.arrayBuffer();
    const ctx = new AudioContext();
    const audio = await ctx.decodeAudioData(buffer);
    const channel = audio.getChannelData(0);
    const block = Math.max(1, Math.floor(channel.length / bins));
    const peaks: number[] = [];
    for (let i = 0; i < bins; i++) {
      let peak = 0;
      const start = i * block;
      const end = Math.min(channel.length, start + block);
      for (let j = start; j < end; j++) peak = Math.max(peak, Math.abs(channel[j]));
      peaks.push(Math.max(0.02, Math.min(1, peak)));
    }
    await ctx.close();
    return peaks;
  } catch {
    return undefined;
  }
}

export function waveformThumbnail(peaks: number[] | undefined): string {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const gradient = ctx.createLinearGradient(0, 0, 320, 180);
  gradient.addColorStop(0, '#071B1D');
  gradient.addColorStop(1, '#124F54');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 320, 180);
  const bars = peaks?.length ? peaks : Array.from({ length: 48 }, (_, i) => 0.2 + Math.abs(Math.sin(i * 1.7)) * 0.6);
  const width = 320 / bars.length;
  ctx.fillStyle = 'rgba(76,219,214,.8)';
  bars.forEach((peak, index) => {
    const height = Math.max(4, peak * 110);
    ctx.fillRect(index * width + 1, 90 - height / 2, Math.max(1, width - 2), height);
  });
  ctx.fillStyle = 'rgba(244,241,234,.85)';
  ctx.font = '600 13px Inter, sans-serif';
  ctx.fillText('AUDIO', 18, 164);
  return canvas.toDataURL('image/jpeg', 0.72);
}

export async function buildVideoAsset(file: File, id: string, src: string, kind: VideoAssetKind): Promise<VideoAsset> {
  const probe = await probeMedia(src, kind).catch(() => ({ duration: 0, width: 0, height: 0 }));
  let waveform: number[] | undefined;
  let thumbnail = '';
  if (kind === 'video') thumbnail = await createVideoThumbnail(src, probe.duration);
  else if (kind === 'image') thumbnail = await createImageThumbnail(src);
  else {
    waveform = await extractWaveform(file);
    thumbnail = waveformThumbnail(waveform);
  }
  return {
    id,
    name: file.name,
    kind,
    src,
    duration: probe.duration,
    width: probe.width,
    height: probe.height,
    thumbnail,
    waveform,
    mime: file.type,
    size: file.size,
  };
}
