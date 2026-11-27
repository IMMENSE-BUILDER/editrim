import { FONT_CSS_STACK } from '../fonts';
import type { TableElement, TableMerge } from '../types';
import { evaluateTable } from './formula';
import { measurePrimCtx, type Prim } from './prims';

function normalizedFractions(arr: number[] | undefined, count: number): number[] {
  if (!arr || arr.length !== count) {
    return Array.from({ length: count }, () => 1 / Math.max(1, count));
  }
  const sum = arr.reduce((a, b) => a + Math.max(0.02, b), 0) || 1;
  return arr.map(v => Math.max(0.02, v) / sum);
}

function fitCellText(text: string, maxW: number, fontSize: number, family: string, weight: number): string {
  if (!text || maxW <= 4) return '';
  const ctx = measurePrimCtx();
  ctx.font = `${weight} ${fontSize}px ${FONT_CSS_STACK(family)}`;
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 0 && ctx.measureText(`${s}…`).width > maxW) {
    s = s.slice(0, -1);
  }
  return s ? `${s}…` : '…';
}

export function buildTablePrims(el: TableElement): Prim[] {
  const rows = Math.max(1, el.cells.length);
  const cols = Math.max(1, el.cells[0]?.length ?? 1);
  const colFracs = normalizedFractions(el.colWidths, cols);
  const rowFracs = normalizedFractions(el.rowHeights, rows);

  const xs: number[] = [0];
  colFracs.forEach((f, i) => xs.push(xs[i] + f * el.w));
  const ys: number[] = [0];
  rowFracs.forEach((f, i) => ys.push(ys[i] + f * el.h));

  const evaluated = evaluateTable(el.cells);
  const merges = el.merges ?? [];
  const mergeMaster = new Map<string, TableMerge>();
  const hiddenByMerge = new Set<string>();

  for (const m of merges) {
    if (m.r >= rows || m.c >= cols) continue;
    const rs = Math.max(1, Math.min(m.rs, rows - m.r));
    const cs = Math.max(1, Math.min(m.cs, cols - m.c));
    mergeMaster.set(`${m.r},${m.c}`, { r: m.r, c: m.c, rs, cs });
    for (let rr = m.r; rr < m.r + rs; rr++) {
      for (let cc = m.c; cc < m.c + cs; cc++) {
        if (rr !== m.r || cc !== m.c) hiddenByMerge.add(`${rr},${cc}`);
      }
    }
  }

  const prims: Prim[] = [];
  const pad = Math.max(2, el.padding ?? 10);
  const sw = Math.max(0, el.borderWidth ?? 1);
  const family = el.fontFamily || 'Inter';
  const fontSize = Math.max(8, el.fontSize || 14);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      if (hiddenByMerge.has(key)) continue;
      const merge = mergeMaster.get(key);
      const rs = merge?.rs ?? 1;
      const cs = merge?.cs ?? 1;
      const x = xs[c];
      const y = ys[r];
      const w = xs[c + cs] - x;
      const h = ys[r + rs] - y;

      const isHeader = el.header && r === 0;
      const fill = isHeader
        ? el.headerFill || '#14130F'
        : r % 2 === 1 && el.altFill
          ? el.altFill
          : el.fill || '#FFFFFF';

      prims.push({
        k: 'rect',
        x,
        y,
        w,
        h,
        fill,
        stroke: sw > 0 ? el.borderColor || '#D9D4C8' : undefined,
        sw,
      });

      const rawVal = evaluated[r]?.[c];
      const textStr = rawVal === undefined || rawVal === null ? '' : String(rawVal);
      if (textStr) {
        const weight = isHeader ? 700 : 500;
        const display = fitCellText(textStr, w - pad * 2, fontSize, family, weight);
        const anchor = el.align === 'center' ? 'middle' : el.align === 'right' ? 'end' : 'start';
        const tx =
          el.align === 'center' ? x + w / 2 : el.align === 'right' ? x + w - pad : x + pad;
        prims.push({
          k: 'text',
          x: tx,
          y: y + h / 2,
          text: display,
          size: fontSize,
          family,
          weight,
          color: isHeader ? el.headerColor || '#FFFFFF' : el.textColor || '#14130F',
          anchor,
          baseline: 'middle',
        });
      }
    }
  }

  return prims;
}
