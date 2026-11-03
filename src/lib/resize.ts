import type { Design, El, IconElement, ImageElement, Page, Shadow, ShapeElement, TextElement } from './types';
import { getDesign, listDesigns, saveDesign, type DesignMeta } from './storage';
import { clamp, round, uid } from './utils';

export type ResizeTarget = { name: string; width: number; height: number; group?: string };

export const RESIZE_TARGETS: ResizeTarget[] = [
  { name: 'Instagram post', width: 1080, height: 1080, group: 'Social' },
  { name: 'Story', width: 1080, height: 1920, group: 'Social' },
  { name: 'LinkedIn', width: 1200, height: 627, group: 'Social' },
  { name: 'X', width: 1600, height: 900, group: 'Social' },
  { name: 'Facebook', width: 1200, height: 630, group: 'Social' },
  { name: '16:9', width: 1920, height: 1080, group: 'Presentation' },
  { name: '4:3', width: 1440, height: 1080, group: 'Presentation' },
  { name: 'A4', width: 1240, height: 1754, group: 'Print' },
  { name: 'US Letter', width: 1275, height: 1650, group: 'Print' },
  { name: 'Blog', width: 1200, height: 800, group: 'Web' },
  { name: 'YouTube', width: 1280, height: 720, group: 'Web' },
];

type Frame = {
  oldW: number;
  oldH: number;
  newW: number;
  newH: number;
  sx: number;
  sy: number;
  /** Uniform factor — type, padding, radii and shadows keep their visual weight. */
  scale: number;
};

/* ---------------- text estimation ----------------
   Deterministic: no canvas, no font loading, no DOM. Approximate per-character
   widths for the families the editor ships, then wrap words on a virtual line. */

const NARROW = 'iljItf.,:;!|\'`’‘';
const WIDE = 'mwMW@%&';

function glyphFactor(el: TextElement): number {
  const family = el.fontFamily.toLowerCase();
  let base = 0.55;
  if (/(mono|courier|space grotesk)/.test(family)) base = 0.62;
  else if (/(bebas|oswald)/.test(family)) base = 0.48;
  else if (/(archivo|impact|anton)/.test(family)) base = 0.64;
  else if (/(poppins|montserrat)/.test(family)) base = 0.57;
  else if (/(serif|georgia|playfair|fraunces|baskerville|instrument)/.test(family) && !/sans/.test(family)) base = 0.52;
  else if (/(caveat|hand|script)/.test(family)) base = 0.46;
  const weight = 1 + (clamp(el.fontWeight, 400, 900) - 400) * 0.00012;
  return base * weight;
}

function charFactor(ch: string): number {
  if (ch === ' ' || ch === '\t') return 0.28;
  if (NARROW.includes(ch)) return 0.36;
  if (WIDE.includes(ch)) return 1.32;
  if (ch >= 'A' && ch <= 'Z') return 1.1;
  if (ch >= '0' && ch <= '9') return 0.92;
  if (ch === '—' || ch === '–') return 1.3;
  if (/[\u3000-\u9fff\uac00-\ud7af]/.test(ch)) return 1.6;
  return 0.92;
}

function wordWidth(word: string, fontSize: number, factor: number, letterSpacing: number): number {
  let width = 0;
  for (const ch of word) width += fontSize * factor * charFactor(ch);
  if (letterSpacing) width += Math.max(0, word.length - 1) * letterSpacing;
  return width;
}

function countLines(text: string, maxWidth: number, fontSize: number, letterSpacing: number, factor: number): number {
  let total = 0;
  for (const paragraph of text.split('\n')) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      total += 1;
      continue;
    }
    const space = wordWidth(' ', fontSize, factor, letterSpacing);
    let lines = 1;
    let width = 0;
    let hasWord = false;

    for (const word of trimmed.split(/\s+/)) {
      const ww = wordWidth(word, fontSize, factor, letterSpacing);
      if (!hasWord) {
        if (ww <= maxWidth) {
          width = ww;
          hasWord = true;
          continue;
        }
        let chunk = 0;
        for (const ch of word) {
          const cw = fontSize * factor * charFactor(ch) + letterSpacing;
          if (chunk > 0 && chunk + cw > maxWidth) {
            lines += 1;
            chunk = 0;
          }
          chunk += cw;
        }
        width = chunk;
        hasWord = true;
        continue;
      }
      if (width + space + ww <= maxWidth) {
        width += space + ww;
        continue;
      }
      lines += 1;
      if (ww > maxWidth) {
        let chunk = 0;
        for (const ch of word) {
          const cw = fontSize * factor * charFactor(ch) + letterSpacing;
          if (chunk > 0 && chunk + cw > maxWidth) {
            lines += 1;
            chunk = 0;
          }
          chunk += cw;
        }
        width = chunk;
      } else {
        width = ww;
      }
    }
    total += Math.max(1, lines);
  }
  return Math.max(1, total);
}

function estimateTextHeight(el: TextElement, w: number, fontSize: number, letterSpacing: number, padding: number) {
  const pad = Math.max(0, Math.min(padding, w / 2));
  const inner = Math.max(8, w - pad * 2);
  const factor = glyphFactor(el);
  const text = el.uppercase ? el.text.toUpperCase() : el.text;
  const lines = countLines(text, inner, fontSize, letterSpacing, factor);
  return Math.ceil(lines * fontSize * el.lineHeight + pad * 2);
}

/* ---------------- reflow ---------------- */

function scaleShadow(shadow: Shadow | null | undefined, scale: number): Shadow | null | undefined {
  if (!shadow) return shadow;
  return {
    ...shadow,
    x: round(shadow.x * scale, 10),
    y: round(shadow.y * scale, 10),
    blur: round(shadow.blur * scale, 10),
  };
}

/** Keep the element's relative centre, then keep it inside the page. */
function placeInFrame(el: { x: number; y: number; w: number; h: number }, w: number, h: number, f: Frame) {
  const cx = ((el.x + el.w / 2) / f.oldW) * f.newW;
  const cy = ((el.y + el.h / 2) / f.oldH) * f.newH;
  return {
    x: round(clamp(cx - w / 2, 0, Math.max(0, f.newW - w)), 10),
    y: round(clamp(cy - h / 2, 0, Math.max(0, f.newH - h)), 10),
  };
}

function reflowText(el: TextElement, f: Frame): { el: TextElement; warning: boolean } {
  const idealFont = el.fontSize * f.scale;
  let fontSize = clamp(round(idealFont, 10), 8, 240);
  let warning = idealFont > 240.05 || idealFont < 7.99;

  const letterSpacing = round(el.letterSpacing * f.scale, 10);
  const padding = Math.max(0, round((el.padding ?? 0) * f.scale, 10));

  const maxW = Math.max(8, f.newW);
  const scaledW = el.w * f.sx;
  const w = clamp(Math.max(24, scaledW), 24, maxW);
  if (scaledW > maxW) warning = true;

  const rawH = el.h * f.sy;
  if (rawH > f.newH) warning = true;
  let contentH = estimateTextHeight(el, w, fontSize, letterSpacing, padding);

  // Only shrink the type when the box cannot grow enough on the new canvas.
  if (contentH > f.newH) {
    let next = fontSize;
    let guard = 0;
    while (next > 8 && contentH > f.newH && guard < 48) {
      next = Math.max(8, round(next - Math.max(0.5, next * 0.06), 10));
      contentH = estimateTextHeight(el, w, next, letterSpacing, padding);
      guard += 1;
    }
    if (next < fontSize) {
      warning = true;
      fontSize = next;
    }
    if (contentH > f.newH) warning = true;
  }

  const h = Math.min(f.newH, Math.max(rawH, contentH));
  const { x, y } = placeInFrame(el, w, h, f);

  return {
    warning,
    el: {
      ...el,
      x,
      y,
      w,
      h,
      fontSize,
      letterSpacing,
      padding,
      backgroundRadius: round((el.backgroundRadius ?? 0) * f.scale, 10),
      strokeWidth: el.strokeWidth ? round(el.strokeWidth * f.scale, 10) : el.strokeWidth,
      shadow: scaleShadow(el.shadow, f.scale),
    },
  };
}

function reflowShape(el: ShapeElement, f: Frame): ShapeElement {
  const w = clamp(el.w * f.sx, 0, f.newW);
  const h = clamp(el.h * f.sy, 0, f.newH);
  const { x, y } = placeInFrame(el, w, h, f);
  return {
    ...el,
    x,
    y,
    w,
    h,
    radius: round(Math.max(0, el.radius * f.scale), 10),
    strokeWidth: round(Math.max(0, el.strokeWidth * f.scale), 10),
    shadow: scaleShadow(el.shadow, f.scale),
  };
}

function reflowImage(el: ImageElement, f: Frame): ImageElement {
  const w = clamp(Math.max(1, el.w * f.sx), 1, f.newW);
  const h = clamp(Math.max(1, el.h * f.sy), 1, f.newH);
  const { x, y } = placeInFrame(el, w, h, f);
  return {
    ...el,
    x,
    y,
    w,
    h,
    radius: round(Math.max(0, el.radius * f.scale), 10),
    shadow: scaleShadow(el.shadow, f.scale),
    // Crop is stored as a fraction of the frame, so zoom/pan/mask carry over.
    zoom: el.zoom,
    offsetX: el.offsetX,
    offsetY: el.offsetY,
    mask: el.mask,
  };
}

function reflowIcon(el: IconElement, f: Frame): IconElement {
  const w = clamp(Math.max(1, el.w * f.sx), 1, f.newW);
  const h = clamp(Math.max(1, el.h * f.sy), 1, f.newH);
  const { x, y } = placeInFrame(el, w, h, f);
  return {
    ...el,
    x,
    y,
    w,
    h,
    strokeWidth: el.strokeWidth ? round(el.strokeWidth * f.scale, 10) : el.strokeWidth,
    shadow: scaleShadow(el.shadow, f.scale),
  };
}

function reflowElement(el: El, f: Frame): { el: El; warning: boolean } {
  switch (el.type) {
    case 'text':
      return reflowText(el, f);
    case 'shape':
      return { el: reflowShape(el, f), warning: false };
    case 'image':
      return { el: reflowImage(el, f), warning: false };
    case 'icon':
      return { el: reflowIcon(el, f), warning: false };
    default:
      return { el, warning: false };
  }
}

export function reflowPages(design: Design, target: { width: number; height: number }): { pages: Page[]; warnings: number } {
  const oldW = Math.max(1, design.size.width);
  const oldH = Math.max(1, design.size.height);
  const newW = Math.max(1, Math.round(target.width));
  const newH = Math.max(1, Math.round(target.height));
  const sx = newW / oldW;
  const sy = newH / oldH;
  const frame: Frame = { oldW, oldH, newW, newH, sx, sy, scale: Math.min(sx, sy) };

  let warnings = 0;

  const pages = design.pages.map(page => {
    const next: Page = structuredClone(page);
    if (page.background.kind === 'image') {
      // A resized frame should keep filling the canvas.
      next.background = { ...page.background, fit: 'cover' };
    }
    next.elements = page.elements.map(el => {
      const result = reflowElement(el, frame);
      if (result.warning) warnings += 1;
      return result.el;
    });
    return next;
  });

  return { pages, warnings };
}

export function createResizeVariant(design: Design, target: ResizeTarget): Design {
  const { pages } = reflowPages(design, target);
  const now = Date.now();
  const variant: Design = {
    ...structuredClone(design),
    id: uid('d'),
    title: `${design.title} · ${target.name}`,
    category: 'Resize',
    size: { name: target.name, width: Math.round(target.width), height: Math.round(target.height) },
    pages,
    createdAt: now,
    updatedAt: now,
    variantOf: design.id,
    rootId: design.rootId ?? design.id,
  };
  return saveDesign(variant);
}

/**
 * Every variant that points at `rootId` — the root itself is excluded.
 * The studio hides the design that is currently open.
 */
export function listVariants(rootId: string): DesignMeta[] {
  return listDesigns()
    .filter(meta => meta.id !== rootId)
    .filter(meta => {
      const full = getDesign(meta.id);
      return !!full && (full.rootId === rootId || full.variantOf === rootId);
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}
