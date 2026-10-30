import type {
  Background, BrandKit, DesignSize, El, IconElement, ImageElement, Page, ShapeElement, ShapeKind, TextElement,
} from '../lib/types';
import { TEMPLATE_IMAGES } from '../lib/templates';
import { iconById } from '../lib/icons';
import { uid } from '../lib/utils';

const INK = '#14130F';
const PAPER = '#F4F1EA';
const LIME = '#D8F55A';
const COBALT = '#2440F0';
const CORAL = '#FF6A46';

const stagger = (page: Page) => (page.elements.length % 6) * 14;

function textBase(page: Page): Omit<TextElement, 'id' | 'name' | 'text' | 'x' | 'y' | 'w' | 'h' | 'fontSize'> {
  return {
    type: 'text',
    rotation: 0,
    opacity: 1,
    fontFamily: 'Inter',
    fontWeight: 400,
    color: INK,
    align: 'left',
    valign: 'top',
    lineHeight: 1.25,
    letterSpacing: 0,
    shadow: null,
    uppercase: false,
  };
}

export type TextPreset = 'heading' | 'subheading' | 'body' | 'quote' | 'caption';

export function createText(preset: TextPreset, page: Page, size: DesignSize, brand?: BrandKit): TextElement {
  const m = Math.min(size.width, size.height);
  const off = stagger(page);
  const headingFont = brand?.fonts[0] ?? 'Bricolage Grotesque';
  const bodyFont = brand?.fonts[1] ?? 'Inter';
  const accent = brand?.colors[0] ?? COBALT;

  switch (preset) {
    case 'heading': {
      const fontSize = Math.round(m * 0.075);
      return {
        ...textBase(page),
        id: uid('t'),
        name: 'Heading',
        text: 'Make it stand out.',
        x: size.width * 0.08 + off,
        y: size.height * 0.12 + off,
        w: size.width * 0.62,
        h: fontSize * 1.25 * 2,
        fontSize,
        fontFamily: headingFont,
        fontWeight: 700,
        lineHeight: 1.02,
        letterSpacing: -fontSize * 0.02,
        color: INK,
      };
    }
    case 'subheading': {
      const fontSize = Math.round(m * 0.032);
      return {
        ...textBase(page),
        id: uid('t'),
        name: 'Subheading',
        text: 'A supporting line that gives the idea some room.',
        x: size.width * 0.08 + off,
        y: size.height * 0.34 + off,
        w: size.width * 0.55,
        h: fontSize * 1.4 * 2,
        fontSize,
        fontFamily: bodyFont,
        fontWeight: 500,
        lineHeight: 1.35,
        color: '#3A372F',
      };
    }
    case 'body': {
      const fontSize = Math.round(m * 0.021);
      return {
        ...textBase(page),
        id: uid('t'),
        name: 'Body text',
        text: 'Write the details here. Keep it short, keep it useful, and let the headline do the loud part.',
        x: size.width * 0.08 + off,
        y: size.height * 0.46 + off,
        w: size.width * 0.42,
        h: fontSize * 1.55 * 3,
        fontSize,
        fontFamily: bodyFont,
        lineHeight: 1.55,
        color: '#4F4B42',
      };
    }
    case 'quote': {
      const fontSize = Math.round(m * 0.062);
      return {
        ...textBase(page),
        id: uid('t'),
        name: 'Quote',
        text: '“Make it simple, but significant.”',
        x: size.width * 0.1 + off,
        y: size.height * 0.3 + off,
        w: size.width * 0.8,
        h: fontSize * 1.12 * 2,
        fontSize,
        fontFamily: brand?.fonts[0] === 'Bricolage Grotesque' ? 'Instrument Serif' : 'Instrument Serif',
        italic: true,
        lineHeight: 1.12,
        letterSpacing: -fontSize * 0.015,
        color: INK,
      };
    }
    case 'caption':
    default: {
      const fontSize = Math.round(m * 0.016);
      return {
        ...textBase(page),
        id: uid('t'),
        name: 'Label',
        text: 'A SMALL LABEL',
        x: size.width * 0.08 + off,
        y: size.height * 0.08 + off,
        w: size.width * 0.4,
        h: fontSize * 2,
        fontSize,
        fontWeight: 600,
        letterSpacing: fontSize * 0.16,
        uppercase: true,
        color: accent,
      };
    }
  }
}

export function createNumber(page: Page, size: DesignSize): TextElement {
  const m = Math.min(size.width, size.height);
  const off = stagger(page);
  return {
    ...textBase(page),
    id: uid('t'),
    name: 'Big number',
    text: '86%',
    x: size.width * 0.08 + off,
    y: size.height * 0.22 + off,
    w: size.width * 0.7,
    h: m * 0.28,
    fontSize: Math.round(m * 0.24),
    fontFamily: 'Archivo Black',
    fontWeight: 400,
    lineHeight: 0.9,
    letterSpacing: -m * 0.012,
    color: INK,
  };
}

export function createShape(shape: ShapeKind, page: Page, size: DesignSize, brand?: BrandKit): ShapeElement {
  const m = Math.min(size.width, size.height);
  const off = stagger(page);
  const accent = brand?.colors[0] ?? COBALT;
  const isLine = shape === 'line';
  const w = isLine ? size.width * 0.5 : m * 0.3;
  const h = isLine ? 2 : m * 0.3;
  const x = (size.width - w) / 2 + off;
  const y = (size.height - h) / 2 + off;
  const fills: Partial<Record<ShapeKind, string>> = {
    rect: accent,
    ellipse: LIME,
    triangle: CORAL,
    star: LIME,
    diamond: COBALT,
    hexagon: '#4FA57D',
    blob: CORAL,
    heart: '#E89BA8',
    arrow: COBALT,
    burst: LIME,
    wave: '#4FA57D',
    ring: 'transparent',
  };
  return {
    id: uid('s'),
    type: 'shape',
    name: shape[0].toUpperCase() + shape.slice(1),
    shape,
    x,
    y,
    w,
    h,
    rotation: 0,
    opacity: 1,
    fill: isLine || shape === 'ring' ? { kind: 'none' } : { kind: 'solid', color: fills[shape] ?? accent },
    stroke: isLine || shape === 'ring' ? INK : 'transparent',
    strokeWidth: isLine ? 2 : shape === 'ring' ? Math.max(2, m * 0.008) : 0,
    radius: shape === 'rect' ? Math.round(m * 0.02) : 0,
    shadow: null,
  };
}

export function createIcon(icon: string, page: Page, size: DesignSize, brand?: BrandKit): IconElement {
  const m = Math.min(size.width, size.height);
  const iconSize = Math.round(m * 0.16);
  const off = stagger(page);
  return {
    id: uid('ic'),
    type: 'icon',
    name: iconById(icon).label,
    icon,
    x: (size.width - iconSize) / 2 + off,
    y: (size.height - iconSize) / 2 + off,
    w: iconSize,
    h: iconSize,
    rotation: 0,
    opacity: 1,
    color: brand?.colors[2] ?? INK,
    strokeWidth: 1.8,
    shadow: null,
  };
}

export function createImage(src: string, page: Page, size: DesignSize, aspect = 1): ImageElement {
  const m = Math.min(size.width, size.height);
  const w = Math.round(m * 0.44);
  const h = Math.round(w / (aspect || 1));
  const off = stagger(page);
  return {
    id: uid('i'),
    type: 'image',
    name: 'Image',
    src,
    x: (size.width - w) / 2 + off,
    y: (size.height - h) / 2 + off,
    w,
    h,
    rotation: 0,
    opacity: 1,
    fit: 'cover',
    radius: 0,
    filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 },
    shadow: null,
  };
}

/* ---------------- page layouts ---------------- */

export type LayoutDef = {
  id: string;
  name: string;
  description: string;
  build: (page: Page, size: DesignSize, brand?: BrandKit) => { background: Background; elements: El[] };
};

export const PAGE_LAYOUTS: LayoutDef[] = [
  {
    id: 'title',
    name: 'Editorial title',
    description: 'A big, quiet statement with a label above it.',
    build: (page, size, brand) => {
      const m = Math.min(size.width, size.height);
      const label = createText('caption', page, size, brand);
      label.text = 'YOUR STUDIO  /  2026';
      label.x = size.width * 0.08;
      label.y = size.height * 0.1;
      const heading = createText('heading', page, size, brand);
      heading.text = 'A headline with\nsome room to breathe.';
      heading.x = size.width * 0.08;
      heading.y = size.height * 0.3;
      heading.w = size.width * 0.7;
      heading.h = m * 0.22;
      heading.fontSize = Math.round(m * 0.09);
      heading.lineHeight = 0.98;
      const rule = createShape('line', page, size, brand);
      rule.x = size.width * 0.08;
      rule.y = size.height * 0.68;
      rule.w = size.width * 0.2;
      rule.h = 2;
      rule.stroke = INK;
      const body = createText('body', page, size, brand);
      body.text = 'Say the thing only you would say. Then get out of the way.';
      body.x = size.width * 0.08;
      body.y = size.height * 0.73;
      body.w = size.width * 0.45;
      return { background: { kind: 'solid', color: '#F7F2E7' }, elements: [label, heading, rule, body] };
    },
  },
  {
    id: 'split',
    name: 'Image + copy',
    description: 'One image on the right, words on the left.',
    build: (page, size, brand) => {
      const m = Math.min(size.width, size.height);
      const heading = createText('heading', page, size, brand);
      heading.text = 'Good design\nstarts with a point of view.';
      heading.x = size.width * 0.07;
      heading.y = size.height * 0.16;
      heading.w = size.width * 0.48;
      heading.h = m * 0.26;
      heading.fontSize = Math.round(m * 0.062);
      const body = createText('body', page, size, brand);
      body.text = 'A few honest sentences about the work, the people behind it, and why any of it matters.';
      body.x = size.width * 0.07;
      body.y = size.height * 0.56;
      body.w = size.width * 0.4;
      const image = createImage(TEMPLATE_IMAGES.interior, page, size, 0.8);
      image.x = size.width * 0.58;
      image.y = size.height * 0.12;
      image.w = size.width * 0.36;
      image.h = size.height * 0.66;
      image.radius = Math.round(m * 0.01);
      const accent = createShape('rect', page, size, brand);
      accent.x = size.width * 0.54;
      accent.y = size.height * 0.08;
      accent.w = size.width * 0.4;
      accent.h = size.height * 0.74;
      accent.fill = { kind: 'solid', color: brand?.colors[0] ?? LIME };
      accent.radius = Math.round(m * 0.012);
      accent.rotation = -3;
      return { background: { kind: 'solid', color: '#EFEADD' }, elements: [accent, image, heading, body] };
    },
  },
  {
    id: 'quote',
    name: 'Big quote',
    description: 'A single line, set large, on colour.',
    build: (page, size, brand) => {
      const m = Math.min(size.width, size.height);
      const quote = createText('quote', page, size, brand);
      quote.text = '“The details are not the details.\nThey make the design.”';
      quote.x = size.width * 0.1;
      quote.y = size.height * 0.28;
      quote.w = size.width * 0.8;
      quote.h = m * 0.3;
      quote.fontSize = Math.round(m * 0.062);
      quote.color = PAPER;
      quote.align = 'left';
      const mark = createText('heading', page, size, brand);
      mark.text = '“';
      mark.x = size.width * 0.08;
      mark.y = size.height * 0.08;
      mark.w = 200;
      mark.h = m * 0.2;
      mark.fontSize = Math.round(m * 0.18);
      mark.fontFamily = 'Instrument Serif';
      mark.color = LIME;
      const attr = createText('caption', page, size, brand);
      attr.text = 'CHARLES EAMES';
      attr.x = size.width * 0.1;
      attr.y = size.height * 0.78;
      attr.color = 'rgba(244,241,234,.6)';
      attr.fontSize = Math.round(m * 0.014);
      return { background: { kind: 'solid', color: brand?.colors[0] ?? COBALT }, elements: [mark, quote, attr] };
    },
  },
  {
    id: 'photo',
    name: 'Full-bleed photo',
    description: 'A photograph with a headline over it.',
    build: (page, size, brand) => {
      const m = Math.min(size.width, size.height);
      const title = createText('heading', page, size, brand);
      title.text = 'Out there,\nwhere the air is thin.';
      title.x = size.width * 0.07;
      title.y = size.height * 0.56;
      title.w = size.width * 0.8;
      title.h = m * 0.28;
      title.fontSize = Math.round(m * 0.1);
      title.lineHeight = 0.95;
      title.color = '#FFFFFF';
      title.shadow = { x: 0, y: 4, blur: 26, color: 'rgba(0,0,0,.35)' };
      const label = createText('caption', page, size, brand);
      label.text = 'FIELD NOTES  /  03';
      label.x = size.width * 0.07;
      label.y = size.height * 0.08;
      label.color = 'rgba(255,255,255,.8)';
      label.fontSize = Math.round(m * 0.014);
      return {
        background: { kind: 'image', src: TEMPLATE_IMAGES.mountain, overlay: '#07090A', overlayOpacity: 0.35 },
        elements: [label, title],
      };
    },
  },
  {
    id: 'stat',
    name: 'One big number',
    description: 'A number worth stopping for.',
    build: (page, size, brand) => {
      const m = Math.min(size.width, size.height);
      const num = createNumber(page, size);
      num.x = size.width * 0.08;
      num.y = size.height * 0.2;
      num.w = size.width * 0.84;
      num.h = m * 0.3;
      num.fontSize = Math.round(m * 0.3);
      num.color = INK;
      const label = createText('subheading', page, size, brand);
      label.text = 'of people finish what they start\nwhen the brief is clear.';
      label.x = size.width * 0.08;
      label.y = size.height * 0.62;
      label.w = size.width * 0.6;
      label.fontSize = Math.round(m * 0.028);
      label.lineHeight = 1.45;
      const source = createText('caption', page, size, brand);
      source.text = 'SOURCE — A STUDY OF 1,200 TEAMS';
      source.x = size.width * 0.08;
      source.y = size.height * 0.82;
      source.color = 'rgba(20,19,15,.55)';
      source.fontSize = Math.round(m * 0.012);
      return { background: { kind: 'solid', color: brand?.colors[1] ?? LIME }, elements: [num, label, source] };
    },
  },
  {
    id: 'minimal',
    name: 'Quiet corner',
    description: 'Small label, big words, plenty of paper.',
    build: (page, size, brand) => {
      const m = Math.min(size.width, size.height);
      const label = createText('caption', page, size, brand);
      label.text = 'ISSUE 04  /  THE LONG WAY';
      label.x = size.width * 0.08;
      label.y = size.height * 0.1;
      label.color = '#6B675D';
      label.fontSize = Math.round(m * 0.013);
      const heading = createText('heading', page, size, brand);
      heading.text = 'Nothing extra.\nEverything considered.';
      heading.x = size.width * 0.08;
      heading.y = size.height * 0.68;
      heading.w = size.width * 0.75;
      heading.h = m * 0.2;
      heading.fontSize = Math.round(m * 0.07);
      heading.lineHeight = 1.02;
      const rule = createShape('line', page, size, brand);
      rule.x = size.width * 0.08;
      rule.y = size.height * 0.63;
      rule.w = size.width * 0.84;
      rule.h = 1;
      rule.stroke = 'rgba(20,19,15,.3)';
      return { background: { kind: 'solid', color: '#F9F6EE' }, elements: [label, rule, heading] };
    },
  },
];

export const CREATE_SHAPES: { id: ShapeKind; label: string }[] = [
  { id: 'rect', label: 'Rectangle' },
  { id: 'ellipse', label: 'Circle' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'star', label: 'Star' },
  { id: 'blob', label: 'Blob' },
  { id: 'heart', label: 'Heart' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'arrow', label: 'Arrow' },
  { id: 'burst', label: 'Burst' },
  { id: 'wave', label: 'Wave' },
  { id: 'ring', label: 'Ring' },
];
