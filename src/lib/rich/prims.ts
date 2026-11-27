import { FONT_CSS_STACK } from '../fonts';

export type Prim =
  | {
      k: 'rect';
      x: number;
      y: number;
      w: number;
      h: number;
      r?: number;
      fill?: string;
      stroke?: string;
      sw?: number;
      dash?: string;
      opacity?: number;
    }
  | {
      k: 'path';
      d: string;
      fill?: string;
      stroke?: string;
      sw?: number;
      cap?: 'butt' | 'round' | 'square';
      join?: 'miter' | 'round' | 'bevel';
      dash?: string;
      opacity?: number;
      evenodd?: boolean;
    }
  | {
      k: 'circle';
      cx: number;
      cy: number;
      r: number;
      fill?: string;
      stroke?: string;
      sw?: number;
      opacity?: number;
    }
  | {
      k: 'text';
      x: number;
      y: number;
      text: string;
      size: number;
      family: string;
      weight: number;
      color: string;
      anchor: 'start' | 'middle' | 'end';
      baseline: 'middle' | 'alphabetic';
      italic?: boolean;
      rotate?: number;
      opacity?: number;
      stroke?: string;
      sw?: number;
    }
  | {
      k: 'image';
      x: number;
      y: number;
      w: number;
      h: number;
      src: string;
      fit: 'cover' | 'contain';
      zoom?: number;
      offsetX?: number;
      offsetY?: number;
      clipD?: string;
      r?: number;
      opacity?: number;
    };

const n = (v: number) => (Number.isFinite(v) ? Number(v.toFixed(2)) : 0);

export function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function primsToSvg(
  prims: Prim[],
  w: number,
  h: number,
  opts?: { imageHref?: (src: string) => string; innerOnly?: boolean; idPrefix?: string },
): string {
  const defs: string[] = [];
  const body: string[] = [];
  const prefix = opts?.idPrefix ?? `rp${Math.random().toString(36).slice(2, 7)}`;
  let clipSeq = 0;

  for (const p of prims) {
    const op = p.opacity !== undefined && p.opacity !== 1 ? ` opacity="${n(p.opacity)}"` : '';
    if (p.k === 'rect') {
      const rx = p.r ? ` rx="${n(Math.max(0, Math.min(p.r, Math.min(p.w, p.h) / 2)))}"` : '';
      const fill = p.fill ? ` fill="${escXml(p.fill)}"` : ' fill="none"';
      const stroke = p.stroke && (p.sw ?? 1) > 0 ? ` stroke="${escXml(p.stroke)}" stroke-width="${n(p.sw ?? 1)}"` : '';
      const dash = p.dash ? ` stroke-dasharray="${escXml(p.dash)}"` : '';
      body.push(`<rect x="${n(p.x)}" y="${n(p.y)}" width="${n(Math.max(0, p.w))}" height="${n(Math.max(0, p.h))}"${rx}${fill}${stroke}${dash}${op}/>`);
    } else if (p.k === 'path') {
      const fill = p.fill ? ` fill="${escXml(p.fill)}"` : ' fill="none"';
      const rule = p.evenodd ? ' fill-rule="evenodd"' : '';
      const stroke = p.stroke && (p.sw ?? 1) > 0 ? ` stroke="${escXml(p.stroke)}" stroke-width="${n(p.sw ?? 1)}"` : '';
      const cap = p.cap ? ` stroke-linecap="${p.cap}"` : '';
      const join = p.join ? ` stroke-linejoin="${p.join}"` : '';
      const dash = p.dash ? ` stroke-dasharray="${escXml(p.dash)}"` : '';
      body.push(`<path d="${escXml(p.d)}"${fill}${rule}${stroke}${cap}${join}${dash}${op}/>`);
    } else if (p.k === 'circle') {
      const fill = p.fill ? ` fill="${escXml(p.fill)}"` : ' fill="none"';
      const stroke = p.stroke && (p.sw ?? 1) > 0 ? ` stroke="${escXml(p.stroke)}" stroke-width="${n(p.sw ?? 1)}"` : '';
      body.push(`<circle cx="${n(p.cx)}" cy="${n(p.cy)}" r="${n(Math.max(0, p.r))}"${fill}${stroke}${op}/>`);
    } else if (p.k === 'text') {
      const rot = p.rotate ? ` transform="rotate(${n(p.rotate)} ${n(p.x)} ${n(p.y)})"` : '';
      const italic = p.italic ? ' font-style="italic"' : '';
      const stroke = p.stroke && p.sw ? ` stroke="${escXml(p.stroke)}" stroke-width="${n(p.sw)}" stroke-linejoin="round" paint-order="stroke"` : '';
      const baseline = p.baseline === 'middle' ? 'central' : 'alphabetic';
      body.push(
        `<text x="${n(p.x)}" y="${n(p.y)}" font-family="${escXml(FONT_CSS_STACK(p.family))}" font-size="${n(p.size)}" font-weight="${p.weight}"${italic} fill="${escXml(p.color)}" text-anchor="${p.anchor}" dominant-baseline="${baseline}" xml:space="preserve"${stroke}${rot}${op}>${escXml(p.text)}</text>`,
      );
    } else if (p.k === 'image') {
      const href = opts?.imageHref ? opts.imageHref(p.src) : p.src;
      const cid = `${prefix}c${++clipSeq}`;
      if (p.clipD) {
        defs.push(`<clipPath id="${cid}"><path d="${escXml(p.clipD)}"/></clipPath>`);
      } else {
        const r = p.r ?? 0;
        defs.push(`<clipPath id="${cid}"><rect x="${n(p.x)}" y="${n(p.y)}" width="${n(p.w)}" height="${n(p.h)}" rx="${n(r)}"/></clipPath>`);
      }
      if (!href) {
        body.push(`<rect x="${n(p.x)}" y="${n(p.y)}" width="${n(p.w)}" height="${n(p.h)}" rx="${n(p.r ?? 0)}" fill="#e5e1d8"/>`);
        continue;
      }
      const zoom = Math.max(1, p.zoom ?? 1);
      const ox = (p.offsetX ?? 0) * p.w;
      const oy = (p.offsetY ?? 0) * p.h;
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;
      const tr = zoom !== 1 || ox !== 0 || oy !== 0 ? ` transform="translate(${n(cx)} ${n(cy)}) scale(${n(zoom)}) translate(${n(-cx + ox)} ${n(-cy + oy)})"` : '';
      const par = p.fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice';
      body.push(
        `<g clip-path="url(#${cid})"${op}><g${tr}><image href="${escXml(href)}" x="${n(p.x)}" y="${n(p.y)}" width="${n(p.w)}" height="${n(p.h)}" preserveAspectRatio="${par}"/></g></g>`,
      );
    }
  }

  const inner = `${defs.length ? `<defs>${defs.join('')}</defs>` : ''}${body.join('')}`;
  if (opts?.innerOnly) return inner;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(Math.max(1, w))} ${n(Math.max(1, h))}" width="100%" height="100%">${inner}</svg>`;
}

export function drawPrims(
  ctx: CanvasRenderingContext2D,
  prims: Prim[],
  resolveImg: (src: string) => HTMLImageElement | null,
) {
  for (const p of prims) {
    ctx.save();
    if (p.opacity !== undefined) ctx.globalAlpha *= p.opacity;

    if (p.k === 'rect') {
      ctx.beginPath();
      if (p.r && p.r > 0) {
        ctx.roundRect(p.x, p.y, Math.max(0, p.w), Math.max(0, p.h), Math.min(p.r, p.w / 2, p.h / 2));
      } else {
        ctx.rect(p.x, p.y, Math.max(0, p.w), Math.max(0, p.h));
      }
      if (p.fill && p.fill !== 'none') {
        ctx.fillStyle = p.fill;
        ctx.fill();
      }
      if (p.stroke && p.stroke !== 'none' && (p.sw ?? 1) > 0) {
        if (p.dash) ctx.setLineDash(p.dash.split(/[\s,]+/).map(Number).filter(v => Number.isFinite(v) && v >= 0));
        ctx.strokeStyle = p.stroke;
        ctx.lineWidth = p.sw ?? 1;
        ctx.stroke();
      }
    } else if (p.k === 'path') {
      const path = new Path2D(p.d);
      if (p.fill && p.fill !== 'none') {
        ctx.fillStyle = p.fill;
        if (p.evenodd) ctx.fill(path, 'evenodd');
        else ctx.fill(path);
      }
      if (p.stroke && p.stroke !== 'none' && (p.sw ?? 1) > 0) {
        if (p.dash) ctx.setLineDash(p.dash.split(/[\s,]+/).map(Number).filter(v => Number.isFinite(v) && v >= 0));
        ctx.strokeStyle = p.stroke;
        ctx.lineWidth = p.sw ?? 1;
        if (p.cap) ctx.lineCap = p.cap;
        if (p.join) ctx.lineJoin = p.join;
        ctx.stroke(path);
      }
    } else if (p.k === 'circle') {
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, Math.max(0, p.r), 0, Math.PI * 2);
      if (p.fill && p.fill !== 'none') {
        ctx.fillStyle = p.fill;
        ctx.fill();
      }
      if (p.stroke && p.stroke !== 'none' && (p.sw ?? 1) > 0) {
        ctx.strokeStyle = p.stroke;
        ctx.lineWidth = p.sw ?? 1;
        ctx.stroke();
      }
    } else if (p.k === 'text') {
      ctx.font = `${p.italic ? 'italic ' : ''}${p.weight} ${p.size}px ${FONT_CSS_STACK(p.family)}`;
      ctx.textAlign = p.anchor === 'middle' ? 'center' : p.anchor === 'end' ? 'right' : 'left';
      ctx.textBaseline = p.baseline === 'middle' ? 'middle' : 'alphabetic';
      ctx.translate(p.x, p.y);
      if (p.rotate) ctx.rotate((p.rotate * Math.PI) / 180);
      if (p.stroke && p.sw) {
        ctx.strokeStyle = p.stroke;
        ctx.lineWidth = p.sw;
        ctx.lineJoin = 'round';
        ctx.strokeText(p.text, 0, 0);
      }
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, 0, 0);
    } else if (p.k === 'image') {
      ctx.beginPath();
      if (p.clipD) {
        ctx.clip(new Path2D(p.clipD));
      } else if (p.r && p.r > 0) {
        ctx.roundRect(p.x, p.y, Math.max(0, p.w), Math.max(0, p.h), Math.min(p.r, p.w / 2, p.h / 2));
        ctx.clip();
      } else {
        ctx.rect(p.x, p.y, Math.max(0, p.w), Math.max(0, p.h));
        ctx.clip();
      }
      const img = p.src ? resolveImg(p.src) : null;
      if (img && img.naturalWidth > 0) {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const ratio = p.fit === 'contain' ? Math.min(p.w / iw, p.h / ih) : Math.max(p.w / iw, p.h / ih);
        const dw = iw * ratio;
        const dh = ih * ratio;
        const zoom = Math.max(1, p.zoom ?? 1);
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.scale(zoom, zoom);
        ctx.translate((p.offsetX ?? 0) * p.w, (p.offsetY ?? 0) * p.h);
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      } else {
        ctx.fillStyle = '#e5e1d8';
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }
    }
    ctx.restore();
  }
}

export function primFonts(prims: Prim[]): { family: string; weight: number; italic?: boolean }[] {
  const seen = new Set<string>();
  const out: { family: string; weight: number; italic?: boolean }[] = [];
  for (const p of prims) {
    if (p.k !== 'text') continue;
    const key = `${p.family}|${p.weight}|${p.italic ? 1 : 0}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ family: p.family, weight: p.weight, italic: p.italic });
    }
  }
  return out;
}

export function primImages(prims: Prim[]): string[] {
  const seen = new Set<string>();
  for (const p of prims) {
    if (p.k === 'image' && p.src) seen.add(p.src);
  }
  return [...seen];
}

let _mCtx: CanvasRenderingContext2D | null = null;
export function measurePrimCtx(): CanvasRenderingContext2D {
  if (_mCtx) return _mCtx;
  const c = document.createElement('canvas');
  _mCtx = c.getContext('2d')!;
  return _mCtx;
}
