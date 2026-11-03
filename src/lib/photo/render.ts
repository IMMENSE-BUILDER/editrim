import { DEFAULT_ADJUSTMENTS, type PhotoAdjustments, type PhotoCrop, type PhotoSettings } from './types';

export type PhotoRenderOptions = {
  /** Bounds the longest output edge, in pixels. */
  maxSize?: number;
  ignoreCrop?: boolean;
  ignoreText?: boolean;
  /** Keeps geometry (crop, rotate, flip) but drops adjustments and text. Used for compare. */
  original?: boolean;
};

export type HistogramData = {
  r: number[];
  g: number[];
  b: number[];
  luma: number[];
};

const clampByte = (value: number) => Math.max(0, Math.min(255, value));

const ADJUSTMENT_KEYS = Object.keys(DEFAULT_ADJUSTMENTS) as (keyof PhotoAdjustments)[];

export function hasPixelWork(adjustments: PhotoAdjustments): boolean {
  return ADJUSTMENT_KEYS.some(key => adjustments[key] !== 0);
}

function applyPixelAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adjustments: PhotoAdjustments,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const exposure = Math.pow(2, adjustments.exposure);
  const contrast = 1 + (adjustments.contrast / 100) * 0.8;
  const temperature = adjustments.temperature / 100;
  const tint = adjustments.tint / 100;
  const highlights = adjustments.highlights / 100;
  const shadows = adjustments.shadows / 100;
  const whites = adjustments.whites / 100;
  const blacks = adjustments.blacks / 100;
  const saturation = adjustments.saturation / 100;
  const vibrance = adjustments.vibrance / 100;
  const fade = (adjustments.fade / 100) * 0.24;
  const vignette = adjustments.vignette / 100;
  const grain = (adjustments.grain / 100) * 18;
  const clarity = adjustments.clarity / 100;
  const sharpen = adjustments.sharpen / 100;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist2 = centerX * centerX + centerY * centerY || 1;

  for (let y = 0; y < height; y++) {
    const dy = y - centerY;
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      let r = pixels[index] / 255;
      let g = pixels[index + 1] / 255;
      let b = pixels[index + 2] / 255;

      if (exposure !== 1) {
        r *= exposure;
        g *= exposure;
        b *= exposure;
      }

      if (temperature !== 0) {
        r += temperature * 0.085;
        b -= temperature * 0.085;
      }
      if (tint !== 0) {
        g += tint * 0.07;
        r -= tint * 0.02;
        b -= tint * 0.02;
      }

      if (contrast !== 1) {
        r = (r - 0.5) * contrast + 0.5;
        g = (g - 0.5) * contrast + 0.5;
        b = (b - 0.5) * contrast + 0.5;
      }

      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (highlights !== 0 && luma > 0.55) {
        const weight = ((luma - 0.55) / 0.45) * highlights * 0.17;
        r += weight;
        g += weight;
        b += weight;
      }
      if (shadows !== 0 && luma < 0.45) {
        const weight = ((0.45 - luma) / 0.45) * shadows * 0.17;
        r += weight;
        g += weight;
        b += weight;
      }
      if (whites !== 0 && luma > 0.8) {
        const weight = ((luma - 0.8) / 0.2) * whites * 0.12;
        r += weight;
        g += weight;
        b += weight;
      }
      if (blacks !== 0 && luma < 0.2) {
        const weight = ((0.2 - luma) / 0.2) * blacks * 0.12;
        r += weight;
        g += weight;
        b += weight;
      }

      if (saturation !== 0 || vibrance !== 0) {
        const grey = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxChannel = r > g ? (r > b ? r : b) : g > b ? g : b;
        const minChannel = r < g ? (r < b ? r : b) : g < b ? g : b;
        const colorRange = maxChannel - minChannel;
        const sat = saturation * 0.6 + vibrance * 0.5 * (1 - Math.min(1, colorRange));
        r = grey + (r - grey) * (1 + sat);
        g = grey + (g - grey) * (1 + sat);
        b = grey + (b - grey) * (1 + sat);
      }

      if (fade > 0) {
        r = r * (1 - fade) + 0.5 * fade;
        g = g * (1 - fade) + 0.5 * fade;
        b = b * (1 - fade) + 0.5 * fade;
      }

      if (vignette > 0) {
        const dx = x - centerX;
        const falloff = 1 - vignette * 0.75 * ((dx * dx + dy * dy) / maxDist2);
        r *= falloff;
        g *= falloff;
        b *= falloff;
      }

      if (grain > 0) {
        let seed = (x * 374761393 + y * 668265263) >>> 0;
        seed = ((seed ^ (seed >>> 13)) * 1274126177) >>> 0;
        const amount = ((seed & 1023) / 1023 - 0.5) * grain;
        r += amount / 255;
        g += amount / 255;
        b += amount / 255;
      }

      pixels[index] = clampByte(r * 255);
      pixels[index + 1] = clampByte(g * 255);
      pixels[index + 2] = clampByte(b * 255);
    }
  }

  const sharpenAmount = Math.min(1.6, clarity * 0.55 + sharpen * 1.2);
  if (sharpenAmount > 0.01 && width > 2 && height > 2) {
    const source = new Uint8ClampedArray(pixels);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = (y * width + x) * 4;
        for (let channel = 0; channel < 3; channel++) {
          const idx = index + channel;
          const average = (
            source[idx - 4] +
            source[idx + 4] +
            source[idx - width * 4] +
            source[idx + width * 4]
          ) / 4;
          pixels[idx] = clampByte(source[idx] + (source[idx] - average) * sharpenAmount);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function drawTextLayers(
  ctx: CanvasRenderingContext2D,
  settings: PhotoSettings,
  width: number,
  height: number,
  scale: number,
) {
  settings.text.forEach(layer => {
    if (!layer.text.trim()) return;
    const fontSize = Math.max(6, layer.size * scale);
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.fillStyle = layer.color;
    ctx.textAlign = layer.align;
    ctx.textBaseline = 'middle';
    ctx.font = `${layer.weight} ${fontSize}px "${layer.fontFamily}", system-ui, sans-serif`;
    ctx.translate(layer.x * width, layer.y * height);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    const lines = layer.text.split('\n');
    const lineHeight = fontSize * 1.16;
    const startY = -((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, 0, startY + index * lineHeight);
    });
    ctx.restore();
  });
}

export function rotatedDimensions(width: number, height: number, rotate: number) {
  return rotate === 90 || rotate === 270
    ? { width: height, height: width }
    : { width, height };
}

/**
 * Rotate and flip the whole source image, then crop the rotated result.
 * Crop coordinates are normalised against the rotated image, which is what the
 * crop overlay shows on screen.
 */
export function sourceCropRect(
  crop: PhotoCrop,
  rotate: number,
  flipX: boolean,
  flipY: boolean,
  sourceWidth: number,
  sourceHeight: number,
) {
  const rotatedWidth = rotate === 90 || rotate === 270 ? sourceHeight : sourceWidth;
  const rotatedHeight = rotate === 90 || rotate === 270 ? sourceWidth : sourceHeight;
  const x0 = (crop.x - 0.5) * rotatedWidth;
  const x1 = (crop.x + crop.w - 0.5) * rotatedWidth;
  const y0 = (crop.y - 0.5) * rotatedHeight;
  const y1 = (crop.y + crop.h - 0.5) * rotatedHeight;
  const radians = (-rotate * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const corners: [number, number][] = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]];
  const mapped = corners.map(([x, y]) => {
    const flippedX = flipX ? -x : x;
    const flippedY = flipY ? -y : y;
    return [flippedX * cos - flippedY * sin, flippedX * sin + flippedY * cos] as [number, number];
  });
  const xs = mapped.map(([x]) => x);
  const ys = mapped.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    x: minX + sourceWidth / 2,
    y: minY + sourceHeight / 2,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

export function renderPhotoToCanvas(
  image: HTMLImageElement,
  settings: PhotoSettings,
  options: PhotoRenderOptions = {},
): HTMLCanvasElement {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const rotate = settings.transform.rotate;
  const { flipX, flipY } = settings.transform;
  const rotated = rotatedDimensions(sourceWidth, sourceHeight, rotate);
  const crop = options.ignoreCrop ? { x: 0, y: 0, w: 1, h: 1 } : settings.crop;

  const naturalOutWidth = Math.max(1, crop.w * rotated.width);
  const naturalOutHeight = Math.max(1, crop.h * rotated.height);
  const maxSize = options.maxSize ?? Math.max(naturalOutWidth, naturalOutHeight);
  const scale = Math.min(1, maxSize / Math.max(naturalOutWidth, naturalOutHeight));

  const output = document.createElement('canvas');
  output.width = Math.max(1, Math.round(naturalOutWidth * scale));
  output.height = Math.max(1, Math.round(naturalOutHeight * scale));
  const ctx = output.getContext('2d', { willReadFrequently: true });
  if (!ctx) return output;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const adjustments = options.original ? DEFAULT_ADJUSTMENTS : settings.adjustments;

  const source = sourceCropRect(crop, rotate, flipX, flipY, sourceWidth, sourceHeight);
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.max(1, Math.round(source.width * scale));
  cropCanvas.height = Math.max(1, Math.round(source.height * scale));
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) return output;
  cropCtx.imageSmoothingEnabled = true;
  cropCtx.imageSmoothingQuality = 'high';
  cropCtx.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height,
  );

  ctx.save();
  ctx.translate(output.width / 2, output.height / 2);
  if (flipX) ctx.scale(-1, 1);
  if (flipY) ctx.scale(1, -1);
  if (rotate) ctx.rotate((rotate * Math.PI) / 180);
  ctx.drawImage(cropCanvas, -cropCanvas.width / 2, -cropCanvas.height / 2);
  ctx.restore();

  if (!options.original) {
    if (adjustments.blur > 0) {
      const blurred = document.createElement('canvas');
      blurred.width = output.width;
      blurred.height = output.height;
      const blurredCtx = blurred.getContext('2d');
      if (blurredCtx) {
        blurredCtx.filter = `blur(${Math.max(0.4, adjustments.blur * scale)}px)`;
        blurredCtx.drawImage(output, 0, 0);
        ctx.clearRect(0, 0, output.width, output.height);
        ctx.drawImage(blurred, 0, 0);
      }
    }
    if (hasPixelWork({ ...adjustments, blur: 0 })) {
      applyPixelAdjustments(ctx, output.width, output.height, { ...adjustments, blur: 0 });
    }
    if (settings.text.length && !options.ignoreText) {
      drawTextLayers(ctx, settings, output.width, output.height, scale);
    }
  }

  return output;
}

export function computeHistogram(canvas: HTMLCanvasElement, bins = 64): HistogramData | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const sample = document.createElement('canvas');
  const maxSample = 220;
  const scale = Math.min(1, maxSample / Math.max(canvas.width, canvas.height));
  sample.width = Math.max(1, Math.round(canvas.width * scale));
  sample.height = Math.max(1, Math.round(canvas.height * scale));
  const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
  if (!sampleCtx) return null;
  sampleCtx.drawImage(canvas, 0, 0, sample.width, sample.height);
  let data: Uint8ClampedArray;
  try {
    data = sampleCtx.getImageData(0, 0, sample.width, sample.height).data;
  } catch {
    return null;
  }
  const red = Array(bins).fill(0);
  const green = Array(bins).fill(0);
  const blue = Array(bins).fill(0);
  const luma = Array(bins).fill(0);
  for (let index = 0; index < data.length; index += 4) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    red[Math.min(bins - 1, Math.floor((r / 256) * bins))] += 1;
    green[Math.min(bins - 1, Math.floor((g / 256) * bins))] += 1;
    blue[Math.min(bins - 1, Math.floor((b / 256) * bins))] += 1;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    luma[Math.min(bins - 1, Math.floor((luminance / 256) * bins))] += 1;
  }
  return { r: red, g: green, b: blue, luma };
}

export type PhotoExportFormat = 'png' | 'jpeg' | 'webp';

export function exportMime(format: PhotoExportFormat) {
  return format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
}

export function outputDimensions(
  image: HTMLImageElement,
  settings: PhotoSettings,
  scale = 1,
) {
  const rotated = rotatedDimensions(image.naturalWidth, image.naturalHeight, settings.transform.rotate);
  return {
    width: Math.max(1, Math.round(settings.crop.w * rotated.width * scale)),
    height: Math.max(1, Math.round(settings.crop.h * rotated.height * scale)),
  };
}

export async function exportPhotoBlob(
  image: HTMLImageElement,
  settings: PhotoSettings,
  format: PhotoExportFormat,
  quality: number,
  scale: number,
): Promise<Blob | null> {
  const canvas = renderPhotoToCanvas(image, settings, {
    maxSize: Math.max(image.naturalWidth, image.naturalHeight),
  });
  let target = canvas;
  if (scale < 1) {
    target = document.createElement('canvas');
    target.width = Math.max(1, Math.round(canvas.width * scale));
    target.height = Math.max(1, Math.round(canvas.height * scale));
    const ctx = target.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, target.width, target.height);
  }
  return new Promise(resolve => {
    target.toBlob(blob => resolve(blob), exportMime(format), quality);
  });
}
