import { createWorker, type Worker as TesseractWorker } from 'tesseract.js';
import { resolveSrc } from '../storage';

export type OcrLine = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence: number;
};

export type OcrResult = {
  text: string;
  width: number;
  height: number;
  lines: OcrLine[];
};

let workerPromise: Promise<TesseractWorker> | null = null;
let activeProgressCb: ((p: number) => void) | undefined;

async function getOcrWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    workerPromise = createWorker('eng', 1, {
      workerPath: `${origin}/tesseract/worker.min.js`,
      corePath: `${origin}/tesseract/core/tesseract-core-simd-lstm.wasm.js`,
      langPath: `${origin}/tesseract/lang`,
      gzip: true,
      workerBlobURL: false,
      logger: m => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          activeProgressCb?.(m.progress);
        }
      },
    }).catch(err => {
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

async function prepareSourceCanvas(
  source: string | HTMLCanvasElement | Blob,
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  if (source instanceof HTMLCanvasElement) {
    return { canvas: source, width: source.width, height: source.height };
  }
  const url = typeof source === 'string' ? await resolveSrc(source) : URL.createObjectURL(source);
  try {
    const img = new Image();
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = url;
    await img.decode();
    const w = Math.max(1, img.naturalWidth);
    const h = Math.max(1, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    return { canvas, width: w, height: h };
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(url);
  }
}

/**
 * Fully offline/local OCR using static assets under /tesseract/.
 * Zero remote CDN requests.
 */
export async function recognizeImageText(
  source: string | HTMLCanvasElement | Blob,
  onProgress?: (progress: number) => void,
): Promise<OcrResult> {
  const { canvas, width, height } = await prepareSourceCanvas(source);
  const worker = await getOcrWorker();
  activeProgressCb = onProgress;
  try {
    const res = await worker.recognize(canvas, undefined, { blocks: true, text: true });
    const lines: OcrLine[] = [];
    for (const block of res.data.blocks ?? []) {
      for (const para of block.paragraphs ?? []) {
        for (const line of para.lines ?? []) {
          const clean = line.text.trim();
          if (!clean) continue;
          lines.push({
            text: clean,
            bbox: { ...line.bbox },
            confidence: line.confidence,
          });
        }
      }
    }
    onProgress?.(1);
    return {
      text: res.data.text.trim(),
      width,
      height,
      lines,
    };
  } finally {
    activeProgressCb = undefined;
  }
}
