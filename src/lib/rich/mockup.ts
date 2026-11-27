import type { MockupElement } from '../types';
import type { Prim } from './prims';

export function buildMockupPrims(el: MockupElement): Prim[] {
  const W = el.w;
  const H = el.h;
  const frame = el.frameColor || '#1C1B18';
  const prims: Prim[] = [];

  if (el.device === 'phone') {
    const bw = Math.max(8, Math.min(W, H) * 0.05);
    const r = Math.min(40, Math.min(W, H) * 0.14);
    prims.push({ k: 'rect', x: 0, y: 0, w: W, h: H, r, fill: frame, stroke: 'rgba(255,255,255,0.2)', sw: 2 });
    const sx = bw;
    const sy = bw;
    const sw = Math.max(10, W - bw * 2);
    const sh = Math.max(10, H - bw * 2);
    const sr = Math.max(8, r - bw * 0.7);
    if (el.src) {
      prims.push({ k: 'image', x: sx, y: sy, w: sw, h: sh, src: el.src, fit: 'cover', r: sr });
    } else {
      prims.push({ k: 'rect', x: sx, y: sy, w: sw, h: sh, r: sr, fill: '#F4F1EA' });
    }
    const notchW = sw * 0.34;
    const notchH = Math.max(10, bw * 0.9);
    prims.push({
      k: 'rect',
      x: W / 2 - notchW / 2,
      y: sy + 6,
      w: notchW,
      h: notchH,
      r: notchH / 2,
      fill: frame,
    });
    return prims;
  }

  if (el.device === 'tablet') {
    const bw = Math.max(10, Math.min(W, H) * 0.055);
    const r = Math.min(32, Math.min(W, H) * 0.08);
    prims.push({ k: 'rect', x: 0, y: 0, w: W, h: H, r, fill: frame, stroke: 'rgba(255,255,255,0.18)', sw: 2 });
    const sx = bw;
    const sy = bw;
    const sw = Math.max(10, W - bw * 2);
    const sh = Math.max(10, H - bw * 2);
    const sr = Math.max(6, r - bw * 0.5);
    if (el.src) {
      prims.push({ k: 'image', x: sx, y: sy, w: sw, h: sh, src: el.src, fit: 'cover', r: sr });
    } else {
      prims.push({ k: 'rect', x: sx, y: sy, w: sw, h: sh, r: sr, fill: '#F4F1EA' });
    }
    prims.push({ k: 'circle', cx: W / 2, cy: bw / 2, r: Math.max(3, bw * 0.16), fill: '#55524C' });
    return prims;
  }

  if (el.device === 'laptop') {
    const baseH = Math.max(14, H * 0.08);
    const lidInset = W * 0.07;
    const lidW = W - lidInset * 2;
    const lidH = H - baseH;
    const bw = Math.max(8, Math.min(lidW, lidH) * 0.045);
    prims.push({ k: 'rect', x: lidInset, y: 0, w: lidW, h: lidH, r: 16, fill: frame });
    const sx = lidInset + bw;
    const sy = bw;
    const sw = Math.max(10, lidW - bw * 2);
    const sh = Math.max(10, lidH - bw * 2);
    if (el.src) {
      prims.push({ k: 'image', x: sx, y: sy, w: sw, h: sh, src: el.src, fit: 'cover', r: 8 });
    } else {
      prims.push({ k: 'rect', x: sx, y: sy, w: sw, h: sh, r: 8, fill: '#F4F1EA' });
    }
    prims.push({ k: 'circle', cx: W / 2, cy: bw / 2, r: 3, fill: '#55524C' });
    const trap = `M ${lidInset * 0.35} ${lidH} H ${W - lidInset * 0.35} L ${W} ${H - 3} Q ${W} ${H} ${W - 8} ${H} H 8 Q 0 ${H} 0 ${H - 3} Z`;
    prims.push({ k: 'path', d: trap, fill: '#CFCAC0', stroke: '#9E988C', sw: 1 });
    prims.push({ k: 'rect', x: W * 0.42, y: lidH, w: W * 0.16, h: Math.max(4, baseH * 0.32), r: 2, fill: '#8E887D' });
    return prims;
  }

  if (el.device === 'browser') {
    const barH = Math.max(24, Math.min(38, H * 0.09));
    prims.push({ k: 'rect', x: 0, y: 0, w: W, h: H, r: 14, fill: '#FFFFFF', stroke: '#D5D0C5', sw: 1.5 });
    prims.push({ k: 'rect', x: 0, y: 0, w: W, h: barH, r: 14, fill: frame === '#1C1B18' ? '#F3F0E8' : frame });
    prims.push({ k: 'rect', x: 0, y: barH / 2, w: W, h: barH / 2, fill: frame === '#1C1B18' ? '#F3F0E8' : frame });
    const cy = barH / 2;
    prims.push({ k: 'circle', cx: 18, cy, r: 4.5, fill: '#FF5F56' });
    prims.push({ k: 'circle', cx: 34, cy, r: 4.5, fill: '#FFBD2E' });
    prims.push({ k: 'circle', cx: 50, cy, r: 4.5, fill: '#27C93F' });
    prims.push({ k: 'rect', x: 72, y: cy - 8, w: Math.max(40, W - 96), h: 16, r: 8, fill: 'rgba(0,0,0,0.06)' });
    if (el.src) {
      prims.push({ k: 'image', x: 1, y: barH, w: W - 2, h: Math.max(10, H - barH - 1), src: el.src, fit: 'cover', r: 4 });
    } else {
      prims.push({ k: 'rect', x: 1, y: barH, w: W - 2, h: Math.max(10, H - barH - 1), fill: '#FAF8F3' });
    }
    return prims;
  }

  if (el.device === 'polaroid') {
    const pad = Math.max(12, Math.min(W, H) * 0.07);
    const bot = Math.max(pad * 2.4, H * 0.22);
    prims.push({ k: 'rect', x: 0, y: 0, w: W, h: H, r: 4, fill: '#FFFFFF', stroke: '#E0DBD0', sw: 1.5 });
    const sx = pad;
    const sy = pad;
    const sw = Math.max(10, W - pad * 2);
    const sh = Math.max(10, H - pad - bot);
    if (el.src) {
      prims.push({ k: 'image', x: sx, y: sy, w: sw, h: sh, src: el.src, fit: 'cover' });
    } else {
      prims.push({ k: 'rect', x: sx, y: sy, w: sw, h: sh, fill: '#ECE8DF' });
    }
    return prims;
  }

  // Poster frame
  const outer = Math.max(10, Math.min(W, H) * 0.05);
  const mat = Math.max(14, Math.min(W, H) * 0.08);
  prims.push({ k: 'rect', x: 0, y: 0, w: W, h: H, r: 4, fill: frame });
  prims.push({ k: 'rect', x: outer, y: outer, w: W - outer * 2, h: H - outer * 2, fill: '#F7F4EC' });
  const ix = outer + mat;
  const iy = outer + mat;
  const iw = Math.max(10, W - ix * 2);
  const ih = Math.max(10, H - iy * 2);
  if (el.src) {
    prims.push({ k: 'image', x: ix, y: iy, w: iw, h: ih, src: el.src, fit: 'cover' });
  } else {
    prims.push({ k: 'rect', x: ix, y: iy, w: iw, h: ih, fill: '#E5E0D5' });
  }
  return prims;
}
