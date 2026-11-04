import type {
  Background,
  IconElement,
  ImageElement,
  ImageFilters,
  Page,
  Paint,
  Shadow,
  ShapeElement,
  ShapeKind,
  TextElement,
} from './types';
import { uid } from './utils';

/**
 * Shared primitives for hand-built template collections.
 * Keep templates editable: text, shapes, images and icons only.
 */

export const INK = '#14130F';
export const PAPER = '#F4F1EA';
export const CREAM = '#F7F0E3';
export const COBALT = '#2440F0';
export const LIME = '#D8F55A';
export const CORAL = '#FF6A46';

export const FONTS = {
  display: 'Bricolage Grotesque',
  serif: 'Instrument Serif',
  editorial: 'Playfair Display',
  dmSerif: 'DM Serif Display',
  grotesk: 'Space Grotesk',
  condensed: 'Bebas Neue',
  black: 'Archivo Black',
  fraunces: 'Fraunces',
  manrope: 'Manrope',
  baskerville: 'Libre Baskerville',
  poppins: 'Poppins',
  oswald: 'Oswald',
  montserrat: 'Montserrat',
  caveat: 'Caveat',
  inter: 'Inter',
} as const;

export const P = (color: string): Paint => ({ kind: 'solid', color });
export const G = (from: string, to: string, angle = 135): Paint => ({ kind: 'linear', from, to, angle });
export const NONE: Paint = { kind: 'none' };

export const bgSolid = (color: string): Background => ({ kind: 'solid', color });
export const bgGrad = (from: string, to: string, angle = 135): Background => ({ kind: 'linear', from, to, angle });
export const bgImage = (src: string, overlay?: string, overlayOpacity = 0.4): Background => ({
  kind: 'image',
  src,
  overlay,
  overlayOpacity,
});

type TextOpts = Partial<Omit<TextElement, 'type' | 'id' | 'x' | 'y' | 'w' | 'h' | 'text'>>;

export function T(text: string, x: number, y: number, w: number, h: number, opts: TextOpts = {}): TextElement {
  return {
    id: uid('t'),
    type: 'text',
    name: opts.name ?? (text.slice(0, 24).replace(/\n/g, ' ') || 'Text'),
    x, y, w, h,
    rotation: 0,
    opacity: 1,
    text,
    fontFamily: FONTS.inter,
    fontSize: 48,
    fontWeight: 400,
    color: INK,
    align: 'left',
    valign: 'top',
    lineHeight: 1.2,
    letterSpacing: 0,
    shadow: null,
    ...opts,
  };
}

type ShapeOpts = Omit<Partial<ShapeElement>, 'fill'> & { fill?: Paint | string };

export function S(shape: ShapeKind, x: number, y: number, w: number, h: number, opts: ShapeOpts = {}): ShapeElement {
  const { fill, ...rest } = opts;
  return {
    id: uid('s'),
    type: 'shape',
    name: opts.name ?? shape[0].toUpperCase() + shape.slice(1),
    x, y, w, h,
    rotation: 0,
    opacity: 1,
    shape,
    fill: typeof fill === 'string' ? P(fill) : fill ?? P(INK),
    stroke: 'transparent',
    strokeWidth: 0,
    radius: 0,
    shadow: null,
    ...rest,
  };
}

const FILTERS: ImageFilters = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 };
type ImageOpts = Partial<Omit<ImageElement, 'type' | 'id' | 'x' | 'y' | 'w' | 'h' | 'src'>>;

export function IMG(src: string, x: number, y: number, w: number, h: number, opts: ImageOpts = {}): ImageElement {
  return {
    id: uid('i'),
    type: 'image',
    name: opts.name ?? 'Image',
    x, y, w, h,
    rotation: 0,
    opacity: 1,
    src,
    fit: 'cover',
    radius: 0,
    filters: { ...FILTERS },
    shadow: null,
    ...opts,
  };
}

export function IC(
  icon: string,
  x: number,
  y: number,
  size: number,
  color: string,
  strokeWidth = 1.7,
  opts: Partial<IconElement> = {},
): IconElement {
  return {
    id: uid('ic'),
    type: 'icon',
    name: icon,
    x, y, w: size, h: size,
    rotation: 0,
    opacity: 1,
    icon,
    color,
    strokeWidth,
    shadow: null,
    ...opts,
  };
}

export const SH = (x: number, y: number, blur: number, color: string): Shadow => ({ x, y, blur, color });

export function page(
  name: string,
  background: Background,
  elements: (TextElement | ShapeElement | ImageElement | IconElement)[],
): Page {
  return { id: uid('p'), name, background, elements };
}

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const PHOTOS = {
  coffee: U('photo-1495474472287-4d71bcdd2085'),
  watch: U('photo-1523275335684-37898b6baf30'),
  shoe: U('photo-1542291026-7eec264c27ff'),
  mountain: U('photo-1464822759023-fed622ff2c3b'),
  tomato: U('photo-1592924357228-91a4daadcfea'),
  interior: U('photo-1616486338812-3dadae4b4ace'),
  arch: U('photo-1487958449943-2429e8be8625'),
  city: U('photo-1477959858617-67f85cf4f1df'),
  athlete: U('photo-1517836357463-d25dfeac3438'),
  portrait: U('photo-1494790108377-be9c29b29330'),
  concert: U('photo-1470229722913-7c0e2dbbafd3'),
  flowers: U('photo-1490750967868-88aa4486c946'),
  food: U('photo-1504674900247-0877df9cc836'),
  office: U('photo-1497366754035-f200968a6e72'),
} as const;
