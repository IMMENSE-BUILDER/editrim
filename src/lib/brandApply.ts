import type { Background, BrandKit, Design, El, Paint } from './types';

/** Which pages a brand action touches. */
export type BrandScope = 'page' | 'all';

/** One off-brand property found by `auditBrand`, with the closest brand value. */
export type BrandIssue = {
  pageId: string;
  elementId: string;
  elementName: string;
  kind: 'color' | 'font';
  current: string;
  suggested: string;
};

type RGB = { r: number; g: number; b: number };

/** Weighted RGB distance above this counts as off-brand. */
const COLOR_TOLERANCE = 36;

/** Luma-ish channel weights, so green errors read louder than blue ones. */
const WEIGHTS = { r: 0.3, g: 0.59, b: 0.11 };

const clamp = (n: number) => Math.max(0, Math.min(255, n));

function parseHex(hex: string): RGB | null {
  const body = hex.replace(/^#/, '').trim();
  if (!/^[0-9a-f]+$/i.test(body)) return null;
  if (body.length !== 3 && body.length !== 4 && body.length !== 6 && body.length !== 8) return null;
  const full = body.length <= 4 ? body.split('').map(c => c + c).join('') : body;
  const alpha = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
  if (alpha === 0) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/**
 * Parse a CSS colour into RGB. Hex (3/4/6/8) and rgb()/rgba() are supported;
 * `transparent`, `none`, empty strings and fully transparent values return null.
 */
export function parseColor(input: string | null | undefined): RGB | null {
  if (!input) return null;
  const raw = input.trim().toLowerCase();
  if (!raw || raw === 'transparent' || raw === 'none') return null;
  if (raw.startsWith('#')) return parseHex(raw);
  const fn = raw.match(/^rgba?\(([^)]+)\)$/);
  if (!fn) return null;
  const parts = fn[1].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const channel = (part: string) => (part.endsWith('%') ? (parseFloat(part) / 100) * 255 : parseFloat(part));
  const values = parts.slice(0, 3).map(channel);
  if (values.some(v => !Number.isFinite(v))) return null;
  const alphaRaw = parts[3];
  if (alphaRaw !== undefined) {
    const alpha = alphaRaw.endsWith('%') ? parseFloat(alphaRaw) / 100 : parseFloat(alphaRaw);
    if (Number.isFinite(alpha) && alpha <= 0) return null;
  }
  return { r: clamp(values[0]), g: clamp(values[1]), b: clamp(values[2]) };
}

/** Weighted RGB distance (0–255). Unparseable values are treated as 0. */
export function colorDistance(a: string, b: string): number {
  const x = parseColor(a);
  const y = parseColor(b);
  if (!x || !y) return 0;
  const dr = x.r - y.r;
  const dg = x.g - y.g;
  const db = x.b - y.b;
  return Math.sqrt(WEIGHTS.r * dr * dr + WEIGHTS.g * dg * dg + WEIGHTS.b * db * db);
}

function sameColor(a: string | undefined, b: string | undefined): boolean {
  if (a === b) return true;
  const x = parseColor(a);
  const y = parseColor(b);
  if (!x || !y) return (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();
  return x.r === y.r && x.g === y.g && x.b === y.b;
}

function colorKey(color: string): string {
  const rgb = parseColor(color);
  return rgb ? `${rgb.r},${rgb.g},${rgb.b}` : color.trim().toLowerCase();
}

/** Closest palette entry to `color`. Returns `color` when it cannot be parsed or the palette is empty. */
export function nearestColor(color: string, palette: string[]): string {
  const target = parseColor(color);
  if (!target) return color;
  let best = color;
  let bestDistance = Infinity;
  for (const entry of palette) {
    const rgb = parseColor(entry);
    if (!rgb) continue;
    const dr = target.r - rgb.r;
    const dg = target.g - rgb.g;
    const db = target.b - rgb.b;
    const distance = Math.sqrt(WEIGHTS.r * dr * dr + WEIGHTS.g * dg * dg + WEIGHTS.b * db * db);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = entry;
    }
  }
  return best;
}

function restylePaint(paint: Paint, palette: string[]): { paint: Paint; changed: boolean } {
  if (paint.kind === 'solid') {
    const color = nearestColor(paint.color, palette);
    return sameColor(paint.color, color) ? { paint, changed: false } : { paint: { ...paint, color }, changed: true };
  }
  if (paint.kind === 'linear') {
    const from = nearestColor(paint.from, palette);
    const to = nearestColor(paint.to, palette);
    const changed = !sameColor(paint.from, from) || !sameColor(paint.to, to);
    return changed ? { paint: { ...paint, from, to }, changed } : { paint, changed: false };
  }
  return { paint, changed: false };
}

function restyleBackground(background: Background, palette: string[]): { background: Background; changed: boolean } {
  if (background.kind === 'solid') {
    const color = nearestColor(background.color, palette);
    return sameColor(background.color, color) ? { background, changed: false } : { background: { ...background, color }, changed: true };
  }
  if (background.kind === 'linear') {
    const from = nearestColor(background.from, palette);
    const to = nearestColor(background.to, palette);
    const changed = !sameColor(background.from, from) || !sameColor(background.to, to);
    return changed ? { background: { ...background, from, to }, changed } : { background, changed: false };
  }
  return { background, changed: false };
}

/** Restyle one layer in place. Returns true when anything changed. */
function restyleElement(el: El, palette: string[], heading: string, body: string): boolean {
  switch (el.type) {
    case 'text': {
      let changed = false;
      if (palette.length) {
        const color = nearestColor(el.color, palette);
        if (!sameColor(el.color, color)) {
          el.color = color;
          changed = true;
        }
      }
      const target = el.fontSize >= 40 ? heading : body;
      if (target && el.fontFamily !== target) {
        el.fontFamily = target;
        changed = true;
      }
      return changed;
    }
    case 'shape': {
      let changed = false;
      if (palette.length) {
        const fill = restylePaint(el.fill, palette);
        if (fill.changed) {
          el.fill = fill.paint;
          changed = true;
        }
        if (parseColor(el.stroke)) {
          const stroke = nearestColor(el.stroke, palette);
          if (!sameColor(el.stroke, stroke)) {
            el.stroke = stroke;
            changed = true;
          }
        }
      }
      return changed;
    }
    case 'icon': {
      if (!palette.length) return false;
      const color = nearestColor(el.color, palette);
      if (sameColor(el.color, color)) return false;
      el.color = color;
      return true;
    }
    default:
      return false;
  }
}

/**
 * Snap a design onto the brand palette and type scale.
 * Hidden and locked layers are restyled too — this is an explicit action.
 * The input design is never mutated.
 */
export function applyBrandToDesign(
  design: Design,
  brand: BrandKit,
  scope: BrandScope,
  pageIndex: number,
): { design: Design; changed: number } {
  const next = structuredClone(design);
  const palette = (brand.colors ?? []).filter(c => parseColor(c));
  const heading = (brand.fonts ?? [])[0] ?? '';
  const body = (brand.fonts ?? [])[1] ?? heading;
  const pages = scope === 'all' ? next.pages : next.pages[pageIndex] ? [next.pages[pageIndex]] : [];

  let changed = 0;
  for (const page of pages) {
    if (palette.length) {
      const background = restyleBackground(page.background, palette);
      if (background.changed) {
        page.background = background.background;
        changed += 1;
      }
    }
    for (const el of page.elements) {
      if (restyleElement(el, palette, heading, body)) changed += 1;
    }
  }
  return { design: next, changed };
}

/**
 * Compare one page against the brand kit.
 * Colour distance above `COLOR_TOLERANCE` and any font outside `brand.fonts` are reported.
 * Counts are distinct values, not issue rows.
 */
export function auditBrand(
  design: Design,
  brand: BrandKit,
  pageIndex: number,
): { issues: BrandIssue[]; colorCount: number; fontCount: number } {
  const issues: BrandIssue[] = [];
  const palette = (brand.colors ?? []).filter(c => parseColor(c));
  const fonts = (brand.fonts ?? []).filter(Boolean);
  const page = design.pages[pageIndex];
  if (!page) return { issues, colorCount: 0, fontCount: 0 };

  const colors = new Set<string>();
  const usedFonts = new Set<string>();

  const checkColor = (elementId: string, elementName: string, value: string | undefined) => {
    if (!palette.length || !value || !parseColor(value)) return;
    const suggested = nearestColor(value, palette);
    if (colorDistance(value, suggested) <= COLOR_TOLERANCE) return;
    issues.push({ pageId: page.id, elementId, elementName, kind: 'color', current: value, suggested });
    colors.add(colorKey(value));
  };

  const checkFont = (el: Extract<El, { type: 'text' }>) => {
    if (!fonts.length) return;
    if (fonts.includes(el.fontFamily)) return;
    issues.push({
      pageId: page.id,
      elementId: el.id,
      elementName: el.name || 'Text',
      kind: 'font',
      current: el.fontFamily,
      suggested: el.fontSize >= 40 ? fonts[0] : fonts[1] ?? fonts[0],
    });
    usedFonts.add(el.fontFamily);
  };

  if (page.background.kind === 'solid') {
    checkColor('background', 'Background', page.background.color);
  } else if (page.background.kind === 'linear') {
    checkColor('background', 'Background', page.background.from);
    checkColor('background', 'Background', page.background.to);
  }

  for (const el of page.elements) {
    if (el.type === 'text') {
      checkColor(el.id, el.name || 'Text', el.color);
      checkFont(el);
    } else if (el.type === 'shape') {
      const label = el.name || 'Shape';
      if (el.fill.kind === 'solid') checkColor(el.id, label, el.fill.color);
      else if (el.fill.kind === 'linear') {
        checkColor(el.id, label, el.fill.from);
        checkColor(el.id, label, el.fill.to);
      }
      checkColor(el.id, label, el.stroke);
    } else if (el.type === 'icon') {
      checkColor(el.id, el.name || 'Icon', el.color);
    }
  }

  return { issues, colorCount: colors.size, fontCount: usedFonts.size };
}
