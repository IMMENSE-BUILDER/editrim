import { uid } from '../utils';

export type PhotoFilterId = 'original' | 'mono' | 'noir' | 'warm' | 'cool' | 'cinematic' | 'vivid' | 'soft' | 'fade';
export type PhotoFilterState = PhotoFilterId | 'custom';
export type PhotoRotate = 0 | 90 | 180 | 270;

export type PhotoCrop = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PhotoAdjustments = {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  temperature: number;
  tint: number;
  vibrance: number;
  saturation: number;
  clarity: number;
  sharpen: number;
  blur: number;
  vignette: number;
  grain: number;
  fade: number;
};

export type PhotoTransform = {
  rotate: PhotoRotate;
  flipX: boolean;
  flipY: boolean;
};

export type PhotoTextLayer = {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  fontFamily: string;
  weight: number;
  align: 'left' | 'center' | 'right';
  opacity: number;
  rotation: number;
};

export type PhotoSettings = {
  adjustments: PhotoAdjustments;
  transform: PhotoTransform;
  crop: PhotoCrop;
  filter: PhotoFilterState;
  text: PhotoTextLayer[];
};

export type PhotoSession = {
  name: string;
  sourceKey: string;
  width: number;
  height: number;
  settings: PhotoSettings;
  updatedAt: number;
};

export const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
  clarity: 0,
  sharpen: 0,
  blur: 0,
  vignette: 0,
  grain: 0,
  fade: 0,
};

export const DEFAULT_SETTINGS: PhotoSettings = {
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  transform: { rotate: 0, flipX: false, flipY: false },
  crop: { x: 0, y: 0, w: 1, h: 1 },
  filter: 'original',
  text: [],
};

export const PHOTO_ASPECTS = [
  { id: 'free', label: 'Free' },
  { id: 'original', label: 'Original' },
  { id: '1-1', label: '1:1', ratio: 1 },
  { id: '4-5', label: '4:5', ratio: 4 / 5 },
  { id: '3-2', label: '3:2', ratio: 3 / 2 },
  { id: '16-9', label: '16:9', ratio: 16 / 9 },
  { id: '9-16', label: '9:16', ratio: 9 / 16 },
] as const;

export type PhotoAspectId = typeof PHOTO_ASPECTS[number]['id'];

export type PhotoFilterPreset = {
  id: PhotoFilterId;
  name: string;
  tone: [string, string];
  adjustments: Partial<PhotoAdjustments>;
};

export const FILTER_PRESETS: PhotoFilterPreset[] = [
  { id: 'original', name: 'Original', tone: ['#7d8493', '#d8dde8'], adjustments: {} },
  { id: 'mono', name: 'Mono', tone: ['#5e5e5e', '#e9e9e9'], adjustments: { saturation: -100, contrast: 8 } },
  { id: 'noir', name: 'Noir', tone: ['#171717', '#8e8e8e'], adjustments: { saturation: -100, contrast: 28, shadows: -18, vignette: 24 } },
  { id: 'warm', name: 'Warm', tone: ['#e6a34e', '#ffd6a0'], adjustments: { temperature: 28, tint: 6, saturation: 8 } },
  { id: 'cool', name: 'Cool', tone: ['#5da6d8', '#c5e4ff'], adjustments: { temperature: -28, tint: -5, saturation: 4 } },
  { id: 'cinematic', name: 'Cinematic', tone: ['#1a4f5f', '#e99754'], adjustments: { contrast: 14, shadows: 16, saturation: -8, temperature: 8, vignette: 22 } },
  { id: 'vivid', name: 'Vivid', tone: ['#5a44ff', '#ff8a45'], adjustments: { contrast: 14, saturation: 26, vibrance: 20 } },
  { id: 'soft', name: 'Soft', tone: ['#d7b7c8', '#f7eee8'], adjustments: { contrast: -12, highlights: 12, clarity: -18, fade: 10 } },
  { id: 'fade', name: 'Fade', tone: ['#8f9a8b', '#d9d2bd'], adjustments: { contrast: -10, saturation: -12, fade: 42 } },
];

export function createTextLayer(text = 'Your text'): PhotoTextLayer {
  return {
    id: uid('ptext'),
    text,
    x: 0.5,
    y: 0.82,
    size: 64,
    color: '#F4F1EA',
    fontFamily: 'Inter',
    weight: 600,
    align: 'center',
    opacity: 1,
    rotation: 0,
  };
}

export function aspectRatio(aspect: PhotoAspectId): number | null {
  const item = PHOTO_ASPECTS.find(entry => entry.id === aspect);
  if (!item || !('ratio' in item)) return null;
  return item.ratio;
}

export type CropHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se';

export const CROP_MIN = 0.04;

export function clampCrop(crop: PhotoCrop): PhotoCrop {
  const w = Math.max(CROP_MIN, Math.min(1, crop.w));
  const h = Math.max(CROP_MIN, Math.min(1, crop.h));
  return {
    x: Math.max(0, Math.min(1 - w, crop.x)),
    y: Math.max(0, Math.min(1 - h, crop.y)),
    w,
    h,
  };
}

export function translateCrop(crop: PhotoCrop, dx: number, dy: number): PhotoCrop {
  return clampCrop({ ...crop, x: crop.x + dx, y: crop.y + dy });
}

export function centeredCropForAspect(ratio: number | null, imageWidth: number, imageHeight: number): PhotoCrop {
  if (!ratio) return { x: 0, y: 0, w: 1, h: 1 };
  const imageRatio = imageWidth / imageHeight;
  if (imageRatio > ratio) {
    const w = ratio / imageRatio;
    return { x: (1 - w) / 2, y: 0, w, h: 1 };
  }
  const h = imageRatio / ratio;
  return { x: 0, y: (1 - h) / 2, w: 1, h };
}

/**
 * Resize the crop from one corner while keeping the opposite corner fixed.
 * Pointer and image dimensions are normalised/pixels of the rotated image.
 */
export function dragCropToPointer(
  crop: PhotoCrop,
  handle: Exclude<CropHandle, 'move'>,
  pointerX: number,
  pointerY: number,
  imageWidth: number,
  imageHeight: number,
  ratio: number | null,
): PhotoCrop {
  let left = crop.x;
  let top = crop.y;
  let right = crop.x + crop.w;
  let bottom = crop.y + crop.h;

  if (handle === 'nw' || handle === 'sw') left = Math.min(Math.max(0, pointerX), right - CROP_MIN);
  if (handle === 'ne' || handle === 'se') right = Math.max(Math.min(1, pointerX), left + CROP_MIN);
  if (handle === 'nw' || handle === 'ne') top = Math.min(Math.max(0, pointerY), bottom - CROP_MIN);
  if (handle === 'sw' || handle === 'se') bottom = Math.max(Math.min(1, pointerY), top + CROP_MIN);

  let width = right - left;
  let height = bottom - top;

  if (ratio) {
    height = (width * imageWidth) / (ratio * imageHeight);
    if (handle === 'nw' || handle === 'ne') top = bottom - height;
    else bottom = top + height;

    if (top < 0 || bottom > 1) {
      const maxHeight = Math.min(bottom, 1) - Math.max(top, 0);
      const limitHeight = Math.min(height, maxHeight);
      width = (limitHeight * ratio * imageHeight) / imageWidth;
      height = limitHeight;
      if (handle === 'nw' || handle === 'ne') top = bottom - height;
      else bottom = top + height;
    }
    if (left < 0 || right > 1 || width > 1) {
      width = Math.min(width, handle === 'nw' || handle === 'sw' ? right : 1 - left);
      height = (width * imageWidth) / (ratio * imageHeight);
      if (handle === 'nw' || handle === 'ne') top = bottom - height;
      else bottom = top + height;
    }
    if (handle === 'nw' || handle === 'sw') left = right - width;
    else right = left + width;
  }

  return clampCrop({ x: left, y: top, w: right - left, h: bottom - top });
}
