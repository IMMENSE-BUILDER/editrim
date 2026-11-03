import type { El } from './types';
import { clamp, rotatedBBox, unionRect } from './utils';

/** The minimum amount of layout data Tidy up needs from an element. */
export type TidyTarget = Pick<El, 'id' | 'x' | 'y' | 'w' | 'h' | 'rotation'>;

export type TidyPlacement = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const TIDY_GAP = 24;
export const TIDY_MIN_SIZE = 24;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/** Local tenths rounding — utils.round takes a multiplier, not a precision. */
const tenth = (n: number) => Math.round(n * 10) / 10;

/**
 * Turns a loose selection into a tidy grid.
 *
 * Reading order is top-to-bottom then left-to-right. Cells size themselves to the
 * widest/tallest element in their column/row so nothing overlaps. If the resulting
 * grid is more than 25% larger than the selection bounds it is scaled down
 * uniformly (never below 24px) and anchored to the selection's top-left.
 */
export function computeTidyPositions(elements: TidyTarget[], gap = TIDY_GAP): TidyPlacement[] {
  if (elements.length < 2) return [];

  const boxes = new Map(elements.map(el => [el.id, rotatedBBox(el)]));
  const bounds = unionRect([...boxes.values()]);
  if (!bounds) return [];

  const ordered = [...elements].sort((a, b) => {
    const ba = boxes.get(a.id)!;
    const bb = boxes.get(b.id)!;
    return ba.y - bb.y || ba.x - bb.x || a.id.localeCompare(b.id);
  });

  const count = ordered.length;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const columnOf = (index: number) => index % cols;
  const rowOf = (index: number) => Math.floor(index / cols);

  const measure = (sizes: { w: number; h: number }[]) => {
    const colW = Array.from({ length: cols }, () => 0);
    const rowH = Array.from({ length: rows }, () => 0);
    sizes.forEach((size, index) => {
      const c = columnOf(index);
      const r = rowOf(index);
      colW[c] = Math.max(colW[c], size.w);
      rowH[r] = Math.max(rowH[r], size.h);
    });
    return {
      colW,
      rowH,
      width: sum(colW) + gap * Math.max(0, cols - 1),
      height: sum(rowH) + gap * Math.max(0, rows - 1),
    };
  };

  const natural = measure(ordered);
  const overflows = natural.width > bounds.w * 1.25 || natural.height > bounds.h * 1.25;

  let scale = 1;
  if (overflows) {
    // Gaps stay fixed at 24px, so only the element footprint may shrink.
    const contentW = natural.width - gap * Math.max(0, cols - 1);
    const contentH = natural.height - gap * Math.max(0, rows - 1);
    const availableW = bounds.w - gap * Math.max(0, cols - 1);
    const availableH = bounds.h - gap * Math.max(0, rows - 1);
    const fitW = contentW > 0 ? availableW / contentW : 1;
    const fitH = contentH > 0 ? availableH / contentH : 1;
    scale = clamp(Math.min(fitW, fitH), 0.05, 1);
  }

  const sized = ordered.map(el => ({
    id: el.id,
    w: tenth(scale < 1 ? Math.max(TIDY_MIN_SIZE, el.w * scale) : el.w),
    h: tenth(scale < 1 ? Math.max(TIDY_MIN_SIZE, el.h * scale) : el.h),
  }));

  // Re-measure with the final sizes: the 24px floor can widen a column.
  const grid = measure(sized);

  const colX: number[] = [];
  let cursorX = bounds.x;
  grid.colW.forEach(width => {
    colX.push(cursorX);
    cursorX += width + gap;
  });

  const rowY: number[] = [];
  let cursorY = bounds.y;
  grid.rowH.forEach(height => {
    rowY.push(cursorY);
    cursorY += height + gap;
  });

  return sized.map((size, index) => ({
    id: size.id,
    x: tenth(colX[columnOf(index)]),
    y: tenth(rowY[rowOf(index)]),
    w: size.w,
    h: size.h,
  }));
}
