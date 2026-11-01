import type { DesignSize, Page } from '../types';

export type SlideRole = 'title' | 'agenda' | 'section' | 'content' | 'data' | 'quote' | 'conclusion';
export type PlaceholderRole = 'eyebrow' | 'title' | 'subhead' | 'body' | 'image' | 'footer' | 'chart' | 'page-number';

export type SlidePlaceholder = {
  id: string;
  role: PlaceholderRole;
  x: number;
  y: number;
  w: number;
  h: number;
  locked?: boolean;
};

export type SlideArchetype = {
  id: string;
  name: string;
  role: SlideRole;
  layout: 'single' | 'split' | 'grid' | 'quote' | 'data';
  placeholders: SlidePlaceholder[];
  lockedRoles: PlaceholderRole[];
};

export type SlideBlueprint = {
  id: string;
  pageId: string;
  archetypeId: string;
  order: number;
};

export type SlideDeckTemplate = {
  id: string;
  name: string;
  description: string;
  size: DesignSize;
  theme: {
    background: string;
    colors: string[];
    headerFont: string;
    bodyFont: string;
  };
  pages: Page[];
  blueprints: SlideBlueprint[];
};

const blank = (id: string, name: string): Page => ({
  id,
  name,
  background: { kind: 'solid', color: '#F4F1EA' },
  elements: [],
});

export const SLIDE_ARCHETYPES: SlideArchetype[] = [
  {
    id: 'title',
    name: 'Title',
    role: 'title',
    layout: 'single',
    placeholders: [
      { id: 'kicker', role: 'eyebrow', x: 96, y: 120, w: 520, h: 32, locked: true },
      { id: 'title', role: 'title', x: 96, y: 190, w: 1050, h: 240 },
      { id: 'subhead', role: 'subhead', x: 100, y: 470, w: 760, h: 64 },
      { id: 'footer', role: 'footer', x: 96, y: 980, w: 500, h: 28, locked: true },
    ],
    lockedRoles: ['eyebrow', 'footer'],
  },
  {
    id: 'agenda',
    name: 'Agenda',
    role: 'agenda',
    layout: 'grid',
    placeholders: [
      { id: 'title', role: 'title', x: 96, y: 92, w: 700, h: 100 },
      { id: 'body', role: 'body', x: 96, y: 240, w: 920, h: 470 },
      { id: 'page', role: 'page-number', x: 1680, y: 980, w: 150, h: 30, locked: true },
    ],
    lockedRoles: ['page-number'],
  },
  {
    id: 'section',
    name: 'Section break',
    role: 'section',
    layout: 'single',
    placeholders: [
      { id: 'kicker', role: 'eyebrow', x: 96, y: 260, w: 500, h: 30, locked: true },
      { id: 'title', role: 'title', x: 96, y: 340, w: 1200, h: 230 },
      { id: 'footer', role: 'footer', x: 96, y: 980, w: 500, h: 28, locked: true },
    ],
    lockedRoles: ['eyebrow', 'footer'],
  },
  {
    id: 'content',
    name: 'Content',
    role: 'content',
    layout: 'split',
    placeholders: [
      { id: 'title', role: 'title', x: 96, y: 96, w: 1000, h: 100 },
      { id: 'body', role: 'body', x: 96, y: 250, w: 780, h: 420 },
      { id: 'image', role: 'image', x: 1010, y: 96, w: 780, h: 700 },
      { id: 'page', role: 'page-number', x: 1680, y: 980, w: 150, h: 30, locked: true },
    ],
    lockedRoles: ['page-number'],
  },
  {
    id: 'data',
    name: 'Data story',
    role: 'data',
    layout: 'data',
    placeholders: [
      { id: 'title', role: 'title', x: 96, y: 96, w: 1000, h: 100 },
      { id: 'chart', role: 'chart', x: 96, y: 250, w: 1100, h: 560, locked: true },
      { id: 'body', role: 'body', x: 1240, y: 250, w: 560, h: 420 },
      { id: 'page', role: 'page-number', x: 1680, y: 980, w: 150, h: 30, locked: true },
    ],
    lockedRoles: ['chart', 'page-number'],
  },
  {
    id: 'quote',
    name: 'Quote',
    role: 'quote',
    layout: 'quote',
    placeholders: [
      { id: 'title', role: 'title', x: 160, y: 280, w: 1300, h: 420 },
      { id: 'subhead', role: 'subhead', x: 164, y: 750, w: 800, h: 54 },
      { id: 'page', role: 'page-number', x: 1680, y: 980, w: 150, h: 30, locked: true },
    ],
    lockedRoles: ['page-number'],
  },
  {
    id: 'conclusion',
    name: 'Conclusion',
    role: 'conclusion',
    layout: 'single',
    placeholders: [
      { id: 'kicker', role: 'eyebrow', x: 96, y: 120, w: 520, h: 32, locked: true },
      { id: 'title', role: 'title', x: 96, y: 200, w: 1200, h: 220 },
      { id: 'body', role: 'body', x: 96, y: 460, w: 820, h: 150 },
      { id: 'footer', role: 'footer', x: 96, y: 980, w: 500, h: 28, locked: true },
    ],
    lockedRoles: ['eyebrow', 'footer'],
  },
];

export const SLIDE_DECK_TEMPLATES: SlideDeckTemplate[] = [
  {
    id: 'studio-deck',
    name: 'Studio deck',
    description: 'A quiet editorial deck with a title, agenda, content data and conclusion.',
    size: { name: 'Presentation', width: 1920, height: 1080 },
    theme: {
      background: '#F4F1EA',
      colors: ['#14130F', '#F4F1EA', '#2440F0', '#D8F55A'],
      headerFont: 'Instrument Serif',
      bodyFont: 'Inter',
    },
    pages: [
      blank('studio-title', 'Title'),
      blank('studio-agenda', 'Agenda'),
      blank('studio-content', 'Content'),
      blank('studio-data', 'Data'),
      blank('studio-conclusion', 'Conclusion'),
    ],
    blueprints: [
      { id: 'b1', pageId: 'studio-title', archetypeId: 'title', order: 0 },
      { id: 'b2', pageId: 'studio-agenda', archetypeId: 'agenda', order: 1 },
      { id: 'b3', pageId: 'studio-content', archetypeId: 'content', order: 2 },
      { id: 'b4', pageId: 'studio-data', archetypeId: 'data', order: 3 },
      { id: 'b5', pageId: 'studio-conclusion', archetypeId: 'conclusion', order: 4 },
    ],
  },
];

export type ChartKind = 'pie' | 'donut' | 'bar' | 'line';

export type ChartDataset = {
  labels: string[];
  values: number[];
  colors?: string[];
  unit?: string;
};

export type ChartSpec = {
  kind: ChartKind;
  title?: string;
  showLegend: boolean;
  showValues: boolean;
  palette: string[];
  dataBinding?: string;
};

export type ChartWrapper = {
  id: string;
  name: string;
  spec: ChartSpec;
  dataset: ChartDataset;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PieSlice = {
  label: string;
  value: number;
  color: string;
  startAngle: number;
  endAngle: number;
};

const DEFAULT_CHART_COLORS = ['#2440F0', '#D8F55A', '#FF6A46', '#4FA57D', '#B9A7FF'];

export function pieSlices(spec: ChartSpec, dataset: ChartDataset): PieSlice[] {
  const total = dataset.values.reduce((sum, value) => sum + Math.max(0, value), 0) || 1;
  let cursor = -Math.PI / 2;
  return dataset.values.map((value, index) => {
    const angle = (Math.max(0, value) / total) * Math.PI * 2;
    const slice = {
      label: dataset.labels[index] ?? `Series ${index + 1}`,
      value,
      color: dataset.colors?.[index] ?? spec.palette[index % spec.palette.length] ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
      startAngle: cursor,
      endAngle: cursor + angle,
    };
    cursor += angle;
    return slice;
  });
}

export function barGeometry(spec: ChartSpec, dataset: ChartDataset, width: number, height: number) {
  const max = Math.max(...dataset.values, 1);
  const gap = 12;
  const barWidth = Math.max(4, (width - gap * (dataset.values.length - 1)) / dataset.values.length);
  return dataset.values.map((value, index) => ({
    label: dataset.labels[index] ?? `Series ${index + 1}`,
    value,
    color: dataset.colors?.[index] ?? spec.palette[index % spec.palette.length] ?? DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
    x: index * (barWidth + gap),
    y: height - (value / max) * height,
    w: barWidth,
    h: (value / max) * height,
  }));
}

export function linePoints(dataset: ChartDataset, width: number, height: number) {
  const max = Math.max(...dataset.values, 1);
  const min = Math.min(...dataset.values, 0);
  const range = max - min || 1;
  return dataset.values.map((value, index) => ({
    x: dataset.values.length === 1 ? width / 2 : (index / (dataset.values.length - 1)) * width,
    y: height - ((value - min) / range) * height,
    value,
    label: dataset.labels[index] ?? `Series ${index + 1}`,
  }));
}

export const CHART_WRAPPERS: ChartWrapper[] = [
  {
    id: 'revenue-pie',
    name: 'Revenue mix',
    spec: { kind: 'pie', title: 'Revenue mix', showLegend: true, showValues: true, palette: ['#2440F0', '#D8F55A', '#FF6A46', '#4FA57D'] },
    dataset: { labels: ['Product', 'Services', 'Partnerships', 'Other'], values: [48, 26, 18, 8], unit: '%' },
    x: 96, y: 250, w: 820, h: 520,
  },
  {
    id: 'quarterly-bar',
    name: 'Quarterly growth',
    spec: { kind: 'bar', title: 'Quarterly growth', showLegend: false, showValues: true, palette: ['#2440F0', '#B9A7FF'] },
    dataset: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [18, 27, 34, 46], unit: 'k' },
    x: 96, y: 250, w: 820, h: 520,
  },
  {
    id: 'trend-line',
    name: 'Retention trend',
    spec: { kind: 'line', title: 'Retention trend', showLegend: false, showValues: false, palette: ['#4FA57D'] },
    dataset: { labels: ['W1', 'W2', 'W3', 'W4'], values: [68, 71, 76, 82], unit: '%' },
    x: 96, y: 250, w: 820, h: 520,
  },
];
