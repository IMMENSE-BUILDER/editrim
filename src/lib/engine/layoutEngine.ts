import type { DesignSize } from '../types';

export type ReflowMode = 'scale' | 'reflow' | 'hybrid';

export type LayoutBox = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  fontSize?: number;
};

export type ReflowOptions = {
  from: DesignSize;
  to: DesignSize;
  mode?: ReflowMode;
  margin?: number;
  gutter?: number;
  minColumn?: number;
  columns?: number;
  preserveAspect?: boolean;
};

export type ReflowResult<T extends LayoutBox> = {
  elements: T[];
  mode: ReflowMode;
  scale: number;
  overflow: boolean;
  grid: { columns: number; rows: number; gutter: number; margin: number };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function fitAspect(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / width, maxHeight / height);
  return { width: width * scale, height: height * scale, scale };
}

export function responsiveColumns(width: number, minColumn = 220, gutter = 24, margin = 32): number {
  return Math.max(1, Math.floor((width - margin * 2 + gutter) / (minColumn + gutter)));
}

function scaleMode<T extends LayoutBox>(elements: T[], from: DesignSize, to: DesignSize): { elements: T[]; scale: number } {
  const scale = Math.min(to.width / from.width, to.height / from.height);
  const offsetX = (to.width - from.width * scale) / 2;
  const offsetY = (to.height - from.height * scale) / 2;
  return {
    scale,
    elements: elements.map(element => ({
      ...element,
      x: element.x * scale + offsetX,
      y: element.y * scale + offsetY,
      w: Math.max(2, element.w * scale),
      h: Math.max(2, element.h * scale),
      ...(element.fontSize ? { fontSize: Math.max(4, element.fontSize * scale) } : {}),
    })),
  };
}

function reflowMode<T extends LayoutBox>(elements: T[], options: Required<Pick<ReflowOptions, 'to' | 'margin' | 'gutter' | 'minColumn' | 'preserveAspect'>> & { columns?: number }): ReflowResult<T>['elements'] {
  const { to, margin, gutter, minColumn, preserveAspect } = options;
  const available = Math.max(1, to.width - margin * 2);
  const columns = clamp(options.columns ?? responsiveColumns(to.width, minColumn, gutter, margin), 1, Math.max(1, elements.length));
  const sorted = [...elements].sort((a, b) => (Math.abs(a.y - b.y) < 2 ? a.x - b.x : a.y - b.y));
  const rows: T[][] = [];
  for (const element of sorted) {
    const current = rows[rows.length - 1];
    const anchorY = current ? Math.min(...current.map(item => item.y)) : Infinity;
    const tolerance = current ? Math.max(8, Math.max(...current.map(item => item.h)) * 0.35) : 0;
    if (current && Math.abs(element.y - anchorY) <= tolerance) current.push(element);
    else rows.push([element]);
  }
  let cursorY = margin;
  let placed: T[] = [];
  const chunks: T[][] = [];
  rows.forEach(row => {
    for (let i = 0; i < row.length; i += columns) chunks.push(row.slice(i, i + columns));
  });
  chunks.forEach(chunk => {
    const rowColumns = chunk.length;
    const cellWidth = (available - gutter * (rowColumns - 1)) / rowColumns;
    let rowHeight = 0;
    chunk.forEach((element, index) => {
      const width = Math.max(20, cellWidth);
      const height = preserveAspect
        ? Math.max(20, element.h * (width / Math.max(1, element.w)))
        : Math.max(20, element.h);
      rowHeight = Math.max(rowHeight, height);
      placed.push({
        ...element,
        x: margin + index * (cellWidth + gutter),
        y: cursorY,
        w: width,
        h: height,
        ...(element.fontSize ? { fontSize: Math.max(4, element.fontSize * (width / Math.max(1, element.w))) } : {}),
      } as T);
    });
    cursorY += rowHeight + gutter;
  });

  // If the reflowed stack is taller than the target, shrink it into the safe area.
  const bottom = Math.max(margin, ...placed.map(element => element.y + element.h));
  const availableHeight = Math.max(1, to.height - margin * 2);
  const fitScale = bottom - margin > availableHeight ? availableHeight / (bottom - margin) : 1;
  if (fitScale < 1) {
    placed = placed.map(element => ({
      ...element,
      x: margin + (element.x - margin) * fitScale,
      y: margin + (element.y - margin) * fitScale,
      w: element.w * fitScale,
      h: element.h * fitScale,
      ...(element.fontSize ? { fontSize: Math.max(4, element.fontSize * fitScale) } : {}),
    }) as T);
  }
  return placed;
}

/**
 * One layout solver, three policies:
 * - scale: preserve the composition and letterbox it.
 * - reflow: solve rows/columns for the new aspect ratio.
 * - hybrid: scale for near-identical ratios, reflow when the ratio changes > 22%.
 */
export function reflowLayout<T extends LayoutBox>(elements: T[], options: ReflowOptions): ReflowResult<T> {
  const from = options.from;
  const to = options.to;
  const fromRatio = from.width / from.height;
  const toRatio = to.width / to.height;
  const ratioShift = Math.abs(toRatio - fromRatio) / Math.max(0.001, fromRatio);
  const mode: ReflowMode = options.mode ?? 'hybrid';
  const margin = options.margin ?? 32;
  const gutter = options.gutter ?? 24;
  const minColumn = options.minColumn ?? 220;
  const preserveAspect = options.preserveAspect ?? true;

  if (mode === 'scale' || (mode === 'hybrid' && ratioShift <= 0.22)) {
    const scaled = scaleMode(elements, from, to);
    return {
      elements: scaled.elements,
      mode: 'scale',
      scale: scaled.scale,
      overflow: false,
      grid: { columns: 1, rows: elements.length, gutter, margin },
    };
  }

  const placed = reflowMode(elements, { to, margin, gutter, minColumn, preserveAspect, columns: options.columns });
  const columns = options.columns ?? responsiveColumns(to.width, minColumn, gutter, margin);
  const overflow = placed.some(element => element.x < 0 || element.y < 0 || element.x + element.w > to.width + 0.5 || element.y + element.h > to.height + 0.5);
  return {
    elements: placed,
    mode: 'reflow',
    scale: 1,
    overflow,
    grid: { columns, rows: Math.ceil(placed.length / Math.max(1, columns)), gutter, margin },
  };
}

export const LAYOUT_TEST_BOXES: LayoutBox[] = [
  { id: 'headline', x: 96, y: 96, w: 920, h: 120, fontSize: 84 },
  { id: 'body', x: 96, y: 250, w: 560, h: 220, fontSize: 28 },
  { id: 'image', x: 720, y: 250, w: 520, h: 360, fontSize: 0 },
  { id: 'cta', x: 96, y: 520, w: 240, h: 56, fontSize: 18 },
];
