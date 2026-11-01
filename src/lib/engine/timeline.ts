export type EasingName = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export type TransitionKind = 'dissolve' | 'slide' | 'wipe' | 'push' | 'zoom';

export type TransitionFormula = {
  math: string;
  css: string;
  glsl: string;
};

export type TransitionPreset = {
  id: string;
  name: string;
  kind: TransitionKind;
  durationMs: number;
  easing: EasingName;
  formula: TransitionFormula;
};

export type TimelineKeyframe = {
  at: number;
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
};

export type TimelineClip = {
  id: string;
  layerId: string;
  assetId?: string;
  startTime: number;
  duration: number;
  exitTime: number;
  transitionIn?: string;
  transitionOut?: string;
  keyframes?: TimelineKeyframe[];
};

export type TimelineLayer = {
  id: string;
  name: string;
  kind: 'background' | 'content' | 'overlay' | 'audio';
  zIndex: number;
  clips: TimelineClip[];
};

export type LottieHook = {
  src: string;
  renderer: 'svg' | 'canvas';
  loop: boolean;
  autoplay: boolean;
  speed?: number;
};

export type MotionOverlay = {
  id: string;
  name: string;
  kind: 'countdown' | 'lower-third' | 'ticker' | 'logo' | 'progress';
  startTime: number;
  duration: number;
  transparent: boolean;
  lottie?: LottieHook;
};

export type TimelineComposition = {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  layers: TimelineLayer[];
  transitions: string[];
  overlays: MotionOverlay[];
};

export type TransitionFrame = {
  opacity: number;
  translateX: number;
  translateY: number;
  clipInsetRight: number;
  scale: number;
};

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const linear = (t: number) => t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export const EASING_FUNCTIONS: Record<EasingName, (t: number) => number> = {
  linear,
  'ease-in': easeIn,
  'ease-out': easeOut,
  'ease-in-out': easeInOut,
};

export const TRANSITIONS: TransitionPreset[] = [
  {
    id: 'dissolve',
    name: 'Dissolve',
    kind: 'dissolve',
    durationMs: 420,
    easing: 'ease-out',
    formula: {
      math: 'mix(a, b, t) = a × (1 − t) + b × t',
      css: 'opacity: calc(1 - var(--t));',
      glsl: 'vec4 dissolve(vec4 a, vec4 b, float t) { return mix(a, b, t); }',
    },
  },
  {
    id: 'slide-left',
    name: 'Slide left',
    kind: 'slide',
    durationMs: 380,
    easing: 'ease-in-out',
    formula: {
      math: 'x(t) = (1 − t) × width',
      css: 'transform: translate3d(calc((1 - var(--t)) * 100%), 0, 0);',
      glsl: 'vec2 slide(vec2 p, float t) { return p + vec2((1.0 - t) * 1.0, 0.0); }',
    },
  },
  {
    id: 'wipe-right',
    name: 'Wipe right',
    kind: 'wipe',
    durationMs: 360,
    easing: 'ease-out',
    formula: {
      math: 'reveal(t) = t × width',
      css: 'clip-path: inset(0 calc((1 - var(--t)) * 100%) 0 0);',
      glsl: 'float wipeMask(vec2 uv, float t) { return step(uv.x, t); }',
    },
  },
  {
    id: 'push-up',
    name: 'Push up',
    kind: 'push',
    durationMs: 420,
    easing: 'ease-in-out',
    formula: {
      math: 'y(t) = (1 − t) × height',
      css: 'transform: translate3d(0, calc((1 - var(--t)) * 100%), 0);',
      glsl: 'vec2 push(vec2 p, float t) { return p + vec2(0.0, 1.0 - t); }',
    },
  },
  {
    id: 'zoom-through',
    name: 'Zoom through',
    kind: 'zoom',
    durationMs: 460,
    easing: 'ease-out',
    formula: {
      math: 's(t) = 1 + (t × 0.08)',
      css: 'transform: scale(calc(1 + var(--t) * 0.08));',
      glsl: 'vec2 zoom(vec2 p, float t) { return p * (1.0 + t * 0.08); }',
    },
  },
];

export function transitionFrame(id: string, progress: number): TransitionFrame {
  const transition = TRANSITIONS.find(item => item.id === id) ?? TRANSITIONS[0];
  const t = EASING_FUNCTIONS[transition.easing](clamp01(progress));
  switch (transition.kind) {
    case 'slide':
      return { opacity: 1, translateX: (1 - t) * 100, translateY: 0, clipInsetRight: 0, scale: 1 };
    case 'wipe':
      return { opacity: 1, translateX: 0, translateY: 0, clipInsetRight: (1 - t) * 100, scale: 1 };
    case 'push':
      return { opacity: 1, translateX: 0, translateY: (1 - t) * 100, clipInsetRight: 0, scale: 1 };
    case 'zoom':
      return { opacity: 1, translateX: 0, translateY: 0, clipInsetRight: 0, scale: 1 + t * 0.08 };
    case 'dissolve':
    default:
      return { opacity: 1 - t, translateX: 0, translateY: 0, clipInsetRight: 0, scale: 1 };
  }
}

export function validateTimeline(composition: TimelineComposition): string[] {
  const errors: string[] = [];
  if (composition.fps <= 0) errors.push('fps must be positive');
  if (composition.duration <= 0) errors.push('duration must be positive');
  const ids = new Set<string>();
  composition.layers.forEach(layer => {
    layer.clips.forEach(clip => {
      if (ids.has(clip.id)) errors.push(`duplicate clip id: ${clip.id}`);
      ids.add(clip.id);
      if (clip.startTime < 0) errors.push(`${clip.id}: startTime < 0`);
      if (clip.duration <= 0) errors.push(`${clip.id}: duration must be positive`);
      if (clip.exitTime + 1e-6 < clip.startTime + clip.duration) errors.push(`${clip.id}: exitTime before clip end`);
      if (clip.exitTime > composition.duration) errors.push(`${clip.id}: exitTime exceeds composition`);
      if (clip.transitionIn && !TRANSITIONS.some(t => t.id === clip.transitionIn)) errors.push(`${clip.id}: unknown transitionIn`);
      if (clip.transitionOut && !TRANSITIONS.some(t => t.id === clip.transitionOut)) errors.push(`${clip.id}: unknown transitionOut`);
    });
  });
  return errors;
}

export const TIMELINE_COMPOSITIONS: TimelineComposition[] = [
  {
    id: 'story-launch',
    name: 'Story launch · 15s',
    width: 1080,
    height: 1920,
    fps: 30,
    duration: 15,
    transitions: ['dissolve', 'slide-left', 'wipe-right'],
    layers: [
      {
        id: 'bg', name: 'Background', kind: 'background', zIndex: 0,
        clips: [{ id: 'bg-1', layerId: 'bg', startTime: 0, duration: 15, exitTime: 15, keyframes: [{ at: 0, opacity: 0.6 }, { at: 1, opacity: 1 }] }],
      },
      {
        id: 'content', name: 'Product shots', kind: 'content', zIndex: 1,
        clips: [
          { id: 'shot-1', layerId: 'content', startTime: 0.4, duration: 4.2, exitTime: 4.6, transitionIn: 'dissolve', transitionOut: 'slide-left' },
          { id: 'shot-2', layerId: 'content', startTime: 4.6, duration: 4.2, exitTime: 8.8, transitionIn: 'wipe-right' },
        ],
      },
      {
        id: 'overlay', name: 'Brand overlays', kind: 'overlay', zIndex: 2,
        clips: [{ id: 'lower-third-1', layerId: 'overlay', startTime: 1, duration: 4, exitTime: 5, transitionIn: 'dissolve' }],
      },
    ],
    overlays: [
      {
        id: 'countdown-3', name: '3-2-1 countdown', kind: 'countdown', startTime: 12, duration: 3, transparent: true,
        lottie: { src: '/motion/countdown.json', renderer: 'svg', loop: false, autoplay: true },
      },
      {
        id: 'lower-third', name: 'Lower third', kind: 'lower-third', startTime: 1, duration: 4, transparent: true,
      },
    ],
  },
];

export function lottieConfig(overlay: MotionOverlay) {
  if (!overlay.lottie) return null;
  return {
    ...overlay.lottie,
    container: 'transparent',
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet', clearCanvas: true },
  } as const;
}
