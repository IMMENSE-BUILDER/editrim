import type { Background, DesignSize, Page, Template, TextElement } from '../types';
import { T, S, P, NONE } from '../templateKit';

/** Shared types and small utilities for the expanded template packs. */

export type Palette = {
  bg: string;
  ink: string;
  accent: string;
  soft?: string;
  deep?: string;
};

export type TypePair = {
  display: string;
  body: string;
  accent?: string;
};

export type TemplateMeta = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  featured?: boolean;
};

/** Convert a hex colour to rgba. Falls back to the input when it is already rgba. */
export function rgba(hex: string, alpha: number): string {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const luminance = (hex: string): number => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const channel = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** The palette colour that reads on a dark surface. */
export function onDark(p: Palette): string {
  return luminance(p.bg) >= luminance(p.ink) ? p.bg : p.ink;
}

/** The palette colour that reads on a light surface. */
export function onLight(p: Palette): string {
  return luminance(p.bg) >= luminance(p.ink) ? p.ink : p.bg;
}

/** Shrink display type for long strings without letting it collapse. */
export function sizeFor(text: string, base: number, min: number, charsPerLine = 11): number {
  const longest = Math.max(...text.split('\n').map(line => line.length), 1);
  const factor = Math.min(1, charsPerLine / longest);
  return Math.max(min, Math.round(base * factor));
}

export function template(
  meta: TemplateMeta,
  size: DesignSize,
  pages: Page[],
): Template {
  return { ...meta, size, pages };
}

/** A tiny barcode built from editable rules. */
export function barcode(x: number, y: number, width: number, height: number, color: string, bars = 18) {
  const elements = [];
  let cursor = x;
  const gap = width / (bars * 2 + 1);
  for (let i = 0; i < bars; i++) {
    const w = gap * (i % 3 === 0 ? 1.9 : 1);
    elements.push(S('rect', cursor, y, w, height, { fill: color, name: 'Barcode bar' }));
    cursor += w + gap * (i % 4 === 0 ? 1.4 : 0.8);
    if (cursor > x + width) break;
  }
  return elements;
}

export function dept(text: string, x: number, y: number, w: number, color: string, size = 11, align: 'left' | 'center' | 'right' = 'left'): TextElement {
  return T(text, x, y, w, size * 1.8, {
    fontFamily: 'Inter', fontSize: size, fontWeight: 600, letterSpacing: 2.4,
    color, align, uppercase: true,
  });
}

export const hairline = (x: number, y: number, w: number, color: string, thickness = 1) =>
  S('line', x, y, w, thickness, { fill: NONE, stroke: color, strokeWidth: thickness });

export const paperBg = (color: string): Background => ({ kind: 'solid', color });
export const inkBg = (from: string, to: string, angle = 160): Background => ({ kind: 'linear', from, to, angle });
export const solid = (color: string) => P(color);
