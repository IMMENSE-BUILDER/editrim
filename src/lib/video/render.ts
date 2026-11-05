import type { VideoAsset, VideoClip, VideoProject } from './types';
import { activeClips, clipOpacity, DEFAULT_FILTERS } from './types';

export type MediaElementMap = Map<string, HTMLVideoElement | HTMLAudioElement | HTMLImageElement>;

type RenderOptions = {
  showGuides?: boolean;
  selectedClipId?: string | null;
  animateText?: boolean;
};

type TextBounds = { x: number; y: number; w: number; h: number };

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function sourceSize(el: HTMLVideoElement | HTMLImageElement): { width: number; height: number } {
  if (el instanceof HTMLVideoElement) return { width: el.videoWidth, height: el.videoHeight };
  return { width: el.naturalWidth, height: el.naturalHeight };
}

function mediaReady(el: HTMLVideoElement | HTMLImageElement | HTMLAudioElement | undefined): el is HTMLVideoElement | HTMLImageElement {
  if (!el) return false;
  if (el instanceof HTMLVideoElement) return el.readyState >= 2 && el.videoWidth > 0;
  if (el instanceof HTMLAudioElement) return false;
  return el.complete && el.naturalWidth > 0;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  el: HTMLVideoElement | HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const source = sourceSize(el);
  if (!source.width || !source.height) return;
  const scale = Math.max(w / source.width, h / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  ctx.drawImage(el, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  el: HTMLVideoElement | HTMLImageElement,
  centerX: number,
  centerY: number,
  maxW: number,
  maxH: number,
) {
  const source = sourceSize(el);
  if (!source.width || !source.height) return;
  const scale = Math.min(maxW / source.width, maxH / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  ctx.drawImage(el, centerX - dw / 2, centerY - dh / 2, dw, dh);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  paragraphs.forEach(paragraph => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      return;
    }
    let line = '';
    words.forEach(word => {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth || !line) {
        line = next;
      } else {
        lines.push(line);
        line = word;
      }
    });
    lines.push(line);
  });
  return lines;
}

function textBounds(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  clip: VideoClip,
): TextBounds {
  const style = clip.text;
  if (!style) return { x: 0, y: 0, w: 0, h: 0 };
  const ctxWithSpacing = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  ctxWithSpacing.letterSpacing = `${style.letterSpacing}px`;
  ctx.font = `${style.fontWeight} ${style.fontSize}px "${style.fontFamily}", system-ui, sans-serif`;
  const text = style.uppercase ? style.content.toUpperCase() : style.content;
  const maxWidth = project.width * style.width;
  const lines = wrapLines(ctx, text || ' ', maxWidth);
  const lineHeight = style.fontSize * style.lineHeight;
  const measured = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
  const blockWidth = Math.min(maxWidth, Math.max(style.fontSize * 0.6, measured));
  const blockHeight = Math.max(style.fontSize, lines.length * lineHeight);
  const centerX = clip.x * project.width;
  const centerY = clip.y * project.height;
  const boundsX = style.align === 'left'
    ? centerX - maxWidth / 2
    : style.align === 'right'
      ? centerX + maxWidth / 2 - blockWidth
      : centerX - blockWidth / 2;
  return {
    x: boundsX,
    y: centerY - blockHeight / 2,
    w: blockWidth,
    h: blockHeight,
  };
}

function drawTextClip(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  clip: VideoClip,
  time: number,
  animate: boolean,
): TextBounds {
  const style = clip.text;
  if (!style) return { x: 0, y: 0, w: 0, h: 0 };
  const ctxWithSpacing = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  ctxWithSpacing.letterSpacing = `${style.letterSpacing}px`;
  ctx.font = `${style.fontWeight} ${style.fontSize}px "${style.fontFamily}", system-ui, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.textAlign = style.align === 'left' ? 'left' : style.align === 'right' ? 'right' : 'center';
  const text = style.uppercase ? style.content.toUpperCase() : style.content;
  const maxWidth = project.width * style.width;
  const lines = wrapLines(ctx, text || ' ', maxWidth);
  const lineHeight = style.fontSize * style.lineHeight;
  const blockHeight = lines.length * lineHeight;
  const measured = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
  const blockWidth = Math.min(maxWidth, Math.max(style.fontSize * 0.6, measured));
  const centerX = clip.x * project.width;
  const centerY = clip.y * project.height;
  const boxLeft = centerX - maxWidth / 2;
  const blockLeft = centerX - blockWidth / 2;
  const top = centerY - blockHeight / 2;
  const motion = style.motion ?? 'none';
  const progress = animate ? Math.max(0, Math.min(1, (time - clip.start) / 0.45)) : 1;
  const eased = 1 - Math.pow(1 - progress, 3);
  const motionAlpha = motion === 'none' ? 1 : eased;
  const alpha = clipOpacity(clip, time) * motionAlpha;
  const offsetY = motion === 'rise' ? (1 - eased) * style.fontSize * 0.55 : 0;
  const scale = motion === 'pop' ? 0.9 + eased * 0.1 : 1;
  const pad = Math.round(style.fontSize * 0.2);

  ctx.save();
  ctx.translate(centerX, centerY + offsetY);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);

  if (style.backgroundOpacity > 0) {
    const bgWidth = blockWidth + pad * 2;
    const bgHeight = blockHeight + pad * 2;
    const bgLeft = style.align === 'left'
      ? boxLeft - pad
      : style.align === 'right'
        ? boxLeft + maxWidth - blockWidth - pad
        : blockLeft - pad;
    ctx.save();
    ctx.globalAlpha = alpha * style.backgroundOpacity;
    ctx.fillStyle = style.background;
    roundRectPath(ctx, bgLeft, top - pad, bgWidth, bgHeight, Math.min(18, style.fontSize * 0.18));
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = style.color;
  if (style.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,.55)';
    ctx.shadowBlur = Math.max(8, style.fontSize * 0.14);
    ctx.shadowOffsetY = Math.max(2, style.fontSize * 0.04);
  }
  const drawX = style.align === 'left' ? boxLeft : style.align === 'right' ? boxLeft + maxWidth : centerX;
  lines.forEach((line, index) => {
    ctx.fillText(line, drawX, top + index * lineHeight);
  });
  ctx.restore();
  ctx.restore();
  return {
    x: style.align === 'left' ? boxLeft : style.align === 'right' ? boxLeft + maxWidth - blockWidth : blockLeft,
    y: top + offsetY,
    w: blockWidth * scale,
    h: blockHeight * scale,
  };
}

function drawImageClip(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  clip: VideoClip,
  asset: VideoAsset | undefined,
  element: HTMLImageElement | undefined,
  time: number,
): TextBounds | null {
  if (!asset || !mediaReady(element)) return null;
  const width = Math.max(40, project.width * clip.scale);
  const source = sourceSize(element);
  const height = source.width ? width * (source.height / source.width) : width;
  const x = clip.x * project.width;
  const y = clip.y * project.height;
  ctx.save();
  ctx.globalAlpha = clipOpacity(clip, time);
  ctx.filter = clipFilter(clip);
  drawContain(ctx, element, x, y, width, height);
  ctx.restore();
  return { x: x - width / 2, y: y - height / 2, w: width, h: height };
}

function clipFilter(clip: VideoClip): string {
  const filters = clip.filters ?? DEFAULT_FILTERS;
  return `brightness(${filters.brightness}) contrast(${filters.contrast}) saturate(${filters.saturation})${filters.blur > 0 ? ` blur(${filters.blur}px)` : ''}`;
}

function drawGuide(ctx: CanvasRenderingContext2D, bounds: TextBounds) {
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(96,165,250,.95)';
  ctx.strokeRect(bounds.x - 6, bounds.y - 6, bounds.w + 12, bounds.h + 12);
  ctx.restore();
}

export function renderVideoFrame(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  time: number,
  elements: MediaElementMap,
  options: RenderOptions = {},
) {
  const { width, height } = project;
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = project.background;
  ctx.fillRect(0, 0, width, height);

  const videoTrack = project.tracks.find(track => track.id === 'video');
  const overlayTrack = project.tracks.find(track => track.id === 'overlay');
  const activeVideo = videoTrack && !videoTrack.hidden ? activeClips(project, 'video', time) : [];
  const activeOverlay = overlayTrack && !overlayTrack.hidden ? activeClips(project, 'overlay', time) : [];

  activeVideo.forEach(clip => {
    if (clip.kind !== 'video') return;
    const asset = project.assets.find(item => item.id === clip.assetId);
    const element = asset ? elements.get(asset.id) : undefined;
    if (!asset || !mediaReady(element)) return;
    ctx.save();
    ctx.globalAlpha = clipOpacity(clip, time);
    ctx.filter = clipFilter(clip);
    const zoom = Math.max(1, clip.scale || 1);
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);
    drawCover(ctx, element, 0, 0, width, height);
    ctx.restore();
    if (options.showGuides && clip.id === options.selectedClipId) {
      drawGuide(ctx, { x: 0, y: 0, w: width, h: height });
    }
  });

  activeOverlay.forEach(clip => {
    let bounds: TextBounds | null = null;
    if (clip.kind === 'text') {
      bounds = drawTextClip(ctx, project, clip, time, options.animateText ?? true);
    } else if (clip.kind === 'image') {
      const asset = project.assets.find(item => item.id === clip.assetId);
      const element = asset ? elements.get(asset.id) : undefined;
      bounds = drawImageClip(ctx, project, clip, asset, element instanceof HTMLImageElement ? element : undefined, time);
    }
    if (options.showGuides && clip.id === options.selectedClipId && bounds) drawGuide(ctx, bounds);
  });

  ctx.restore();
}
