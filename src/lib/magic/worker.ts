import { removeBackground, extractForegroundLayer, type RemoveBgOptions } from './segmentation';
import { inpaintImage, type InpaintOptions } from './inpaint';

export type MagicWorkerRequest =
  | {
      id: number;
      op: 'removeBg';
      width: number;
      height: number;
      pixels: ArrayBuffer;
      opts?: RemoveBgOptions;
    }
  | {
      id: number;
      op: 'inpaint';
      width: number;
      height: number;
      pixels: ArrayBuffer;
      mask: ArrayBuffer;
      opts?: InpaintOptions;
    }
  | {
      id: number;
      op: 'magicGrab';
      width: number;
      height: number;
      pixels: ArrayBuffer;
      mask: ArrayBuffer;
      opts?: InpaintOptions;
    };

export type MagicWorkerResponse =
  | {
      id: number;
      ok: true;
      op: 'removeBg' | 'inpaint';
      width: number;
      height: number;
      pixels: ArrayBuffer;
    }
  | {
      id: number;
      ok: true;
      op: 'magicGrab';
      fgWidth: number;
      fgHeight: number;
      fgPixels: ArrayBuffer;
      bgWidth: number;
      bgHeight: number;
      bgPixels: ArrayBuffer;
      bbox: { x: number; y: number; w: number; h: number };
    }
  | {
      id: number;
      ok: false;
      error: string;
    };

self.onmessage = (event: MessageEvent<MagicWorkerRequest>) => {
  const req = event.data;
  try {
    const img = new ImageData(new Uint8ClampedArray(req.pixels), req.width, req.height);
    if (req.op === 'removeBg') {
      const res = removeBackground(img, req.opts);
      const buf = res.data.buffer;
      (self as unknown as Worker).postMessage(
        { id: req.id, ok: true, op: 'removeBg', width: res.width, height: res.height, pixels: buf } satisfies MagicWorkerResponse,
        [buf],
      );
      return;
    }

    const mask = new Uint8ClampedArray(req.mask);
    if (req.op === 'inpaint') {
      const res = inpaintImage(img, mask, req.opts);
      const buf = res.data.buffer;
      (self as unknown as Worker).postMessage(
        { id: req.id, ok: true, op: 'inpaint', width: res.width, height: res.height, pixels: buf } satisfies MagicWorkerResponse,
        [buf],
      );
      return;
    }

    if (req.op === 'magicGrab') {
      const { foreground, bbox } = extractForegroundLayer(img, mask);
      const bg = inpaintImage(img, mask, req.opts);
      const fgBuf = foreground.data.buffer;
      const bgBuf = bg.data.buffer;
      (self as unknown as Worker).postMessage(
        {
          id: req.id,
          ok: true,
          op: 'magicGrab',
          fgWidth: foreground.width,
          fgHeight: foreground.height,
          fgPixels: fgBuf,
          bgWidth: bg.width,
          bgHeight: bg.height,
          bgPixels: bgBuf,
          bbox,
        } satisfies MagicWorkerResponse,
        [fgBuf, bgBuf],
      );
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({
      id: req.id,
      ok: false,
      error: err instanceof Error ? err.message : 'Magic worker error',
    } satisfies MagicWorkerResponse);
  }
};
