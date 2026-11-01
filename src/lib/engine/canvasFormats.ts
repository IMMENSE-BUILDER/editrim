import { SIZE_PRESETS, type SizePreset } from '../presets';
import type { DesignSize } from '../types';

export type CanvasGroup = 'Social' | 'Presentation' | 'Print' | 'Brand' | 'Web' | 'Docs';
export type CanvasKind = 'social' | 'presentation' | 'print' | 'web' | 'document';

export type PrintStandardId = 'a4' | 'us-letter' | 'business-card';

export type PrintStandard = {
  id: PrintStandardId;
  label: string;
  widthMm: number;
  heightMm: number;
  dpi: number;
  bleedMm: number;
};

/**
 * Canonical print mappings. The pixel dimensions in the design library are
 * generated from these physical sizes so export DPI and bleed stay explicit.
 */
export const PRINT_STANDARDS: Record<PrintStandardId, PrintStandard> = {
  a4: { id: 'a4', label: 'A4', widthMm: 210, heightMm: 297, dpi: 150, bleedMm: 3 },
  'us-letter': { id: 'us-letter', label: 'US Letter', widthMm: 215.9, heightMm: 279.4, dpi: 150, bleedMm: 3 },
  'business-card': { id: 'business-card', label: 'Business Card', widthMm: 88.9, heightMm: 50.8, dpi: 300, bleedMm: 3 },
};

export type CanvasFormat = {
  id: string;
  name: string;
  group: CanvasGroup;
  kind: CanvasKind;
  width: number;
  height: number;
  aspectRatio: string;
  pixelDensity: number;
  print?: PrintStandard;
  responsive: boolean;
  tags: string[];
};

export type CanvasFit = {
  width: number;
  height: number;
  left: number;
  top: number;
  scale: number;
  aspectRatio: string;
};

export type ResponsiveGrid = {
  breakpoint: number;
  columns: number;
  gutter: number;
  margin: number;
};

export type WebNodeRole =
  | 'page'
  | 'section'
  | 'container'
  | 'grid'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'card'
  | 'nav';

export type WebLayoutNode = {
  id: string;
  role: WebNodeRole;
  props: Record<string, string | number | boolean>;
  children?: WebLayoutNode[];
};

export type WebLayout = {
  id: string;
  name: string;
  canvas: DesignSize;
  breakpoints: ResponsiveGrid[];
  tree: WebLayoutNode;
};

const A4_IDS = new Set([
  'doc', 'document', 'invoice', 'letterhead', 'certificate', 'menu', 'flyer',
  'resume', 'recipe-card', 'magazine-cover', 'contract', 'proposal',
]);

const PRINT_STANDARD_BY_ID: Record<string, PrintStandardId> = {
  ...Object.fromEntries([...A4_IDS].map(id => [id, 'a4'])),
  letter: 'us-letter',
  'business-card': 'business-card',
};

const GROUP_KIND: Record<CanvasGroup, CanvasKind> = {
  Social: 'social',
  Presentation: 'presentation',
  Print: 'print',
  Brand: 'web',
  Web: 'web',
  Docs: 'document',
};

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export function aspectRatioLabel(width: number, height: number): string {
  if (!width || !height) return 'free';
  const divisor = gcd(Math.round(width), Math.round(height));
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

export function printPixels(standard: PrintStandard): { width: number; height: number } {
  return {
    width: Math.round((standard.widthMm / 25.4) * standard.dpi),
    height: Math.round((standard.heightMm / 25.4) * standard.dpi),
  };
}

function fromPreset(preset: SizePreset): CanvasFormat {
  const printId = PRINT_STANDARD_BY_ID[preset.id];
  const print = printId ? PRINT_STANDARDS[printId] : undefined;
  return {
    id: preset.id,
    name: preset.name,
    group: preset.group as CanvasGroup,
    kind: GROUP_KIND[preset.group as CanvasGroup] ?? 'social',
    width: preset.w,
    height: preset.h,
    aspectRatio: aspectRatioLabel(preset.w, preset.h),
    pixelDensity: print?.dpi ?? 96,
    print,
    responsive: preset.group === 'Web',
    tags: [preset.group.toLowerCase(), preset.name.toLowerCase().replace(/\s+/g, '-')],
  };
}

export const CANVAS_FORMATS: CanvasFormat[] = SIZE_PRESETS.map(fromPreset);
export const CANVAS_FORMAT_BY_ID = new Map(CANVAS_FORMATS.map(format => [format.id, format]));

export function getCanvasFormat(id: string): CanvasFormat | undefined {
  return CANVAS_FORMAT_BY_ID.get(id);
}

/** Fit a canvas inside a viewport or export box without distorting its aspect. */
export function fitCanvas(format: Pick<CanvasFormat, 'width' | 'height'> | DesignSize, maxWidth: number, maxHeight: number, inset = 0): CanvasFit {
  const width = format.width;
  const height = format.height;
  const availableW = Math.max(1, maxWidth - inset * 2);
  const availableH = Math.max(1, maxHeight - inset * 2);
  const scale = Math.min(availableW / width, availableH / height);
  return {
    width: width * scale,
    height: height * scale,
    left: (maxWidth - width * scale) / 2,
    top: (maxHeight - height * scale) / 2,
    scale,
    aspectRatio: aspectRatioLabel(width, height),
  };
}

export const RESPONSIVE_GRIDS: ResponsiveGrid[] = [
  { breakpoint: 480, columns: 1, gutter: 16, margin: 20 },
  { breakpoint: 768, columns: 2, gutter: 20, margin: 28 },
  { breakpoint: 1180, columns: 3, gutter: 24, margin: 40 },
  { breakpoint: 1440, columns: 4, gutter: 26, margin: 48 },
];

const landingTree: WebLayoutNode = {
  id: 'landing-page',
  role: 'page',
  props: { theme: 'light', maxWidth: 1320 },
  children: [
    {
      id: 'landing-nav',
      role: 'nav',
      props: { sticky: true, height: 72, links: 'Templates,Features,Pricing' },
    },
    {
      id: 'landing-hero',
      role: 'section',
      props: { minHeight: 640, layout: 'split', ratio: '52/48' },
      children: [
        { id: 'hero-copy', role: 'container', props: { align: 'start', gap: 24 }, children: [
          { id: 'hero-title', role: 'heading', props: { level: 1, maxChars: 26 } },
          { id: 'hero-body', role: 'text', props: { measure: 48 } },
          { id: 'hero-cta', role: 'button', props: { label: 'Start designing', variant: 'primary' } },
        ] },
        { id: 'hero-visual', role: 'image', props: { fit: 'contain', priority: true } },
      ],
    },
    {
      id: 'landing-grid',
      role: 'section',
      props: { layout: 'grid', section: 'templates' },
      children: [{ id: 'template-grid', role: 'grid', props: { columns: 4, card: 'template' } }],
    },
  ],
};

export const WEB_LAYOUT_TEMPLATES: WebLayout[] = [
  {
    id: 'landing-split',
    name: 'Landing page · split hero',
    canvas: { name: 'Desktop', width: 1440, height: 900 },
    breakpoints: RESPONSIVE_GRIDS,
    tree: landingTree,
  },
];
