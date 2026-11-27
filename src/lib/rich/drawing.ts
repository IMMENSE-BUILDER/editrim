import { getStroke } from 'perfect-freehand';
import type { DrawingElement, DrawingTool } from '../types';
import type { Prim } from './prims';

const TOOL_OPTS: Record<DrawingTool, { thinning: number; smoothing: number; streamline: number }> = {
  pen: { thinning: 0.45, smoothing: 0.55, streamline: 0.5 },
  marker: { thinning: 0.12, smoothing: 0.5, streamline: 0.45 },
  highlighter: { thinning: 0, smoothing: 0.35, streamline: 0.4 },
};

export function pointsToStrokePath(
  pts: [number, number, number][],
  size: number,
  tool: DrawingTool,
  smoothing?: number,
): string {
  if (pts.length === 0) return '';
  const opts = TOOL_OPTS[tool] ?? TOOL_OPTS.pen;
  const smoothRatio = smoothing !== undefined ? 0.2 + (Math.max(0, Math.min(100, smoothing)) / 100) * 0.65 : null;
  const outline = getStroke(pts, {
    size,
    thinning: opts.thinning,
    smoothing: smoothRatio ?? opts.smoothing,
    streamline: smoothRatio ?? opts.streamline,
    simulatePressure: pts.every(p => p[2] === 0.5),
  });
  if (outline.length === 0) return '';
  const d: string[] = [];
  for (let i = 0; i < outline.length; i++) {
    const [x0, y0] = outline[i];
    const [x1, y1] = outline[(i + 1) % outline.length];
    if (i === 0) d.push(`M ${x0.toFixed(1)} ${y0.toFixed(1)}`);
    const mx = ((x0 + x1) / 2).toFixed(1);
    const my = ((y0 + y1) / 2).toFixed(1);
    d.push(`Q ${x0.toFixed(1)} ${y0.toFixed(1)} ${mx} ${my}`);
  }
  d.push('Z');
  return d.join(' ');
}

export function buildDrawingPrims(el: DrawingElement): Prim[] {
  const sx = el.baseW > 0 ? el.w / el.baseW : 1;
  const sy = el.baseH > 0 ? el.h / el.baseH : 1;
  const sAvg = (sx + sy) / 2;
  const prims: Prim[] = [];

  for (const stroke of el.strokes) {
    if (!stroke.points.length) continue;
    if (stroke.tool === 'highlighter' && stroke.points.length >= 2) {
      const d = stroke.points
        .map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${(px * sx).toFixed(1)} ${(py * sy).toFixed(1)}`)
        .join(' ');
      prims.push({
        k: 'path',
        d,
        stroke: stroke.color,
        sw: Math.max(2, stroke.size * sAvg),
        cap: 'butt',
        join: 'round',
        opacity: 0.35,
      });
      continue;
    }
    const scaled: [number, number, number][] = stroke.points.map(([px, py, pr]) => [px * sx, py * sy, pr]);
    const d = pointsToStrokePath(scaled, Math.max(1.5, stroke.size * sAvg), stroke.tool, stroke.smoothing);
    if (d) {
      prims.push({
        k: 'path',
        d,
        fill: stroke.color,
        opacity: stroke.tool === 'marker' ? 0.88 : 1,
      });
    }
  }

  return prims;
}
