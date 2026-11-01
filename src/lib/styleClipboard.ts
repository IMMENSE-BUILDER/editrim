import type { El } from './types';

export type StylePayload = {
  type: El['type'];
  style: Record<string, unknown>;
  label: string;
};

const COMMON = ['opacity', 'shadow'] as const;

const TEXT = [
  'fontFamily', 'fontSize', 'fontWeight', 'italic', 'underline', 'uppercase',
  'color', 'align', 'valign', 'lineHeight', 'letterSpacing', 'background',
  'backgroundRadius', 'padding', 'strokeColor', 'strokeWidth',
] as const;

const SHAPE = ['fill', 'stroke', 'strokeWidth', 'radius', 'dash'] as const;
const IMAGE = ['fit', 'radius', 'filters', 'flipX', 'flipY', 'overlay', 'overlayOpacity'] as const;
const ICON = ['color', 'strokeWidth'] as const;

function pick(el: El, keys: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const source = el as unknown as Record<string, unknown>;
  keys.forEach(key => {
    if (source[key] !== undefined) out[key] = structuredClone(source[key]);
  });
  return out;
}

export function copyStyle(el: El): StylePayload {
  const keys =
    el.type === 'text' ? [...TEXT, ...COMMON]
      : el.type === 'shape' ? [...SHAPE, ...COMMON]
        : el.type === 'image' ? [...IMAGE, ...COMMON]
          : [...ICON, ...COMMON];
  const label = el.type === 'text' ? 'text style' : `${el.type} style`;
  return { type: el.type, style: pick(el, keys), label };
}

export function pasteStyle(el: El, payload: StylePayload): Partial<El> | null {
  if (el.type !== payload.type) return null;
  return structuredClone(payload.style) as Partial<El>;
}
