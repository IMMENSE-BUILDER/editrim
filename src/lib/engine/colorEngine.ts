import { PALETTES } from '../palettes';

export type Mood = 'editorial' | 'bold' | 'warm' | 'cool' | 'luxe' | 'playful' | 'minimal' | 'natural';

export type MoodPalette = {
  id: string;
  name: string;
  mood: Mood[];
  colors: [string, string, string, ...string[]];
  usage: string;
};

export const MOOD_PALETTES: MoodPalette[] = [
  { id: 'ink-lime', name: 'Ink & Lime', mood: ['editorial', 'bold'], colors: ['#14130F', '#F4F1EA', '#D8F55A', '#2440F0'], usage: 'Editorial covers, launch posters, brand hero sections.' },
  { id: 'sunset-studio', name: 'Sunset Studio', mood: ['warm', 'playful'], colors: ['#2A1710', '#FFF3E6', '#FF6A46', '#E8B33C', '#7A3E65'], usage: 'Hospitality, food, event and warm newsletter layouts.' },
  { id: 'cobalt', name: 'Cobalt', mood: ['cool', 'bold'], colors: ['#0A1440', '#EDF1FF', '#2140F0', '#B9AEFF'], usage: 'Product, technology and presentation systems.' },
  { id: 'botanical', name: 'Botanical', mood: ['natural', 'minimal'], colors: ['#12261D', '#F0F3E8', '#4FA57D', '#DCE8B5'], usage: 'Wellness, food, sustainability and editorial features.' },
  { id: 'blush', name: 'Blush', mood: ['warm', 'luxe'], colors: ['#3A1F2B', '#FFF5F4', '#E89BA8', '#7A3E65'], usage: 'Beauty, wedding, invitation and premium gifting.' },
  { id: 'monochrome', name: 'Monochrome', mood: ['minimal', 'editorial'], colors: ['#111111', '#F5F5F3', '#8A8A86', '#D3D3CE'], usage: 'Type-led layouts where imagery carries colour.' },
  { id: 'ocean', name: 'Ocean', mood: ['cool', 'natural'], colors: ['#06283D', '#EAF6FF', '#1363DF', '#47B5FF'], usage: 'Travel, finance, SaaS and calm data stories.' },
  { id: 'citrus', name: 'Citrus', mood: ['playful', 'warm'], colors: ['#2E2A12', '#FFFBE8', '#F2C438', '#EE7B30'], usage: 'Retail, sale, food and energetic social posts.' },
  { id: 'midnight-paper', name: 'Midnight Paper', mood: ['luxe', 'editorial'], colors: ['#0B0911', '#F5F1FF', '#B9A7FF', '#6C9DFF', '#D8F55A'], usage: 'Dark dashboards, premium launches and after-hours events.' },
  { id: 'soft-serve', name: 'Soft Serve', mood: ['playful', 'warm'], colors: ['#3B2A52', '#FFF8F2', '#FFB3C7', '#B8E0FF', '#F9E27A'], usage: 'Consumer, birthday, invitation and playful brand systems.' },
];

export const PALETTE_COUNT = PALETTES.length + MOOD_PALETTES.length;

export type GradientStop = { offset: number; color: string };

export type LinearGradientSpec = {
  kind: 'linear';
  angle: number;
  stops: GradientStop[];
};

export type RadialGradientSpec = {
  kind: 'radial';
  center: [number, number];
  radius: number;
  stops: GradientStop[];
};

export type MeshGradientPoint = { x: number; y: number; color: string; radius: number };

export type MeshGradientSpec = {
  kind: 'mesh';
  base: string;
  points: MeshGradientPoint[];
};

export type GradientSpec = LinearGradientSpec | RadialGradientSpec | MeshGradientSpec;

export const GRADIENT_PRESETS: GradientSpec[] = [
  { kind: 'linear', angle: 135, stops: [{ offset: 0, color: '#0B0911' }, { offset: 1, color: '#140C1F' }] },
  { kind: 'linear', angle: 90, stops: [{ offset: 0, color: '#2440F0' }, { offset: 1, color: '#9D71FF' }] },
  { kind: 'radial', center: [0.5, 0.4], radius: 0.68, stops: [{ offset: 0, color: '#D8F55A' }, { offset: 1, color: '#12261D' }] },
  {
    kind: 'mesh',
    base: '#0B0911',
    points: [
      { x: 0.15, y: 0.1, color: '#00D6CD', radius: 0.8 },
      { x: 0.9, y: 0.12, color: '#8236FF', radius: 0.85 },
      { x: 0.5, y: 0.95, color: '#501E6E', radius: 0.75 },
    ],
  },
];

export function stopsToCss(stops: GradientStop[]): string {
  return stops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .map(stop => `${stop.color} ${Math.round(stop.offset * 100)}%`)
    .join(', ');
}

export function toCssGradient(spec: GradientSpec): string {
  if (spec.kind === 'linear') {
    return `linear-gradient(${spec.angle}deg, ${stopsToCss(spec.stops)})`;
  }
  if (spec.kind === 'radial') {
    return `radial-gradient(circle at ${spec.center[0] * 100}% ${spec.center[1] * 100}%, ${stopsToCss(spec.stops)})`;
  }
  return [
    spec.base,
    ...spec.points.map(point => `radial-gradient(circle at ${point.x * 100}% ${point.y * 100}%, ${point.color}, transparent ${point.radius * 100}%)`),
  ].join(', ');
}

export function toCanvasGradient(
  ctx: CanvasRenderingContext2D,
  spec: GradientSpec,
  width: number,
  height: number,
): CanvasGradient {
  if (spec.kind === 'mesh') {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(width, height));
    gradient.addColorStop(0, spec.base);
    gradient.addColorStop(1, spec.base);
    return gradient;
  }
  let gradient: CanvasGradient;
  if (spec.kind === 'linear') {
    const angle = (spec.angle * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.max(width, height);
    gradient = ctx.createLinearGradient(
      cx - Math.cos(angle) * radius / 2,
      cy - Math.sin(angle) * radius / 2,
      cx + Math.cos(angle) * radius / 2,
      cy + Math.sin(angle) * radius / 2,
    );
  } else {
    gradient = ctx.createRadialGradient(
      spec.center[0] * width,
      spec.center[1] * height,
      0,
      spec.center[0] * width,
      spec.center[1] * height,
      spec.radius * Math.max(width, height),
    );
  }
  spec.stops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .forEach(stop => gradient.addColorStop(Math.max(0, Math.min(1, stop.offset)), stop.color));
  return gradient;
}

/** Composite a mesh using intersecting radial gradients, clipped to the canvas. */
export function drawMeshGradient(ctx: CanvasRenderingContext2D, spec: MeshGradientSpec, width: number, height: number): void {
  ctx.save();
  ctx.fillStyle = spec.base;
  ctx.fillRect(0, 0, width, height);
  spec.points.forEach(point => {
    const radius = point.radius * Math.max(width, height);
    const gradient = ctx.createRadialGradient(point.x * width, point.y * height, 0, point.x * width, point.y * height, radius);
    gradient.addColorStop(0, point.color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
  ctx.restore();
}
