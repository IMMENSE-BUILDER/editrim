import type { GridElement } from '../types';
import type { Prim } from './prims';

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  if (rr <= 0) return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `A ${rr} ${rr} 0 0 1 ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `A ${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x + rr} ${y}`,
    'Z',
  ].join(' ');
}

export function buildGridPrims(el: GridElement): Prim[] {
  const prims: Prim[] = [];
  if (el.bg && el.bg !== 'transparent') {
    prims.push({ k: 'rect', x: 0, y: 0, w: el.w, h: el.h, r: el.radius, fill: el.bg });
  }
  const gap = Math.max(0, el.gap ?? 8);
  const r = Math.max(0, el.radius ?? 8);

  for (const cell of el.cells) {
    const cx = cell.x * el.w + gap / 2;
    const cy = cell.y * el.h + gap / 2;
    const cw = Math.max(8, cell.w * el.w - gap);
    const ch = Math.max(8, cell.h * el.h - gap);

    if (cell.src) {
      prims.push({
        k: 'image',
        x: cx,
        y: cy,
        w: cw,
        h: ch,
        src: cell.src,
        fit: 'cover',
        zoom: cell.zoom,
        offsetX: cell.offsetX,
        offsetY: cell.offsetY,
        clipD: roundedRectPath(cx, cy, cw, ch, r),
        r,
      });
    } else {
      prims.push({
        k: 'rect',
        x: cx,
        y: cy,
        w: cw,
        h: ch,
        r,
        fill: '#ECE8DF',
        stroke: '#C5BFA8',
        sw: 1.5,
        dash: '6 4',
      });
      prims.push({
        k: 'text',
        x: cx + cw / 2,
        y: cy + ch / 2,
        text: 'Drop photo',
        size: Math.max(11, Math.min(18, Math.round(Math.min(cw, ch) * 0.11))),
        family: 'Inter',
        weight: 600,
        color: '#807A6E',
        anchor: 'middle',
        baseline: 'middle',
      });
    }
  }
  return prims;
}
