import type { Background, DesignSize, El, ImageElement, Page, Paint, Shadow, ShapeElement, TextElement } from './types';
import { resolveSrc } from './storage';
import { FONT_CSS_STACK } from './fonts';
import { iconById } from './icons';

const imageCache = new Map<string, HTMLImageElement>();
const failedImages = new Set<string>();

export function fontString(el: { italic?: boolean; fontWeight: number; fontSize: number; fontFamily: string }) {
  return `${el.italic ? 'italic ' : ''}${el.fontWeight} ${el.fontSize}px ${FONT_CSS_STACK(el.fontFamily)}`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  const cached = imageCache.get(src);
  if (cached) return Promise.resolve(cached);
  if (failedImages.has(src)) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    if (/^https?:/.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      failedImages.add(src);
      resolve(null);
    };
    img.src = src;
  });
}

export async function preloadImages(page: Page): Promise<void> {
  const srcs: string[] = [];
  if (page.background.kind === 'image') srcs.push(await resolveSrc(page.background.src));
  for (const el of page.elements) {
    if (el.type === 'image') srcs.push(await resolveSrc(el.src));
  }
  await Promise.all(srcs.filter(Boolean).map(loadImage));
}

function paintToStyle(ctx: CanvasRenderingContext2D, paint: Paint | undefined, w: number, h: number): string | CanvasGradient | null {
  if (!paint || paint.kind === 'none') return null;
  if (paint.kind === 'solid') return paint.color;
  const angle = ((paint.angle - 90) * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const len = Math.abs(w * Math.sin(angle)) + Math.abs(h * Math.cos(angle));
  const dx = Math.cos(angle) * (len / 2);
  const dy = Math.sin(angle) * (len / 2);
  const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  g.addColorStop(0, paint.from);
  g.addColorStop(1, paint.to);
  return g;
}

export function paintToCss(paint: Paint | undefined): string {
  if (!paint || paint.kind === 'none') return 'transparent';
  if (paint.kind === 'solid') return paint.color;
  return `linear-gradient(${paint.angle}deg, ${paint.from}, ${paint.to})`;
}

export function shadowToCss(shadow?: Shadow | null) {
  if (!shadow) return 'none';
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function starPath(ctx: CanvasRenderingContext2D, w: number, h: number, points = 5, inner = 0.42) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2;
  const ry = h / 2;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? 1 : inner;
    const x = cx + Math.cos(a) * rx * rr;
    const y = cy + Math.sin(a) * ry * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function burstPath(ctx: CanvasRenderingContext2D, w: number, h: number, points = 12) {
  const cx = w / 2;
  const cy = h / 2;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? 1 : 0.76;
    const x = cx + Math.cos(a) * (w / 2) * rr;
    const y = cy + Math.sin(a) * (h / 2) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function heartPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const x = 0;
  const y = h * 0.16;
  const ww = w;
  const hh = h * 0.8;
  ctx.beginPath();
  ctx.moveTo(x + ww / 2, y + hh);
  ctx.bezierCurveTo(x + ww * 0.02, y + hh * 0.62, x + ww * 0.0, y + hh * 0.1, x + ww * 0.26, y + hh * 0.06);
  ctx.bezierCurveTo(x + ww * 0.4, y + hh * 0.02, x + ww * 0.47, y + hh * 0.16, x + ww / 2, y + hh * 0.26);
  ctx.bezierCurveTo(x + ww * 0.53, y + hh * 0.16, x + ww * 0.6, y + hh * 0.02, x + ww * 0.74, y + hh * 0.06);
  ctx.bezierCurveTo(x + ww, y + hh * 0.1, x + ww * 0.98, y + hh * 0.62, x + ww / 2, y + hh);
  ctx.closePath();
}

function blobPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2;
  const ry = h / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.bezierCurveTo(cx + rx * 0.66, cy - ry, cx + rx, cy - ry * 0.45, cx + rx * 0.92, cy + ry * 0.08);
  ctx.bezierCurveTo(cx + rx * 0.84, cy + ry * 0.62, cx + rx * 0.4, cy + ry, cx - rx * 0.04, cy + ry * 0.94);
  ctx.bezierCurveTo(cx - rx * 0.56, cy + ry * 0.88, cx - rx, cy + ry * 0.44, cx - rx * 0.96, cy - ry * 0.02);
  ctx.bezierCurveTo(cx - rx * 0.92, cy - ry * 0.52, cx - rx * 0.48, cy - ry, cx, cy - ry);
  ctx.closePath();
}

function arrowPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const y1 = h * 0.3;
  const y2 = h * 0.7;
  const xTip = w;
  const xNeck = w * 0.64;
  ctx.beginPath();
  ctx.moveTo(0, y1);
  ctx.lineTo(xNeck, y1);
  ctx.lineTo(xNeck, 0);
  ctx.lineTo(xTip, h / 2);
  ctx.lineTo(xNeck, h);
  ctx.lineTo(xNeck, y2);
  ctx.lineTo(0, y2);
  ctx.closePath();
}

function wavePath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(0, h * 0.35);
  ctx.bezierCurveTo(w * 0.25, 0, w * 0.4, h * 0.7, w * 0.62, h * 0.35);
  ctx.bezierCurveTo(w * 0.78, h * 0.1, w * 0.88, h * 0.3, w, h * 0.22);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
}

function ringPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.moveTo(w / 2 + (w / 2) * 0.62, h / 2);
  ctx.ellipse(w / 2, h / 2, (w / 2) * 0.62, (h / 2) * 0.62, 0, 0, Math.PI * 2, true);
  ctx.closePath();
}

function shapePath(ctx: CanvasRenderingContext2D, el: ShapeElement, w: number, h: number) {
  switch (el.shape) {
    case 'rect':
      roundRect(ctx, 0, 0, w, h, el.radius);
      break;
    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      break;
    case 'line':
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      break;
    case 'star':
      starPath(ctx, w, h);
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(0, h / 2);
      ctx.closePath();
      break;
    case 'hexagon':
      ctx.beginPath();
      ctx.moveTo(w * 0.25, 0);
      ctx.lineTo(w * 0.75, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w * 0.75, h);
      ctx.lineTo(w * 0.25, h);
      ctx.lineTo(0, h / 2);
      ctx.closePath();
      break;
    case 'blob':
      blobPath(ctx, w, h);
      break;
    case 'heart':
      heartPath(ctx, w, h);
      break;
    case 'arrow':
      arrowPath(ctx, w, h);
      break;
    case 'burst':
      burstPath(ctx, w, h);
      break;
    case 'wave':
      wavePath(ctx, w, h);
      break;
    case 'ring':
      ringPath(ctx, w, h);
      break;
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (para === '') {
      lines.push('');
      continue;
    }
    const words = para.split(/(\s+)/);
    let line = '';
    for (const word of words) {
      if (ctx.measureText(line + word).width <= maxWidth || line === '') {
        line += word;
      } else {
        if (line.trim()) lines.push(line.replace(/\s+$/, ''));
        if (ctx.measureText(word).width > maxWidth && word.trim()) {
          let chunk = '';
          for (const ch of word) {
            if (ctx.measureText(chunk + ch).width > maxWidth && chunk) {
              lines.push(chunk);
              chunk = ch;
            } else {
              chunk += ch;
            }
          }
          line = chunk;
        } else {
          line = word.replace(/^\s+/, '');
        }
      }
    }
    if (line.trim() || line === '') lines.push(line.replace(/\s+$/, ''));
  }
  while (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

export function measureTextHeight(el: TextElement): number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = fontString(el);
  const supportsSpacing = 'letterSpacing' in ctx;
  if (supportsSpacing) (ctx as any).letterSpacing = `${el.letterSpacing}px`;
  const pad = el.padding ?? 0;
  const text = el.uppercase ? el.text.toUpperCase() : el.text;
  const lines = wrapLines(ctx, text, Math.max(10, el.w - pad * 2));
  const h = lines.length * el.fontSize * el.lineHeight + pad * 2;
  return Math.ceil(Math.max(el.fontSize * el.lineHeight + pad * 2, h));
}

function drawText(ctx: CanvasRenderingContext2D, el: TextElement, scale: number) {
  const pad = el.padding ?? 0;
  if (el.background && el.background.kind !== 'none') {
    const style = paintToStyle(ctx, el.background, el.w, el.h);
    if (style) {
      ctx.fillStyle = style;
      roundRect(ctx, 0, 0, el.w, el.h, el.backgroundRadius ?? 0);
      ctx.fill();
    }
  }
  const text = el.uppercase ? el.text.toUpperCase() : el.text;
  ctx.font = fontString(el);
  const supportsSpacing = 'letterSpacing' in ctx;
  if (supportsSpacing) (ctx as any).letterSpacing = `${el.letterSpacing}px`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  const innerW = Math.max(10, el.w - pad * 2);
  const lines = wrapLines(ctx, text, innerW);
  const lineH = el.fontSize * el.lineHeight;
  const totalH = lines.length * lineH;
  let top = pad;
  if (el.valign === 'middle') top = (el.h - totalH) / 2;
  else if (el.valign === 'bottom') top = el.h - pad - totalH;

  if (el.shadow) {
    ctx.shadowColor = el.shadow.color;
    ctx.shadowBlur = el.shadow.blur * scale;
    ctx.shadowOffsetX = el.shadow.x * scale;
    ctx.shadowOffsetY = el.shadow.y * scale;
  }
  ctx.fillStyle = el.color;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineW = ctx.measureText(line).width;
    let x = pad;
    if (el.align === 'center') x = (el.w - lineW) / 2;
    else if (el.align === 'right') x = el.w - pad - lineW;
    const y = top + i * lineH + (lineH - el.fontSize) / 2;
    ctx.fillText(line, x, y);
    if (el.strokeWidth && el.strokeColor) {
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.strokeText(line, x, y);
    }
    if (el.underline) {
      ctx.fillRect(x, y + el.fontSize * 0.96, lineW, Math.max(1, el.fontSize * 0.045));
    }
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawImageEl(
  ctx: CanvasRenderingContext2D,
  el: ImageElement,
  img: HTMLImageElement,
  scale: number,
) {
  const radius = Math.max(0, el.radius);
  ctx.save();
  roundRect(ctx, 0, 0, el.w, el.h, radius);
  ctx.clip();
  const f = el.filters;
  const filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) blur(${f.blur * scale}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hue}deg)`;
  ctx.filter = filter;
  ctx.translate(el.w / 2, el.h / 2);
  ctx.scale(el.flipX ? -1 : 1, el.flipY ? -1 : 1);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const ratio = el.fit === 'contain' ? Math.min(el.w / iw, el.h / ih) : Math.max(el.w / iw, el.h / ih);
  const dw = iw * ratio;
  const dh = ih * ratio;
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
  if (el.overlay && el.overlayOpacity) {
    ctx.save();
    roundRect(ctx, 0, 0, el.w, el.h, radius);
    ctx.clip();
    ctx.globalAlpha = el.overlayOpacity;
    ctx.fillStyle = el.overlay;
    ctx.fillRect(0, 0, el.w, el.h);
    ctx.restore();
  }
}

const iconPathCache = new Map<string, Path2D>();

function getIconPath(icon: string): Path2D {
  if (iconPathCache.has(icon)) return iconPathCache.get(icon)!;
  const p = new Path2D();
  for (const d of iconById(icon).paths) p.addPath(new Path2D(d));
  iconPathCache.set(icon, p);
  return p;
}

async function drawElement(ctx: CanvasRenderingContext2D, el: El, scale: number) {
  if (el.hidden) return;
  ctx.save();
  ctx.globalAlpha = el.opacity ?? 1;
  ctx.translate(el.x + el.w / 2, el.y + el.h / 2);
  ctx.rotate((el.rotation * Math.PI) / 180);
  ctx.translate(-el.w / 2, -el.h / 2);

  if (el.shadow && el.type === 'shape') {
    ctx.shadowColor = el.shadow.color;
    ctx.shadowBlur = el.shadow.blur * scale;
    ctx.shadowOffsetX = el.shadow.x * scale;
    ctx.shadowOffsetY = el.shadow.y * scale;
  }

  if (el.type === 'shape') {
    shapePath(ctx, el, el.w, el.h);
    const style = paintToStyle(ctx, el.fill, el.w, el.h);
    if (style) {
      ctx.fillStyle = style;
      if (el.shape === 'ring') ctx.fill('evenodd');
      else ctx.fill();
    }
    if (el.strokeWidth > 0 && el.stroke !== 'transparent') {
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = el.strokeWidth;
      if (el.dash) ctx.setLineDash([el.strokeWidth * 3, el.strokeWidth * 2]);
      if (el.shape === 'line') ctx.lineCap = 'round';
      ctx.stroke();
    }
  } else if (el.type === 'text') {
    drawText(ctx, el, scale);
  } else if (el.type === 'image') {
    const src = await resolveSrc(el.src);
    const img = await loadImage(src);
    if (img) {
      if (el.shadow) {
        ctx.save();
        ctx.shadowColor = el.shadow.color;
        ctx.shadowBlur = el.shadow.blur * scale;
        ctx.shadowOffsetX = el.shadow.x * scale;
        ctx.shadowOffsetY = el.shadow.y * scale;
        ctx.fillStyle = '#000';
        roundRect(ctx, 0, 0, el.w, el.h, el.radius);
        ctx.fill();
        ctx.restore();
      }
      drawImageEl(ctx, el, img, scale);
    } else {
      ctx.fillStyle = '#E7E4DC';
      roundRect(ctx, 0, 0, el.w, el.h, el.radius);
      ctx.fill();
      ctx.fillStyle = '#A7A195';
      ctx.font = `600 ${Math.min(el.w, el.h) * 0.06}px ${FONT_CSS_STACK('Inter')}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Image unavailable', el.w / 2, el.h / 2);
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1;

  if (el.type === 'icon') {
    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;
    ctx.translate(el.x + el.w / 2, el.y + el.h / 2);
    ctx.rotate((el.rotation * Math.PI) / 180);
    const size = Math.min(el.w, el.h);
    ctx.scale(size / 24, size / 24);
    ctx.translate(-12, -12);
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.strokeWidth ?? 1.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke(getIconPath(el.icon));
    ctx.restore();
  }
}

async function drawBackground(ctx: CanvasRenderingContext2D, bg: Background, w: number, h: number) {
  if (bg.kind === 'solid') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, w, h);
  } else if (bg.kind === 'linear') {
    const angle = ((bg.angle - 90) * Math.PI) / 180;
    const len = Math.abs(w * Math.sin(angle)) + Math.abs(h * Math.cos(angle));
    const dx = Math.cos(angle) * (len / 2);
    const dy = Math.sin(angle) * (len / 2);
    const g = ctx.createLinearGradient(w / 2 - dx, h / 2 - dy, w / 2 + dx, h / 2 + dy);
    g.addColorStop(0, bg.from);
    g.addColorStop(1, bg.to);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else {
    const src = await resolveSrc(bg.src);
    const img = await loadImage(src);
    if (img) {
      const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * ratio;
      const dh = img.naturalHeight * ratio;
      ctx.save();
      if (bg.blur) ctx.filter = `blur(${bg.blur}px)`;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = '#E7E4DC';
      ctx.fillRect(0, 0, w, h);
    }
    if (bg.overlay) {
      ctx.save();
      ctx.globalAlpha = bg.overlayOpacity ?? 0.4;
      ctx.fillStyle = bg.overlay;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }
}

async function ensureFonts(page: Page) {
  if (!('fonts' in document)) return;
  const jobs: Promise<unknown>[] = [];
  for (const el of page.elements) {
    if (el.type === 'text') {
      jobs.push(document.fonts.load(`${el.italic ? 'italic ' : ''}${el.fontWeight} 16px "${el.fontFamily}"`).catch(() => null));
    }
  }
  await Promise.all(jobs);
  await document.fonts.ready.catch(() => null);
}

export async function renderPageCanvas(
  page: Page,
  size: DesignSize,
  opts: { scale?: number; transparent?: boolean } = {},
): Promise<HTMLCanvasElement> {
  const scale = opts.scale ?? 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(size.width * scale);
  canvas.height = Math.round(size.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(scale, scale);
  await ensureFonts(page);
  await preloadImages(page);

  if (!opts.transparent) {
    await drawBackground(ctx, page.background, size.width, size.height);
  }
  for (const el of page.elements) {
    await drawElement(ctx, el, scale);
  }
  return canvas;
}

export async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Export failed'))), type, quality);
  });
}
