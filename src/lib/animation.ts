import type { AnimPreset, El, ElementAnimation, Page } from './types';

export const DEFAULT_ANIM: ElementAnimation = {
  enter: 'none',
  exit: 'none',
  emphasis: 'none',
  duration: 0.6,
  delay: 0,
};

export const ANIM_PRESETS: { id: AnimPreset; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade' },
  { id: 'rise', label: 'Rise' },
  { id: 'drop', label: 'Drop' },
  { id: 'pan-left', label: 'Pan L' },
  { id: 'pan-right', label: 'Pan R' },
  { id: 'pop', label: 'Pop' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'blur', label: 'Blur' },
  { id: 'wipe', label: 'Wipe' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'typewriter', label: 'Type' },
];

export type MagicAnimateStyle = 'subtle' | 'bold' | 'playful' | 'cinematic';

export type AnimFrameState = {
  opacity: number;
  dx: number;
  dy: number;
  scale: number;
  rotate: number;
  blur: number;
  clipX: number;
  chars?: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const easeOutBack = (p: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

function applyPreset(
  preset: AnimPreset,
  progress: number,
  el: El,
  entering: boolean,
): Partial<AnimFrameState> {
  if (preset === 'none') return {};
  const p = preset === 'bounce' ? easeOutBack(progress) : easeOutCubic(progress);
  const inv = entering ? 1 - p : p;
  const alpha = entering ? clamp01(p * 1.15) : clamp01(1 - p);

  switch (preset) {
    case 'fade':
      return { opacity: alpha };
    case 'rise':
      return { opacity: alpha, dy: el.h * 0.25 * inv };
    case 'drop':
      return { opacity: alpha, dy: -el.h * 0.25 * inv };
    case 'pan-left':
      return { opacity: alpha, dx: el.w * 0.3 * inv };
    case 'pan-right':
      return { opacity: alpha, dx: -el.w * 0.3 * inv };
    case 'pop':
      return { opacity: alpha, scale: 0.6 + 0.4 * (entering ? p : 1 - p) };
    case 'zoom':
      return { opacity: alpha, scale: 0.78 + 0.22 * (entering ? p : 1 - p) };
    case 'blur':
      return { opacity: alpha, blur: 12 * inv };
    case 'wipe':
      return { clipX: entering ? clamp01(p) : clamp01(1 - p) };
    case 'bounce':
      return { opacity: alpha, scale: 0.5 + 0.5 * (entering ? p : 1 - p) };
    case 'typewriter': {
      if (el.type === 'text' && entering) {
        return { chars: Math.max(0, Math.round(el.text.length * clamp01(progress))) };
      }
      return { opacity: alpha };
    }
    default:
      return {};
  }
}

export function animState(el: El, t: number, pageDuration = 5): AnimFrameState {
  const anim = el.animation;
  const out: AnimFrameState = { opacity: 1, dx: 0, dy: 0, scale: 1, rotate: 0, blur: 0, clipX: 1 };
  if (!anim) return out;

  const dur = Math.max(0.1, anim.duration || 0.6);
  const delay = Math.max(0, anim.delay || 0);
  const pageDur = Math.max(delay + dur + 0.2, pageDuration || 5);

  if (anim.enter !== 'none') {
    if (t < delay) {
      return { ...out, opacity: 0, clipX: anim.enter === 'wipe' ? 0 : 1, chars: anim.enter === 'typewriter' && el.type === 'text' ? 0 : undefined };
    }
    if (t < delay + dur) {
      const p = clamp01((t - delay) / dur);
      Object.assign(out, applyPreset(anim.enter, p, el, true));
    }
  }

  if (anim.emphasis && anim.emphasis !== 'none' && t >= delay + dur) {
    const phase = (t - delay - dur) * Math.PI * 2 * 0.85;
    if (anim.emphasis === 'pulse') out.scale *= 1 + 0.04 * Math.sin(phase);
    else if (anim.emphasis === 'wiggle') out.rotate += 3 * Math.sin(phase * 1.4);
    else if (anim.emphasis === 'float') out.dy += 6 * Math.sin(phase);
  }

  const exitStart = Math.max(delay + dur, pageDur - dur);
  if (anim.exit !== 'none' && t >= exitStart) {
    const p = clamp01((t - exitStart) / dur);
    const ex = applyPreset(anim.exit, p, el, false);
    if (ex.opacity !== undefined) out.opacity *= ex.opacity;
    if (ex.dx !== undefined) out.dx += ex.dx;
    if (ex.dy !== undefined) out.dy += ex.dy;
    if (ex.scale !== undefined) out.scale *= ex.scale;
    if (ex.blur !== undefined) out.blur += ex.blur;
    if (ex.clipX !== undefined) out.clipX = Math.min(out.clipX, ex.clipX);
  }

  return out;
}

export function magicAnimate(page: Page, style: MagicAnimateStyle): Page {
  const ordered = [...page.elements]
    .filter(el => !el.hidden)
    .sort((a, b) => (Math.abs(a.y - b.y) > 40 ? a.y - b.y : a.x - b.x));

  const maxFont = ordered.reduce(
    (m, e) => (e.type === 'text' ? Math.max(m, e.fontSize) : m),
    0,
  );
  const stepDelay = style === 'bold' ? 0.14 : style === 'playful' ? 0.16 : style === 'cinematic' ? 0.24 : 0.18;
  const baseDur = style === 'bold' ? 0.55 : style === 'playful' ? 0.7 : style === 'cinematic' ? 0.9 : 0.65;

  const animById = new Map<string, ElementAnimation>();
  let maxEnd = 2;

  ordered.forEach((el, idx) => {
    const delay = Number((idx * stepDelay).toFixed(2));
    let enter: AnimPreset = 'fade';
    let emphasis: ElementAnimation['emphasis'] = 'none';

    if ((el.type === 'shape' || el.type === 'image') && el.w * el.h > 450_000) {
      enter = style === 'cinematic' ? 'zoom' : 'fade';
    } else if (el.type === 'text') {
      const isHeading = el.fontSize >= maxFont * 0.72;
      if (isHeading) {
        enter = style === 'bold' ? 'typewriter' : style === 'playful' ? 'bounce' : style === 'cinematic' ? 'blur' : 'rise';
      } else {
        enter = style === 'bold' ? 'pan-left' : 'fade';
      }
    } else if (el.type === 'chart') {
      enter = 'wipe';
    } else if (el.type === 'icon' || el.type === 'qr') {
      enter = style === 'playful' ? 'bounce' : 'pop';
      if (style === 'playful') emphasis = 'float';
    } else if (el.type === 'mockup' || el.type === 'grid' || el.type === 'table') {
      enter = style === 'cinematic' ? 'rise' : 'pop';
    } else {
      enter = style === 'bold' ? 'pop' : 'fade';
    }

    maxEnd = Math.max(maxEnd, delay + baseDur);
    animById.set(el.id, { enter, exit: 'none', emphasis, duration: baseDur, delay });
  });

  return {
    ...page,
    duration: Math.max(4, Math.ceil(maxEnd + 2)),
    elements: page.elements.map(el => (animById.has(el.id) ? { ...el, animation: animById.get(el.id) } : el)),
  };
}
