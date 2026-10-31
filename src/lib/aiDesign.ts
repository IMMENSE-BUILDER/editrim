import type {
  Background, BrandKit, DesignSize, El, ImageElement, Page, Paint, ShapeElement,
  ShapeKind, TextElement,
} from './types';
import { FONTS } from './fonts';
import { TEMPLATE_IMAGES } from './templates';
import { measureTextHeight } from './render';
import { clamp, uid } from './utils';

const PHOTO_KEYS: Record<string, string> = {
  coffee: TEMPLATE_IMAGES.coffee,
  mountain: TEMPLATE_IMAGES.mountain,
  interior: TEMPLATE_IMAGES.interior,
  arch: TEMPLATE_IMAGES.arch,
  food: TEMPLATE_IMAGES.food,
  portrait: TEMPLATE_IMAGES.portrait,
  flowers: TEMPLATE_IMAGES.flowers,
  concert: TEMPLATE_IMAGES.concert,
  city: TEMPLATE_IMAGES.city,
};

const SHAPES: ShapeKind[] = [
  'rect', 'ellipse', 'triangle', 'line', 'star', 'diamond', 'hexagon',
  'blob', 'heart', 'arrow', 'burst', 'wave', 'ring',
];

const FONT_NAMES = new Set(FONTS.map(f => f.family));
const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+\s*)?\)|transparent)$/i;

const isColor = (v: unknown): v is string => typeof v === 'string' && COLOR_RE.test(v.trim());
const num = (v: unknown, fallback: number) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const color = (v: unknown, fallback: string) => (isColor(v) ? String(v).trim() : fallback);
const fontFamily = (v: unknown, fallback: string) => {
  if (typeof v !== 'string') return fallback;
  return FONT_NAMES.has(v) ? v : fallback;
};

function paintFrom(value: unknown, fallback: string): Paint {
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (v.kind === 'linear' && isColor(v.from) && isColor(v.to)) {
      return { kind: 'linear', from: String(v.from), to: String(v.to), angle: clamp(num(v.angle, 135), 0, 360) };
    }
    if (v.kind === 'none') return { kind: 'none' };
    if (v.kind === 'solid' && isColor(v.color)) return { kind: 'solid', color: String(v.color) };
  }
  return { kind: 'solid', color: color(value, fallback) };
}

function normalizeBackground(raw: unknown): Background {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  if (r.kind === 'linear' && isColor(r.from) && isColor(r.to)) {
    return { kind: 'linear', from: String(r.from), to: String(r.to), angle: clamp(num(r.angle, 135), 0, 360) };
  }
  const c = color(r.color, '#F4F1EA');
  return { kind: 'solid', color: c === 'transparent' ? '#F4F1EA' : c };
}

export function normalizeText(raw: Record<string, unknown>, size: DesignSize, brand: BrandKit): TextElement | null {
  const text = typeof raw.text === 'string' ? raw.text.trim().slice(0, 600) : '';
  if (!text) return null;
  const m = Math.min(size.width, size.height);
  const margin = m * 0.035;
  let x = clamp(num(raw.x, margin), 0, size.width - margin);
  let y = clamp(num(raw.y, margin), 0, size.height - margin);
  let w = clamp(num(raw.w, size.width * 0.6), 60, Math.max(60, size.width - x - margin));
  let h = clamp(num(raw.h, Math.max(36, m * 0.08)), 20, Math.max(20, size.height - y));
  const family = fontFamily(raw.fontFamily, brand.fonts[0] ?? 'Bricolage Grotesque');
  const fontSize = clamp(num(raw.fontSize, m * 0.07), 8, m * 0.45);
  const weight = [300, 400, 500, 600, 700, 800, 900].includes(Number(raw.fontWeight))
    ? Number(raw.fontWeight)
    : 700;

  const el: TextElement = {
    id: uid('t'),
    type: 'text',
    name: text.replace(/\s+/g, ' ').slice(0, 26),
    text,
    x,
    y,
    w,
    h,
    rotation: clamp(num(raw.rotation, 0), -45, 45),
    opacity: 1,
    fontFamily: family,
    fontSize,
    fontWeight: weight,
    italic: Boolean(raw.italic),
    uppercase: Boolean(raw.uppercase),
    color: (() => {
      const c = color(raw.color, '#14130F');
      return c === 'transparent' ? '#14130F' : c;
    })(),
    align: ['left', 'center', 'right'].includes(String(raw.align)) ? (raw.align as 'left' | 'center' | 'right') : 'left',
    valign: 'top',
    lineHeight: clamp(num(raw.lineHeight, 1.15), 0.8, 2.2),
    letterSpacing: clamp(num(raw.letterSpacing, 0), -12, 40),
    shadow: null,
  };

  // Keep AI text inside the canvas. If the box is too short, grow it once;
  // if the page cannot accommodate that, shrink the type instead of clipping.
  let needed = measureTextHeight(el);
  const maxH = Math.max(30, size.height - y - margin);
  if (needed > h) {
    if (needed <= maxH) {
      h = needed;
    } else {
      let guard = 0;
      while (needed > maxH && el.fontSize > 10 && guard < 16) {
        el.fontSize = Math.max(9, el.fontSize * 0.92);
        needed = measureTextHeight(el);
        guard++;
      }
      h = Math.min(needed, maxH);
    }
    el.h = Math.max(20, Math.ceil(h));
  }
  if (el.w < 40) el.w = 40;
  if (el.x + el.w > size.width - 2) el.w = Math.max(40, size.width - el.x - 2);
  return el;
}

export function normalizeImage(raw: Record<string, unknown>, size: DesignSize): ImageElement | null {
  const photoKey = typeof raw.photo === 'string' ? raw.photo : '';
  const src = PHOTO_KEYS[photoKey];
  if (!src) return null;
  const m = Math.min(size.width, size.height);
  const x = clamp(num(raw.x, m * 0.1), -m * 0.1, size.width);
  const y = clamp(num(raw.y, m * 0.1), -m * 0.1, size.height);
  const w = clamp(num(raw.w, m * 0.4), 24, size.width * 1.4);
  const h = clamp(num(raw.h, w), 24, size.height * 1.4);
  return {
    id: uid('i'),
    type: 'image',
    name: `AI photo — ${photoKey}`,
    src,
    x,
    y,
    w,
    h,
    rotation: clamp(num(raw.rotation, 0), -30, 30),
    opacity: 1,
    fit: 'cover',
    radius: clamp(num(raw.radius, 0), 0, Math.min(w, h) / 2),
    filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 },
    shadow: null,
  };
}

export function normalizeShape(raw: Record<string, unknown>, size: DesignSize): ShapeElement | null {
  const shape = SHAPES.includes(raw.shape as ShapeKind) ? (raw.shape as ShapeKind) : 'rect';
  const m = Math.min(size.width, size.height);
  const x = clamp(num(raw.x, 0), -size.width * 0.25, size.width * 1.1);
  const y = clamp(num(raw.y, 0), -size.height * 0.25, size.height * 1.1);
  const w = clamp(num(raw.w, m * 0.3), 2, size.width * 1.6);
  const h = clamp(num(raw.h, m * 0.3), 1, size.height * 1.6);
  const fill = paintFrom(raw.fill, '#D8F55A');
  const stroke = color(raw.stroke, 'transparent');
  const strokeWidth = clamp(num(raw.strokeWidth, 0), 0, 30);
  const isLine = shape === 'line';
  if (isLine) {
    return {
      id: uid('s'),
      type: 'shape',
      name: 'Line',
      shape,
      x,
      y: clamp(y, 0, size.height),
      w,
      h: Math.max(1, h),
      rotation: clamp(num(raw.rotation, 0), -180, 180),
      opacity: 1,
      fill: { kind: 'none' },
      stroke: stroke === 'transparent' ? '#14130F' : stroke,
      strokeWidth: Math.max(1, strokeWidth),
      radius: 0,
      shadow: null,
    };
  }
  if (fill.kind === 'none' && (stroke === 'transparent' || strokeWidth === 0)) return null;
  if (fill.kind === 'solid' && fill.color === 'transparent' && (stroke === 'transparent' || strokeWidth === 0)) return null;
  return {
    id: uid('s'),
    type: 'shape',
    name: shape[0].toUpperCase() + shape.slice(1),
    shape,
    x,
    y,
    w,
    h,
    rotation: clamp(num(raw.rotation, 0), -180, 180),
    opacity: 1,
    fill,
    stroke,
    strokeWidth,
    radius: shape === 'rect' ? clamp(num(raw.radius, 0), 0, Math.min(w, h) / 2) : 0,
    shadow: null,
  };
}

export function normalizeAiDesign(raw: unknown, size: DesignSize, brand: BrandKit): Page {
  const spec = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const rawElements = Array.isArray(spec.elements) ? spec.elements.slice(0, 14) : [];
  const elements: El[] = [];

  for (const item of rawElements) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    if (r.type === 'text') {
      const el = normalizeText(r, size, brand);
      if (el) elements.push(el);
    } else if (r.type === 'image') {
      const el = normalizeImage(r, size);
      if (el) elements.push(el);
    } else if (r.type === 'shape') {
      const el = normalizeShape(r, size);
      if (el) elements.push(el);
    }
  }

  if (elements.length < 2) {
    throw new Error('The AI returned a layout without enough usable elements. Try again.');
  }

  // Text always paints above decorative shapes and photos. Models often put a
  // photo later in the array by accident; this keeps generated copy legible.
  const ordered = [
    ...elements.filter(el => el.type !== 'text'),
    ...elements.filter(el => el.type === 'text'),
  ];

  const name = typeof spec.name === 'string' && spec.name.trim()
    ? spec.name.trim().slice(0, 60)
    : 'AI draft';

  return {
    id: uid('p'),
    name,
    background: normalizeBackground(spec.background),
    elements: ordered,
  };
}

/* ---------------- SVG illustration safety ---------------- */

const SVG_TAGS = new Set([
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'defs', 'linearGradient', 'radialGradient', 'stop',
]);
const SVG_ATTRS = new Set([
  'xmlns', 'viewBox', 'width', 'height', 'fill', 'stroke', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'opacity',
  'fill-opacity', 'stroke-opacity', 'fill-rule', 'clip-rule', 'd', 'transform',
  'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points',
  'offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'gradientTransform',
  'id', 'preserveAspectRatio',
]);
const NUMBER_ATTRS = new Set([
  'width', 'height', 'stroke-width', 'opacity', 'fill-opacity', 'stroke-opacity',
  'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'offset', 'stop-opacity',
]);

function safeSvgPaint(value: string) {
  const v = value.trim();
  if (/^(none|transparent|currentColor)$/i.test(v)) return v;
  if (COLOR_RE.test(v)) return v;
  if (/^url\(#[A-Za-z0-9_-]+\)$/.test(v)) return v;
  return 'none';
}

export function sanitizeAiSvg(raw: string): string {
  const source = String(raw ?? '').trim();
  if (!source) throw new Error('The AI returned an empty illustration.');
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  } catch {
    throw new Error('The AI illustration was not valid SVG.');
  }
  if (doc.querySelector('parsererror')) throw new Error('The AI illustration was not valid SVG.');
  const svg = doc.documentElement;
  if (!svg || svg.localName !== 'svg') throw new Error('The AI illustration has no SVG root.');

  const clean = (node: Element) => {
    [...node.children].forEach(child => {
      if (!SVG_TAGS.has(child.localName)) {
        child.remove();
        return;
      }
      [...child.attributes].forEach(attr => {
        const name = attr.name;
        if (!SVG_ATTRS.has(name)) {
          child.removeAttribute(name);
          return;
        }
        if (NUMBER_ATTRS.has(name) && !/^-?\d*\.?\d+%?$/.test(attr.value.trim())) {
          child.removeAttribute(name);
          return;
        }
        if (name === 'fill' || name === 'stroke' || name === 'stop-color') {
          child.setAttribute(name, safeSvgPaint(attr.value));
        }
        if (name === 'id' && !/^[A-Za-z][A-Za-z0-9_-]*$/.test(attr.value)) child.removeAttribute(name);
        if (name === 'transform' && !/^[A-Za-z0-9\s(),.#-]+$/.test(attr.value)) child.removeAttribute(name);
        if (name === 'd' && attr.value.length > 12_000) child.removeAttribute(name);
      });
      clean(child);
    });
  };
  clean(svg);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (!svg.getAttribute('viewBox')) {
    svg.setAttribute('viewBox', `0 0 ${svg.getAttribute('width') || 800} ${svg.getAttribute('height') || 600}`);
  }
  const serialized = new XMLSerializer().serializeToString(svg);
  if (serialized.length > 50_000) throw new Error('The AI illustration was too large.');
  return serialized;
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
