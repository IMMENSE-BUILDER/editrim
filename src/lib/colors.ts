import type { El, Page, Paint } from './types';
import { resolveSrc } from './storage';

let probe: CanvasRenderingContext2D | null = null;

function probeContext() {
  if (!probe) {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    probe = c.getContext('2d', { willReadFrequently: true });
  }
  return probe;
}

/** Normalise any CSS colour to #rrggbb; transparent and unparseable colours return null. */
export function normalizeColor(color: string | undefined | null): string | null {
  if (!color || color === 'transparent' || color === 'none') return null;
  const ctx = probeContext();
  if (!ctx) return null;
  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000000';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a < 24) return null;
    return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  } catch {
    return null;
  }
}

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

export function contrastColor(hex: string): string {
  const [r, g, b] = rgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? '#12110e' : '#f8f4ec';
}

function distance(a: string, b: string) {
  const [ar, ag, ab] = rgb(a);
  const [br, bg, bb] = rgb(b);
  return Math.hypot(ar - br, ag - bg, ab - bb);
}

function paintColors(paint: Paint | undefined): string[] {
  if (!paint) return [];
  if (paint.kind === 'solid') return [paint.color];
  if (paint.kind === 'linear') return [paint.from, paint.to];
  return [];
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    if (/^https?:/.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function imagePalette(src: string): Promise<string[]> {
  try {
    const resolved = await resolveSrc(src);
    const img = await loadImage(resolved);
    if (!img) return [];
    const canvas = document.createElement('canvas');
    const w = 48;
    const h = 48;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const buckets = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 120) continue;
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = `#${[r, g, b].map(v => Math.min(255, v).toString(16).padStart(2, '0')).join('')}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color)
      .filter((color, i, all) => all.findIndex(other => distance(color, other) < 42) === i)
      .slice(0, 5);
  } catch {
    return [];
  }
}

/** Build a small, ordered palette from everything selected, including photo pixels. */
export async function paletteFromElements(elements: El[]): Promise<string[]> {
  const scores = new Map<string, number>();
  const add = (color: string | undefined | null, weight = 1) => {
    const hex = normalizeColor(color);
    if (!hex) return;
    scores.set(hex, (scores.get(hex) ?? 0) + weight);
  };

  await Promise.all(elements.map(async el => {
    if (el.type === 'text') {
      add(el.color, 4);
      paintColors(el.background).forEach(c => add(c, 1));
    } else if (el.type === 'shape') {
      paintColors(el.fill).forEach(c => add(c, 3));
      add(el.stroke, 1);
    } else if (el.type === 'icon') {
      add(el.color, 3);
    } else if (el.type === 'image') {
      const colors = await imagePalette(el.src);
      colors.forEach((c, i) => add(c, Math.max(2, 8 - i)));
      add(el.overlay, 1);
    }
  }));

  const ordered = [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  const palette: string[] = [];
  ordered.forEach(color => {
    if (palette.every(existing => distance(existing, color) >= 38)) palette.push(color);
  });
  return palette.slice(0, 6);
}

/** Recolour the page with the extracted palette. Photos are never repainted. */
export function applyPaletteToPage(page: Page, palette: string[]): Page {
  const colors = palette.length ? palette : ['#2440f0', '#f4f1ea'];
  const primary = colors[0];
  const ink = contrastColor(primary);
  let accent = 0;
  const nextAccent = () => colors[(accent++) % colors.length];

  return {
    ...page,
    background: { kind: 'solid', color: primary },
    elements: page.elements.map(el => {
      if (el.locked) return el;
      if (el.type === 'text') {
        return { ...el, color: ink };
      }
      if (el.type === 'shape') {
        const fill = el.fill.kind === 'none' ? el.fill : { kind: 'solid' as const, color: nextAccent() };
        const stroke = el.stroke && el.stroke !== 'transparent' ? nextAccent() : el.stroke;
        return { ...el, fill, stroke };
      }
      if (el.type === 'icon') {
        return { ...el, color: nextAccent() };
      }
      return el;
    }),
  };
}
