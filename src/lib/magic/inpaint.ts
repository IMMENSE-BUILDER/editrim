export type InpaintOptions = {
  /** Number of harmonic relaxation sweeps inside the mask bounding box. */
  iterations?: number;
};

/**
 * Local Telea-inspired onion-peel + SOR Laplace harmonic inpainting.
 * Fills every pixel with `mask[i] > 0` strictly from surrounding known pixels.
 * Leaves `mask[i] === 0` untouched.
 */
export function inpaintImage(
  imageData: ImageData,
  mask: Uint8ClampedArray,
  opts: InpaintOptions = {},
): ImageData {
  const w = imageData.width;
  const h = imageData.height;
  const total = w * h;
  const out = new Uint8ClampedArray(imageData.data);
  if (!total) return new ImageData(out, w, h);

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  let maskCount = 0;

  const isMasked = new Uint8Array(total);
  const known = new Uint8Array(total);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (mask[idx] > 0) {
        isMasked[idx] = 1;
        maskCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else {
        known[idx] = 1;
      }
    }
  }

  if (maskCount === 0) return new ImageData(out, w, h);

  // Float buffers for sub-LSB smooth gradients inside bounding box
  const bufR = new Float32Array(total);
  const bufG = new Float32Array(total);
  const bufB = new Float32Array(total);
  const bufA = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const p = i * 4;
    bufR[i] = out[p];
    bufG[i] = out[p + 1];
    bufB[i] = out[p + 2];
    bufA[i] = out[p + 3];
  }

  const dx8 = [-1, 0, 1, -1, 1, -1, 0, 1];
  const dy8 = [-1, -1, -1, 0, 0, 1, 1, 1];
  const w8 = [0.7, 1, 0.7, 1, 1, 0.7, 1, 0.7];

  // Step 1: Onion-peel inward initialization from known perimeter
  const bx0 = Math.max(0, minX - 1);
  const bx1 = Math.min(w - 1, maxX + 1);
  const by0 = Math.max(0, minY - 1);
  const by1 = Math.min(h - 1, maxY + 1);

  let frontier: number[] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * w + x;
      if (!isMasked[idx]) continue;
      let touchesKnown = false;
      for (let k = 0; k < 8; k++) {
        const nx = x + dx8[k];
        const ny = y + dy8[k];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && known[ny * w + nx]) {
          touchesKnown = true;
          break;
        }
      }
      if (touchesKnown) frontier.push(idx);
    }
  }

  const inQueue = new Uint8Array(total);
  for (const idx of frontier) inQueue[idx] = 1;

  while (frontier.length > 0) {
    const nextFrontier: number[] = [];
    // Compute layer from currently known neighbors before marking this ring known
    const layerValues: { idx: number; r: number; g: number; b: number; a: number }[] = [];
    for (const idx of frontier) {
      const x = idx % w;
      const y = (idx - x) / w;
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let sa = 0;
      let sw = 0;
      for (let k = 0; k < 8; k++) {
        const nx = x + dx8[k];
        const ny = y + dy8[k];
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const nIdx = ny * w + nx;
        if (known[nIdx]) {
          const wt = w8[k];
          sr += bufR[nIdx] * wt;
          sg += bufG[nIdx] * wt;
          sb += bufB[nIdx] * wt;
          sa += bufA[nIdx] * wt;
          sw += wt;
        } else if (isMasked[nIdx] && !inQueue[nIdx]) {
          inQueue[nIdx] = 1;
          nextFrontier.push(nIdx);
        }
      }
      if (sw > 0) {
        layerValues.push({ idx, r: sr / sw, g: sg / sw, b: sb / sw, a: sa / sw });
      }
    }
    for (const v of layerValues) {
      bufR[v.idx] = v.r;
      bufG[v.idx] = v.g;
      bufB[v.idx] = v.b;
      bufA[v.idx] = v.a;
      known[v.idx] = 1;
    }
    frontier = nextFrontier;
  }

  // Step 2: Gauss-Seidel SOR Laplace harmonic smoothing inside mask bounding box
  const autoIter = Math.min(64, Math.max(24, Math.round(Math.sqrt(maskCount) * 1.15)));
  const iterations = Math.max(4, Math.min(120, opts.iterations ?? autoIter));
  const omega = 1.45;

  for (let it = 0; it < iterations; it++) {
    for (let y = Math.max(1, by0); y <= Math.min(h - 2, by1); y++) {
      for (let x = Math.max(1, bx0); x <= Math.min(w - 2, bx1); x++) {
        const idx = y * w + x;
        if (!isMasked[idx]) continue;

        const targetR =
          0.2 * (bufR[idx - 1] + bufR[idx + 1] + bufR[idx - w] + bufR[idx + w]) +
          0.05 * (bufR[idx - w - 1] + bufR[idx - w + 1] + bufR[idx + w - 1] + bufR[idx + w + 1]);
        const targetG =
          0.2 * (bufG[idx - 1] + bufG[idx + 1] + bufG[idx - w] + bufG[idx + w]) +
          0.05 * (bufG[idx - w - 1] + bufG[idx - w + 1] + bufG[idx + w - 1] + bufG[idx + w + 1]);
        const targetB =
          0.2 * (bufB[idx - 1] + bufB[idx + 1] + bufB[idx - w] + bufB[idx + w]) +
          0.05 * (bufB[idx - w - 1] + bufB[idx - w + 1] + bufB[idx + w - 1] + bufB[idx + w + 1]);
        const targetA =
          0.2 * (bufA[idx - 1] + bufA[idx + 1] + bufA[idx - w] + bufA[idx + w]) +
          0.05 * (bufA[idx - w - 1] + bufA[idx - w + 1] + bufA[idx + w - 1] + bufA[idx + w + 1]);

        bufR[idx] += omega * (targetR - bufR[idx]);
        bufG[idx] += omega * (targetG - bufG[idx]);
        bufB[idx] += omega * (targetB - bufB[idx]);
        bufA[idx] += omega * (targetA - bufA[idx]);
      }
    }
  }

  for (let i = 0; i < total; i++) {
    if (!isMasked[i]) continue;
    const p = i * 4;
    out[p] = Math.max(0, Math.min(255, Math.round(bufR[i])));
    out[p + 1] = Math.max(0, Math.min(255, Math.round(bufG[i])));
    out[p + 2] = Math.max(0, Math.min(255, Math.round(bufB[i])));
    out[p + 3] = Math.max(0, Math.min(255, Math.round(bufA[i])));
  }

  return new ImageData(out, w, h);
}
