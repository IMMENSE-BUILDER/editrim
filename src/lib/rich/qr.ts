import qrcode from 'qrcode-generator';
import type { QrElement } from '../types';
import type { Prim } from './prims';

export function buildQrPrims(el: QrElement): Prim[] {
  const value = (el.value || 'https://editrim.app').trim();
  const qr = qrcode(0, el.ecc || 'M');
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const margin = Math.max(0, Math.min(8, el.margin ?? 2));
  const total = count + margin * 2;
  const side = Math.min(el.w, el.h);
  const mod = side / total;
  const ox = (el.w - side) / 2;
  const oy = (el.h - side) / 2;

  const prims: Prim[] = [
    { k: 'rect', x: 0, y: 0, w: el.w, h: el.h, r: el.rounded ? Math.min(18, side * 0.08) : 0, fill: el.bg || '#FFFFFF' },
  ];

  if (el.rounded) {
    const r = mod * 0.34;
    const inset = mod * 0.06;
    const s = mod - inset * 2;
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (!qr.isDark(row, col)) continue;
        prims.push({
          k: 'rect',
          x: ox + (col + margin) * mod + inset,
          y: oy + (row + margin) * mod + inset,
          w: s,
          h: s,
          r,
          fill: el.fg || '#14130F',
        });
      }
    }
  } else {
    const parts: string[] = [];
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (!qr.isDark(row, col)) continue;
        const x = (ox + (col + margin) * mod).toFixed(2);
        const y = (oy + (row + margin) * mod).toFixed(2);
        const s = (mod + 0.15).toFixed(2);
        parts.push(`M${x} ${y}h${s}v${s}h-${s}Z`);
      }
    }
    if (parts.length) {
      prims.push({ k: 'path', d: parts.join(''), fill: el.fg || '#14130F' });
    }
  }

  return prims;
}
