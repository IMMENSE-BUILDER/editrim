import { ICONS } from '../icons';
import type { Rect } from '../types';

export type VectorCategory = 'shape' | 'blob' | 'icon' | 'ui' | 'frame' | 'mockup';

export type VectorAsset = {
  id: string;
  name: string;
  category: VectorCategory;
  viewBox: string;
  paths: string[];
  tags: string[];
  source: 'builtin' | 'ai' | 'upload';
  sanitized: boolean;
};

export type ParametricShapeKind = 'polygon' | 'star' | 'blob' | 'rounded-rect';

export type ParametricShape = {
  id: string;
  name: string;
  kind: ParametricShapeKind;
  points: number;
  innerRatio: number;
  cornerRadius: number;
  width: number;
  height: number;
};

export type FrameMask = {
  id: string;
  name: string;
  kind: 'rect' | 'ellipse' | 'arch' | 'polygon' | 'custom-path';
  clipPath: string;
  radius?: number;
  inset?: number;
};

export type DeviceMockup = FrameMask & {
  device: 'phone' | 'tablet' | 'browser' | 'laptop';
  screen: Rect;
  bezel: number;
};

export type VectorCluster = {
  id: VectorCategory;
  label: string;
  assetIds: string[];
};

const ALLOWED_TAGS = new Set([
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath',
]);
const ALLOWED_ATTRS = new Set([
  'xmlns', 'viewBox', 'width', 'height', 'fill', 'stroke', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity', 'd',
  'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2',
  'points', 'transform', 'clip-path', 'clip-rule', 'fill-rule', 'id',
  'offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'gradientTransform',
]);

export const VECTOR_SANITIZER = {
  allowedTags: [...ALLOWED_TAGS],
  allowedAttributes: [...ALLOWED_ATTRS],
  maxBytes: 120_000,
  stripScripts: true,
} as const;

export function sanitizeVectorSvg(raw: string): string {
  if (raw.length > VECTOR_SANITIZER.maxBytes || typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return '';
  const elements = [...doc.querySelectorAll('*')];
  elements.forEach(element => {
    const tag = element.tagName;
    if (!ALLOWED_TAGS.has(tag)) {
      element.remove();
      return;
    }
    [...element.attributes].forEach(attribute => {
      if (!ALLOWED_ATTRS.has(attribute.name)) element.removeAttribute(attribute.name);
    });
  });
  return doc.documentElement.outerHTML;
}

export const BUILT_IN_VECTORS: VectorAsset[] = ICONS.map(icon => ({
  id: `icon-${icon.id}`,
  name: icon.label,
  category: 'icon',
  viewBox: '0 0 24 24',
  paths: icon.paths,
  tags: ['line', 'ui', icon.id],
  source: 'builtin',
  sanitized: true,
}));

export const VECTOR_ASSETS: VectorAsset[] = [
  ...BUILT_IN_VECTORS,
  {
    id: 'blob-organic-01',
    name: 'Organic blob 01',
    category: 'blob',
    viewBox: '0 0 200 200',
    paths: ['M40 120C20 83 47 31 91 22c51-10 91 32 83 79-8 48-53 86-98 74-19-5-28-30-36-55z'],
    tags: ['organic', 'mask', 'soft'],
    source: 'builtin',
    sanitized: true,
  },
  {
    id: 'shape-arch',
    name: 'Arch',
    category: 'shape',
    viewBox: '0 0 200 200',
    paths: ['M0 200V90a100 100 0 0 1 200 0v110Z'],
    tags: ['arch', 'geometric', 'frame'],
    source: 'builtin',
    sanitized: true,
  },
  {
    id: 'ui-lower-third',
    name: 'Lower third plate',
    category: 'ui',
    viewBox: '0 0 640 120',
    paths: ['M0 0h520a40 40 0 0 1 40 40v40a40 40 0 0 1-40 40H0Z', 'M32 44h260v12H32z', 'M32 72h180v8H32z'],
    tags: ['lower-third', 'video', 'ui'],
    source: 'builtin',
    sanitized: true,
  },
  {
    id: 'frame-browser',
    name: 'Browser frame',
    category: 'frame',
    viewBox: '0 0 1000 700',
    paths: ['M0 0h1000v700H0z', 'M0 52h1000'],
    tags: ['browser', 'device', 'mask'],
    source: 'builtin',
    sanitized: true,
  },
  {
    id: 'mockup-phone',
    name: 'Phone mockup',
    category: 'mockup',
    viewBox: '0 0 300 600',
    paths: ['M20 0h260a20 20 0 0 1 20 20v560a20 20 0 0 1-20 20H20a20 20 0 0 1-20-20V20A20 20 0 0 1 20 0Z', 'M18 18h264v564H18z'],
    tags: ['phone', 'device', 'mockup'],
    source: 'builtin',
    sanitized: true,
  },
];

export function clusterVectors(assets: VectorAsset[] = VECTOR_ASSETS): VectorCluster[] {
  const categories: VectorCategory[] = ['shape', 'blob', 'icon', 'ui', 'frame', 'mockup'];
  return categories.map(category => ({
    id: category,
    label: category === 'ui' ? 'UI' : category[0].toUpperCase() + category.slice(1),
    assetIds: assets.filter(asset => asset.category === category).map(asset => asset.id),
  }));
}

function polygonPoints(cx: number, cy: number, radius: number, sides: number, rotation = -Math.PI / 2): string {
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index / sides) * Math.PI * 2;
    return `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`;
  }).join(' ');
}

export function parametricPath(shape: ParametricShape): string {
  const { width, height } = shape;
  const cx = width / 2;
  const cy = height / 2;
  if (shape.kind === 'polygon') {
    return `M${polygonPoints(cx, cy, Math.min(width, height) / 2, shape.points)}Z`;
  }
  if (shape.kind === 'star') {
    const outer = Math.min(width, height) / 2;
    const inner = outer * shape.innerRatio;
    const count = Math.max(3, shape.points);
    return `M${Array.from({ length: count * 2 }, (_, index) => {
      const radius = index % 2 === 0 ? outer : inner;
      const angle = -Math.PI / 2 + (index / (count * 2)) * Math.PI * 2;
      return `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`;
    }).join(' ')}Z`;
  }
  if (shape.kind === 'rounded-rect') {
    const radius = Math.min(shape.cornerRadius, width / 2, height / 2);
    return `M${radius},0H${width - radius}A${radius},${radius} 0 0 1 ${width},${radius}V${height - radius}A${radius},${radius} 0 0 1 ${width - radius},${height}H${radius}A${radius},${radius} 0 0 1 0,${height - radius}V${radius}A${radius},${radius} 0 0 1 ${radius},0Z`;
  }
  return `M${width * 0.3},0C${width * 0.02},${height * 0.15} ${width * 0.02},${height * 0.85} ${width * 0.3},${height}C${width * 0.62},${height * 1.04} ${width * 0.98},${height * 0.72} ${width},${height * 0.42}C${width * 1.02},${height * 0.12} ${width * 0.72},${height * -0.08} ${width * 0.3},0Z`;
}

export const PARAMETRIC_SHAPES: ParametricShape[] = [
  { id: 'polygon-6', name: 'Hexagon', kind: 'polygon', points: 6, innerRatio: 0.5, cornerRadius: 0, width: 400, height: 400 },
  { id: 'star-5', name: 'Five-point star', kind: 'star', points: 5, innerRatio: 0.44, cornerRadius: 0, width: 400, height: 400 },
  { id: 'blob', name: 'Organic blob', kind: 'blob', points: 8, innerRatio: 0.6, cornerRadius: 0, width: 400, height: 400 },
  { id: 'rounded', name: 'Rounded frame', kind: 'rounded-rect', points: 4, innerRatio: 0.5, cornerRadius: 32, width: 480, height: 320 },
];

export const MASK_FRAMES: FrameMask[] = [
  { id: 'mask-rect', name: 'Rectangle', kind: 'rect', clipPath: 'inset(0)' },
  { id: 'mask-circle', name: 'Circle', kind: 'ellipse', clipPath: 'circle(50% at 50% 50%)' },
  { id: 'mask-arch', name: 'Arch', kind: 'arch', clipPath: 'path("M0 100V50a50 50 0 0 1 100 0v50Z")' },
  { id: 'mask-hex', name: 'Hexagon', kind: 'polygon', clipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)' },
  { id: 'mask-blob', name: 'Organic blob', kind: 'custom-path', clipPath: 'path("M40 120C20 83 47 31 91 22c51-10 91 32 83 79-8 48-53 86-98 74-19-5-28-30-36-55z")' },
];

export const DEVICE_MOCKUPS: DeviceMockup[] = [
  {
    id: 'mockup-phone',
    name: 'Phone',
    device: 'phone',
    kind: 'rect',
    clipPath: 'inset(0 round 48px)',
    screen: { x: 18, y: 18, w: 264, h: 564 },
    bezel: 18,
  },
  {
    id: 'mockup-browser',
    name: 'Browser',
    device: 'browser',
    kind: 'rect',
    clipPath: 'inset(0 round 12px)',
    screen: { x: 0, y: 52, w: 960, h: 548 },
    bezel: 0,
  },
  {
    id: 'mockup-tablet',
    name: 'Tablet',
    device: 'tablet',
    kind: 'rect',
    clipPath: 'inset(0 round 28px)',
    screen: { x: 22, y: 22, w: 556, h: 716 },
    bezel: 22,
  },
  {
    id: 'mockup-laptop',
    name: 'Laptop',
    device: 'laptop',
    kind: 'rect',
    clipPath: 'inset(0 round 14px)',
    screen: { x: 24, y: 20, w: 912, h: 540 },
    bezel: 24,
  },
];
