import { FONT_CSS_STACK } from '../fonts';
import type { TextElement } from '../types';
import { measurePrimCtx, type Prim } from './prims';

export function buildCurvedTextPrims(el: TextElement): Prim[] {
  const curve = el.curve ?? 0;
  const line = (el.uppercase ? el.text.toUpperCase() : el.text).replace(/\n+/g, ' ').trim();
  const prims: Prim[] = [];

  if (!line) return prims;

  const ctx = measurePrimCtx();
  ctx.font = `${el.italic ? 'italic ' : ''}${el.fontWeight} ${el.fontSize}px ${FONT_CSS_STACK(el.fontFamily)}`;
  const glyphs = [...line];
  const widths = glyphs.map(g => Math.max(2, ctx.measureText(g).width + (el.letterSpacing || 0)));
  const totalWidth = widths.reduce((a, b) => a + b, 0);

  // Arc radius R = w / (2 * sin(theta/2)) where theta = |curve| / 100 * 2*PI
  const absCurve = Math.min(100, Math.max(2, Math.abs(curve)));
  const theta = Math.min(Math.PI * 1.92, Math.max(0.05, (absCurve / 100) * Math.PI * 2));
  const arcSpanW = Math.max(el.w * 0.82, Math.min(el.w * 0.96, totalWidth));
  const R = Math.max(el.fontSize * 0.9, arcSpanW / (2 * Math.sin(theta / 2)));
  const downward = curve < 0;

  const arcLen = Math.min(totalWidth, R * Math.PI * 1.9);
  const startAngle = -arcLen / (2 * R);
  const cx = el.w / 2;
  const cy = downward ? el.h * 0.34 - R : el.h * 0.66 + R;

  let cursor = 0;
  for (let i = 0; i < glyphs.length; i++) {
    const gw = widths[i];
    const centerS = cursor + gw / 2;
    cursor += gw;
    const angle = startAngle + centerS / R; // radians from top (or bottom)
    const thetaPos = downward ? Math.PI / 2 - angle : -Math.PI / 2 + angle;
    const gx = cx + R * Math.cos(thetaPos);
    const gy = cy + R * Math.sin(thetaPos);
    const deg = downward ? (-angle * 180) / Math.PI : (angle * 180) / Math.PI;

    prims.push({
      k: 'text',
      x: gx,
      y: gy,
      text: glyphs[i],
      size: el.fontSize,
      family: el.fontFamily,
      weight: el.fontWeight,
      italic: el.italic,
      color: el.color,
      anchor: 'middle',
      baseline: 'middle',
      rotate: deg,
      stroke: el.strokeWidth ? el.strokeColor : undefined,
      sw: el.strokeWidth,
    });
  }

  return prims;
}
