import { FONTS, type FontDef } from '../fonts';
import type { Paint, Shadow } from '../types';

export type FontProvider = 'fontsource' | 'self-hosted' | 'google' | 'system';
export type FontStyle = 'normal' | 'italic';

export type FontAsset = {
  family: string;
  label: string;
  category: FontDef['category'];
  provider: FontProvider;
  weights: number[];
  styles: FontStyle[];
  fallback: string;
  license: string;
  /** Package or URL used to load the face. */
  source: string;
  variable?: boolean;
};

const FALLBACK: Record<FontDef['category'], string> = {
  Sans: 'system-ui, sans-serif',
  Serif: 'Georgia, serif',
  Display: 'system-ui, sans-serif',
  Mono: 'ui-monospace, monospace',
  Hand: 'cursive',
};

export const GOOGLE_FONT_ENDPOINT = 'https://fonts.googleapis.com/css2';

export function googleFontUrl(family: string, weights: number[] = [400], italic = false): string {
  const name = family.trim().replace(/\s+/g, '+');
  const axis = weights.length === 1 ? `wght@${weights[0]}` : `wght@${weights.join(';')}`;
  return `${GOOGLE_FONT_ENDPOINT}?family=${name}:${italic ? 'ital,' : ''}${axis}&display=swap`;
}

function fontsourcePackage(family: string): string {
  return `@fontsource/${family.toLowerCase().replace(/\s+/g, '-')}`;
}

export const FONT_ASSETS: FontAsset[] = FONTS.map(font => ({
  family: font.family,
  label: font.label,
  category: font.category,
  provider: 'fontsource',
  weights: font.weights,
  styles: font.family === 'Instrument Serif' ? ['normal', 'italic'] : ['normal'],
  fallback: FALLBACK[font.category],
  license: 'SIL Open Font License',
  source: fontsourcePackage(font.family),
  variable: font.family === 'Bricolage Grotesque',
}));

/** The landing-only face is served directly from /public/fonts. */
export const GEIST_SERIF_ASSET: FontAsset = {
  family: 'Geist Serif',
  label: 'Geist Serif',
  category: 'Serif',
  provider: 'self-hosted',
  weights: [400],
  styles: ['normal'],
  fallback: 'Georgia, serif',
  license: 'SIL Open Font License',
  source: '/fonts/geist-serif-regular.woff2',
};

export const ALL_FONT_ASSETS: FontAsset[] = [...FONT_ASSETS, GEIST_SERIF_ASSET];
export const FONT_ASSET_BY_FAMILY = new Map(ALL_FONT_ASSETS.map(font => [font.family, font]));

export const TEXT_EFFECT_IDS = ['soft-shadow', 'hard-offset', 'neon-glow', 'outline', 'curved-arc', 'highlighter'] as const;
export type TextEffectId = typeof TEXT_EFFECT_IDS[number];

export type CurveSpec = {
  radius: number;
  startAngle: number;
  endAngle: number;
  direction: 'clockwise' | 'counter-clockwise';
};

export type TextEffectStyle = {
  color?: string;
  shadows?: Shadow[];
  stroke?: { width: number; color: string };
  blur?: number;
  background?: Paint;
  curve?: CurveSpec;
  uppercase?: boolean;
  letterSpacing?: number;
};

export type TextEffectPreset = {
  id: TextEffectId;
  name: string;
  description: string;
  style: TextEffectStyle;
};

export const TEXT_EFFECTS: TextEffectPreset[] = [
  {
    id: 'soft-shadow',
    name: 'Soft lift',
    description: 'A warm, low-contrast shadow for editorial headlines.',
    style: { shadows: [{ x: 0, y: 8, blur: 24, color: 'rgba(30,26,16,.18)' }] },
  },
  {
    id: 'hard-offset',
    name: 'Hard offset',
    description: 'A crisp two-layer offset for posters and loud covers.',
    style: { shadows: [
      { x: 4, y: 4, blur: 0, color: '#14130F' },
      { x: 8, y: 8, blur: 0, color: '#D8F55A' },
    ] },
  },
  {
    id: 'neon-glow',
    name: 'Neon glow',
    description: 'Layered blur halos that stay under the 20px budget.',
    style: { color: '#D8F55A', shadows: [
      { x: 0, y: 0, blur: 8, color: 'rgba(216,245,90,.9)' },
      { x: 0, y: 0, blur: 18, color: 'rgba(216,245,90,.45)' },
    ] },
  },
  {
    id: 'outline',
    name: 'Outline',
    description: 'A transparent fill with a single clean contour.',
    style: { color: 'transparent', stroke: { width: 2, color: '#F4F1EA' } },
  },
  {
    id: 'curved-arc',
    name: 'Curved arc',
    description: 'A serialisable arc path for badges and seals.',
    style: { curve: { radius: 180, startAngle: -115, endAngle: 115, direction: 'clockwise' } },
  },
  {
    id: 'highlighter',
    name: 'Highlighter',
    description: 'A lime marker block behind the letterforms.',
    style: { background: { kind: 'solid', color: '#D8F55A' }, letterSpacing: -0.02 },
  },
];

export function textShadowCss(effect: TextEffectPreset): string {
  return (effect.style.shadows ?? []).map(s => `${s.x}px ${s.y}px ${s.blur}px ${s.color}`).join(', ') || 'none';
}

export function textEffectCss(effect: TextEffectPreset): Record<string, string | number> {
  const style = effect.style;
  const css: Record<string, string | number> = {};
  if (style.color) css.color = style.color;
  if (style.shadows?.length) css.textShadow = textShadowCss(effect);
  if (style.stroke) {
    css.webkitTextStroke = `${style.stroke.width}px ${style.stroke.color}`;
    css.paintOrder = 'stroke fill';
  }
  if (style.letterSpacing !== undefined) css.letterSpacing = `${style.letterSpacing}em`;
  if (style.uppercase) css.textTransform = 'uppercase';
  return css;
}

export type FontRole = {
  family: string;
  weight: number;
  sizeRatio: number;
  lineHeight: number;
  letterSpacing: number;
  transform?: 'none' | 'uppercase';
};

export type FontPairing = {
  id: string;
  name: string;
  mood: string;
  header: FontRole;
  subheader: FontRole;
  body: FontRole;
};

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'modern-classic', name: 'Modern classic', mood: 'editorial',
    header: { family: 'Instrument Serif', weight: 400, sizeRatio: 1, lineHeight: 0.96, letterSpacing: -0.03 },
    subheader: { family: 'Instrument Serif', weight: 400, sizeRatio: 0.52, lineHeight: 1.02, letterSpacing: -0.01 },
    body: { family: 'Inter', weight: 400, sizeRatio: 0.23, lineHeight: 1.6, letterSpacing: 0 },
  },
  {
    id: 'geist-editorial', name: 'Geist editorial', mood: 'sharp',
    header: { family: 'Geist Serif', weight: 400, sizeRatio: 1, lineHeight: 0.94, letterSpacing: -0.045 },
    subheader: { family: 'Geist Serif', weight: 400, sizeRatio: 0.5, lineHeight: 1.02, letterSpacing: -0.02 },
    body: { family: 'Inter', weight: 400, sizeRatio: 0.22, lineHeight: 1.58, letterSpacing: 0 },
  },
  {
    id: 'editorial-serif', name: 'Editorial', mood: 'fashion',
    header: { family: 'Playfair Display', weight: 700, sizeRatio: 1, lineHeight: 0.98, letterSpacing: -0.02 },
    subheader: { family: 'Manrope', weight: 600, sizeRatio: 0.32, lineHeight: 1.2, letterSpacing: 0.02 },
    body: { family: 'Manrope', weight: 400, sizeRatio: 0.22, lineHeight: 1.6, letterSpacing: 0 },
  },
  {
    id: 'bold-statement', name: 'Bold statement', mood: 'loud',
    header: { family: 'Archivo Black', weight: 400, sizeRatio: 1, lineHeight: 0.88, letterSpacing: -0.025 },
    subheader: { family: 'Space Grotesk', weight: 700, sizeRatio: 0.34, lineHeight: 1.05, letterSpacing: -0.01 },
    body: { family: 'Space Grotesk', weight: 400, sizeRatio: 0.2, lineHeight: 1.5, letterSpacing: 0 },
  },
  {
    id: 'soft-premium', name: 'Soft premium', mood: 'warm',
    header: { family: 'Fraunces', weight: 700, sizeRatio: 1, lineHeight: 0.98, letterSpacing: -0.025 },
    subheader: { family: 'Poppins', weight: 600, sizeRatio: 0.3, lineHeight: 1.25, letterSpacing: 0.01 },
    body: { family: 'Poppins', weight: 400, sizeRatio: 0.2, lineHeight: 1.62, letterSpacing: 0 },
  },
  {
    id: 'high-impact', name: 'High impact', mood: 'poster',
    header: { family: 'Bebas Neue', weight: 400, sizeRatio: 1, lineHeight: 0.82, letterSpacing: 0.02 },
    subheader: { family: 'Inter', weight: 700, sizeRatio: 0.26, lineHeight: 1.2, letterSpacing: 0.08 },
    body: { family: 'Inter', weight: 400, sizeRatio: 0.19, lineHeight: 1.55, letterSpacing: 0 },
  },
  {
    id: 'quiet-tech', name: 'Quiet tech', mood: 'product',
    header: { family: 'Inter', weight: 800, sizeRatio: 1, lineHeight: 0.98, letterSpacing: -0.04 },
    subheader: { family: 'Inter', weight: 500, sizeRatio: 0.34, lineHeight: 1.25, letterSpacing: -0.01 },
    body: { family: 'Inter', weight: 400, sizeRatio: 0.22, lineHeight: 1.6, letterSpacing: 0 },
  },
  {
    id: 'humanist', name: 'Warm humanist', mood: 'classic',
    header: { family: 'DM Serif Display', weight: 400, sizeRatio: 1, lineHeight: 0.98, letterSpacing: -0.02 },
    subheader: { family: 'Libre Baskerville', weight: 700, sizeRatio: 0.3, lineHeight: 1.3, letterSpacing: 0.01 },
    body: { family: 'Libre Baskerville', weight: 400, sizeRatio: 0.2, lineHeight: 1.65, letterSpacing: 0 },
  },
];
