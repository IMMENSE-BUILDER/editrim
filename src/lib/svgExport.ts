import type { Background, Design, DesignSize, ImageElement, MaskKind, Page, Paint, ShapeElement, Shadow, TextElement } from './types';
import { FONT_CSS_STACK } from './fonts';
import { iconById } from './icons';
import { fontString } from './render';
import { resolveSrc } from './storage';
import { downloadBlob, safeFilename } from './utils';

/* ------------------------------------------------------------------ *
 * Scalar helpers
 * ------------------------------------------------------------------ */

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const esc = (value: string | number) => String(value).replace(/[&<>"']/g, ch => XML_ESCAPES[ch]);

/** Compact number output — SVG carries a lot of coordinates. */
const n = (value: number) => {
  const r = Math.round(value * 1000) / 1000;
  return Object.is(r, -0) ? '0' : String(r);
};

/* ------------------------------------------------------------------ *
 * Text measuring — mirrors the canvas wrapper in render.ts
 * ------------------------------------------------------------------ */

let measure: CanvasRenderingContext2D | null = null;

function measureCtx(): CanvasRenderingContext2D {
  if (!measure) measure = document.createElement('canvas').getContext('2d')!;
  return measure;
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

function layoutText(el: TextElement): { line: string; width: number }[] {
  const ctx = measureCtx();
  ctx.font = fontString(el);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${el.letterSpacing}px`;
  const text = el.uppercase ? el.text.toUpperCase() : el.text;
  const innerW = Math.max(10, el.w - (el.padding ?? 0) * 2);
  return wrapLines(ctx, text, innerW).map(line => ({ line, width: ctx.measureText(line).width }));
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

/* ------------------------------------------------------------------ *
 * Geometry — same maths as the Canvas renderer
 * ------------------------------------------------------------------ */

function starPoints(w: number, h: number, points = 5, inner = 0.42) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? 1 : inner;
    pts.push(`${n(w / 2 + Math.cos(a) * (w / 2) * rr)},${n(h / 2 + Math.sin(a) * (h / 2) * rr)}`);
  }
  return pts.join(' ');
}

function burstPoints(w: number, h: number, points = 12) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? 1 : 0.76;
    pts.push(`${n(w / 2 + Math.cos(a) * (w / 2) * rr)},${n(h / 2 + Math.sin(a) * (h / 2) * rr)}`);
  }
  return pts.join(' ');
}

function shapePathData(el: ShapeElement): string {
  const { w, h } = el;
  switch (el.shape) {
    case 'triangle':
      return `M ${n(w / 2)} 0 L ${n(w)} ${n(h)} L 0 ${n(h)} Z`;
    case 'diamond':
      return `M ${n(w / 2)} 0 L ${n(w)} ${n(h / 2)} L ${n(w / 2)} ${n(h)} L 0 ${n(h / 2)} Z`;
    case 'hexagon':
      return `M ${n(w * 0.25)} 0 L ${n(w * 0.75)} 0 L ${n(w)} ${n(h / 2)} L ${n(w * 0.75)} ${n(h)} L ${n(w * 0.25)} ${n(h)} L 0 ${n(h / 2)} Z`;
    case 'arrow':
      return `M 0 ${n(h * 0.3)} L ${n(w * 0.64)} ${n(h * 0.3)} L ${n(w * 0.64)} 0 L ${n(w)} ${n(h / 2)} L ${n(w * 0.64)} ${n(h)} L ${n(w * 0.64)} ${n(h * 0.7)} L 0 ${n(h * 0.7)} Z`;
    case 'wave':
      return `M 0 ${n(h * 0.35)} C ${n(w * 0.25)} 0 ${n(w * 0.4)} ${n(h * 0.7)} ${n(w * 0.62)} ${n(h * 0.35)} C ${n(w * 0.78)} ${n(h * 0.1)} ${n(w * 0.88)} ${n(h * 0.3)} ${n(w)} ${n(h * 0.22)} L ${n(w)} ${n(h)} L 0 ${n(h)} Z`;
    case 'blob': {
      const cx = w / 2;
      const cy = h / 2;
      const rx = w / 2;
      const ry = h / 2;
      return [
        `M ${n(cx)} ${n(cy - ry)}`,
        `C ${n(cx + rx * 0.66)} ${n(cy - ry)} ${n(cx + rx)} ${n(cy - ry * 0.45)} ${n(cx + rx * 0.92)} ${n(cy + ry * 0.08)}`,
        `C ${n(cx + rx * 0.84)} ${n(cy + ry * 0.62)} ${n(cx + rx * 0.4)} ${n(cy + ry)} ${n(cx - rx * 0.04)} ${n(cy + ry * 0.94)}`,
        `C ${n(cx - rx * 0.56)} ${n(cy + ry * 0.88)} ${n(cx - rx)} ${n(cy + ry * 0.44)} ${n(cx - rx * 0.96)} ${n(cy - ry * 0.02)}`,
        `C ${n(cx - rx * 0.92)} ${n(cy - ry * 0.52)} ${n(cx - rx * 0.48)} ${n(cy - ry)} ${n(cx)} ${n(cy - ry)}`,
        'Z',
      ].join(' ');
    }
    case 'heart': {
      const y = h * 0.16;
      const hh = h * 0.8;
      const ww = w;
      return [
        `M ${n(ww / 2)} ${n(y + hh)}`,
        `C ${n(ww * 0.02)} ${n(y + hh * 0.62)} ${n(0)} ${n(y + hh * 0.1)} ${n(ww * 0.26)} ${n(y + hh * 0.06)}`,
        `C ${n(ww * 0.4)} ${n(y + hh * 0.02)} ${n(ww * 0.47)} ${n(y + hh * 0.16)} ${n(ww / 2)} ${n(y + hh * 0.26)}`,
        `C ${n(ww * 0.53)} ${n(y + hh * 0.16)} ${n(ww * 0.6)} ${n(y + hh * 0.02)} ${n(ww * 0.74)} ${n(y + hh * 0.06)}`,
        `C ${n(ww)} ${n(y + hh * 0.1)} ${n(ww * 0.98)} ${n(y + hh * 0.62)} ${n(ww / 2)} ${n(y + hh)}`,
        'Z',
      ].join(' ');
    }
    case 'ring': {
      const orx = w / 2;
      const ory = h / 2;
      const irx = w * 0.31;
      const iry = h * 0.31;
      return `M 0 ${n(h / 2)} a ${n(orx)} ${n(ory)} 0 1 0 ${n(w)} 0 a ${n(orx)} ${n(ory)} 0 1 0 ${n(-w)} 0 Z M ${n(w / 2 - irx)} ${n(h / 2)} a ${n(irx)} ${n(iry)} 0 1 1 ${n(irx * 2)} 0 a ${n(irx)} ${n(iry)} 0 1 1 ${n(-irx * 2)} 0 Z`;
    }
    default:
      return '';
  }
}

/** Clip node for an image frame. `none`/`rect` share the rounded rect. */
function maskNode(mask: MaskKind | undefined, w: number, h: number, radius: number): string {
  if (!mask || mask === 'none' || mask === 'rect') {
    return `<rect width="${n(w)}" height="${n(h)}" rx="${n(Math.max(0, Math.min(radius, Math.min(w, h) / 2)))}"/>`;
  }
  if (mask === 'ellipse') {
    return `<ellipse cx="${n(w / 2)}" cy="${n(h / 2)}" rx="${n(w / 2)}" ry="${n(h / 2)}"/>`;
  }
  if (mask === 'star') {
    return `<polygon points="${starPoints(w, h)}"/>`;
  }
  return `<path d="${shapePathData({ shape: mask, w, h } as ShapeElement)}"/>`;
}

/* ------------------------------------------------------------------ *
 * Remote assets
 * ------------------------------------------------------------------ */

const embedded = new Map<string, Promise<string>>();
const loadable = new Map<string, Promise<boolean>>();

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Try to inline the photo as a data URL; fall back to the source URL when CORS says no. */
function embedImage(src: string): Promise<string> {
  const cached = embedded.get(src);
  if (cached) return cached;
  const job = (async () => {
    let resolved = src;
    try {
      resolved = await resolveSrc(src);
    } catch {
      resolved = src;
    }
    if (!resolved) return '';
    if (resolved.startsWith('data:')) return resolved;
    try {
      const res = await fetch(resolved, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await readAsDataUrl(await res.blob());
    } catch {
      return resolved;
    }
  })();
  embedded.set(src, job);
  return job;
}

/** Does the browser actually paint this source? Failed photos become a placeholder. */
function imageLoads(src: string): Promise<boolean> {
  if (!src) return Promise.resolve(false);
  const cached = loadable.get(src);
  if (cached) return cached;
  const job = new Promise<boolean>(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0 && img.naturalHeight > 0);
    img.onerror = () => resolve(false);
    img.src = src;
  });
  loadable.set(src, job);
  return job;
}

/* ------------------------------------------------------------------ *
 * Page renderer
 * ------------------------------------------------------------------ */

export async function renderPageSvg(page: Page, size: DesignSize): Promise<string> {
  await ensureFonts(page);

  const W = size.width;
  const H = size.height;
  const defs: string[] = [];
  const body: string[] = [];
  const shadows = new Map<string, string>();
  let seq = 0;
  const nextId = (prefix: string) => `${prefix}${++seq}`;

  const shadowAttr = (shadow?: Shadow | null) => {
    if (!shadow) return '';
    const key = `${shadow.x}|${shadow.y}|${shadow.blur}|${shadow.color}`;
    let id = shadows.get(key);
    if (!id) {
      id = nextId('shadow');
      shadows.set(key, id);
      defs.push(
        `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%">` +
          `<feDropShadow dx="${n(shadow.x)}" dy="${n(shadow.y)}" stdDeviation="${n(shadow.blur / 2)}" flood-color="${esc(shadow.color)}"/>` +
          `</filter>`,
      );
    }
    return ` filter="url(#${id})"`;
  };

  const paintFill = (paint: Paint | undefined, w: number, h: number) => {
    if (!paint || paint.kind === 'none') return 'none';
    if (paint.kind === 'solid') return paint.color;
    const id = nextId('grad');
    const angle = ((paint.angle - 90) * Math.PI) / 180;
    const len = Math.abs(w * Math.sin(angle)) + Math.abs(h * Math.cos(angle));
    const dx = Math.cos(angle) * (len / 2);
    const dy = Math.sin(angle) * (len / 2);
    defs.push(
      `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n(w / 2 - dx)}" y1="${n(h / 2 - dy)}" x2="${n(w / 2 + dx)}" y2="${n(h / 2 + dy)}">` +
        `<stop offset="0" stop-color="${esc(paint.from)}"/><stop offset="1" stop-color="${esc(paint.to)}"/>` +
        `</linearGradient>`,
    );
    return `url(#${id})`;
  };

  /* ---------- background ---------- */

  const bg: Background = page.background;
  if (bg.kind === 'solid') {
    body.push(`<rect width="${n(W)}" height="${n(H)}" fill="${esc(bg.color)}"/>`);
  } else if (bg.kind === 'linear') {
    const fill = paintFill({ kind: 'linear', from: bg.from, to: bg.to, angle: bg.angle }, W, H);
    body.push(`<rect width="${n(W)}" height="${n(H)}" fill="${esc(fill)}"/>`);
  } else {
    const href = await embedImage(bg.src);
    const ok = href ? await imageLoads(href) : false;
    if (ok) {
      const pageClip = nextId('pageClip');
      defs.push(`<clipPath id="${pageClip}"><rect width="${n(W)}" height="${n(H)}"/></clipPath>`);
      const blur = bg.blur ?? 0;
      const pad = blur ? blur * 2 : 0;
      let filter = '';
      if (blur) {
        const id = nextId('bgblur');
        defs.push(`<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${n(blur / 2)}"/></filter>`);
        filter = ` filter="url(#${id})"`;
      }
      body.push(
        `<g clip-path="url(#${pageClip})">` +
          `<image href="${esc(href)}" x="${n(-pad)}" y="${n(-pad)}" width="${n(W + pad * 2)}" height="${n(H + pad * 2)}" preserveAspectRatio="xMidYMid slice"${filter}/>` +
          `</g>`,
      );
    } else {
      body.push(`<rect width="${n(W)}" height="${n(H)}" fill="#E7E4DC"/>`);
    }
    if (bg.overlay) {
      body.push(`<rect width="${n(W)}" height="${n(H)}" fill="${esc(bg.overlay)}" opacity="${n(bg.overlayOpacity ?? 0.4)}"/>`);
    }
  }

  /* ---------- elements ---------- */

  const wrap = (el: { x: number; y: number; w: number; h: number; rotation: number; opacity: number }, inner: string) => {
    const cx = el.x + el.w / 2;
    const cy = el.y + el.h / 2;
    const transform = `translate(${n(cx)} ${n(cy)}) rotate(${n(el.rotation)}) translate(${n(-el.w / 2)} ${n(-el.h / 2)})`;
    return `<g transform="${transform}" opacity="${n(el.opacity ?? 1)}">${inner}</g>`;
  };

  const shapeInner = (el: ShapeElement) => {
    const stroke = el.stroke === 'transparent' ? 'none' : el.stroke;
    const sw = el.strokeWidth || 0;
    const dash = el.dash ? ` stroke-dasharray="${n(sw * 3)} ${n(sw * 2)}"` : '';
    const common = `fill="${esc(paintFill(el.fill, el.w, el.h))}" stroke="${esc(stroke)}" stroke-width="${n(sw)}" stroke-linejoin="round" stroke-linecap="round"${dash}${shadowAttr(el.shadow)}`;
    if (el.shape === 'rect') {
      return `<rect width="${n(el.w)}" height="${n(el.h)}" rx="${n(Math.max(0, Math.min(el.radius, Math.min(el.w, el.h) / 2)))}" ${common}/>`;
    }
    if (el.shape === 'ellipse') {
      return `<ellipse cx="${n(el.w / 2)}" cy="${n(el.h / 2)}" rx="${n(el.w / 2)}" ry="${n(el.h / 2)}" ${common}/>`;
    }
    if (el.shape === 'line') {
      return `<path d="M 0 ${n(el.h / 2)} L ${n(el.w)} ${n(el.h / 2)}" fill="none" stroke="${esc(stroke)}" stroke-width="${n(sw)}" stroke-linecap="round"${dash}${shadowAttr(el.shadow)}/>`;
    }
    if (el.shape === 'star') {
      return `<polygon points="${starPoints(el.w, el.h)}" ${common}/>`;
    }
    if (el.shape === 'burst') {
      return `<polygon points="${burstPoints(el.w, el.h)}" ${common}/>`;
    }
    const rule = el.shape === 'ring' ? ' fill-rule="evenodd"' : '';
    return `<path d="${shapePathData(el)}"${rule} ${common}/>`;
  };

  const textInner = (el: TextElement) => {
    const parts: string[] = [];
    if (el.background && el.background.kind !== 'none') {
      const fill = paintFill(el.background, el.w, el.h);
      parts.push(`<rect width="${n(el.w)}" height="${n(el.h)}" rx="${n(el.backgroundRadius ?? 0)}" fill="${esc(fill)}"/>`);
    }

    const pad = el.padding ?? 0;
    const lines = layoutText(el);
    const lineH = el.fontSize * el.lineHeight;
    const totalH = lines.length * lineH;
    let top = pad;
    if (el.valign === 'middle') top = (el.h - totalH) / 2;
    else if (el.valign === 'bottom') top = el.h - pad - totalH;

    const anchor = el.align === 'center' ? 'middle' : el.align === 'right' ? 'end' : 'start';
    const anchorX = el.align === 'center' ? el.w / 2 : el.align === 'right' ? el.w - pad : pad;

    const fontAttrs =
      `font-family="${esc(FONT_CSS_STACK(el.fontFamily))}" font-size="${n(el.fontSize)}" font-weight="${el.fontWeight}"` +
      `${el.italic ? ' font-style="italic"' : ''}${el.letterSpacing ? ` letter-spacing="${n(el.letterSpacing)}"` : ''}` +
      ` fill="${esc(el.color)}" text-anchor="${anchor}" dominant-baseline="text-before-edge" xml:space="preserve"` +
      `${el.strokeWidth && el.strokeColor ? ` stroke="${esc(el.strokeColor)}" stroke-width="${n(el.strokeWidth)}" stroke-linejoin="round"` : ''}`;

    const tspans: string[] = [];
    const underlineNodes: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const { line, width } = lines[i];
      const y = top + i * lineH + (lineH - el.fontSize) / 2;
      if (line) {
        tspans.push(`<tspan x="${n(anchorX)}" y="${n(y)}">${esc(line)}</tspan>`);
      }
      if (el.underline && width > 0) {
        const startX = anchor === 'middle' ? anchorX - width / 2 : anchor === 'end' ? anchorX - width : anchorX;
        underlineNodes.push(
          `<rect x="${n(startX)}" y="${n(y + el.fontSize * 0.96)}" width="${n(width)}" height="${n(Math.max(1, el.fontSize * 0.045))}" fill="${esc(el.color)}"/>`,
        );
      }
    }
    parts.push(`<g${shadowAttr(el.shadow)}><text ${fontAttrs}>${tspans.join('')}</text>${underlineNodes.join('')}</g>`);
    return parts.join('');
  };

  const imageInner = (el: ImageElement, href: string) => {
    const clipId = nextId('clip');
    defs.push(`<clipPath id="${clipId}">${maskNode(el.mask, el.w, el.h, el.radius)}</clipPath>`);

    if (!href) {
      return `<rect width="${n(el.w)}" height="${n(el.h)}" rx="${n(el.radius)}" fill="#E7E4DC"/>`;
    }

    const f = el.filters;
    const filter =
      `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) ` +
      `blur(${n(f.blur)}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hue}deg)`;
    const zoom = Math.max(1, el.zoom ?? 1);
    const transform =
      `translate(${n(el.w / 2)} ${n(el.h / 2)}) scale(${el.flipX ? -1 : 1} ${el.flipY ? -1 : 1}) ` +
      `scale(${n(zoom)}) translate(${n(-(el.offsetX ?? 0) * el.w)} ${n(-(el.offsetY ?? 0) * el.h)})`;

    const shadowRect = el.shadow
      ? `<rect width="${n(el.w)}" height="${n(el.h)}" rx="${n(el.radius)}" fill="#000000"${shadowAttr(el.shadow)}/>`
      : '';
    const image =
      `<g transform="${transform}">` +
      `<image href="${esc(href)}" x="${n(-el.w / 2)}" y="${n(-el.h / 2)}" width="${n(el.w)}" height="${n(el.h)}" preserveAspectRatio="xMidYMid ${el.fit === 'contain' ? 'meet' : 'slice'}" filter="${esc(filter)}"/>` +
      `</g>`;
    const overlay =
      el.overlay && el.overlayOpacity
        ? `<rect width="${n(el.w)}" height="${n(el.h)}" fill="${esc(el.overlay)}" opacity="${n(el.overlayOpacity)}"/>`
        : '';

    return `${shadowRect}<g clip-path="url(#${clipId})">${image}${overlay}</g>`;
  };

  const iconInner = (el: { icon: string; color: string; strokeWidth?: number; w: number; h: number }) => {
    const icon = iconById(el.icon);
    const s = Math.min(el.w, el.h);
    const transform = `translate(${n(el.w / 2)} ${n(el.h / 2)}) scale(${n(s / 24)}) translate(-12 -12)`;
    const paths = icon.paths.map(d => `<path d="${esc(d)}"/>`).join('');
    return (
      `<g transform="${transform}" fill="none" stroke="${esc(el.color)}" stroke-width="${n(el.strokeWidth ?? 1.8)}" ` +
      `stroke-linecap="round" stroke-linejoin="round">${paths}</g>`
    );
  };

  const sources = new Map<string, string>();
  await Promise.all(
    page.elements.map(async el => {
      if (el.type !== 'image') return;
      const href = await embedImage(el.src);
      sources.set(el.id, href && (await imageLoads(href)) ? href : '');
    }),
  );

  for (const el of page.elements) {
    if (el.hidden) continue;
    if (el.type === 'shape') body.push(wrap(el, shapeInner(el)));
    else if (el.type === 'text') body.push(wrap(el, textInner(el)));
    else if (el.type === 'image') body.push(wrap(el, imageInner(el, sources.get(el.id) ?? '')));
    else if (el.type === 'icon') body.push(wrap(el, iconInner(el)));
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(W)} ${n(H)}" width="${n(W)}" height="${n(H)}">`,
    defs.length ? `<defs>${defs.join('')}</defs>` : '',
    body.join('\n'),
    '</svg>',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function exportSvg(design: Design, pageIndex: number, filename?: string): Promise<void> {
  const page = design.pages[pageIndex] ?? design.pages[0];
  if (!page) throw new Error('Nothing to export');
  const svg = await renderPageSvg(page, design.size);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename ?? `${safeFilename(design.title)}.svg`);
}
