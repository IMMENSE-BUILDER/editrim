export type RemoveBgOptions = {
  /** Color similarity tolerance (10–100, default 36). */
  tolerance?: number;
  /** Edge feather radius in pixels (0–4, default 2). */
  feather?: number;
  /** 'auto' uses border-seeded flood fill + near-border color cleaning; 'flood' uses strict border flood fill. */
  mode?: 'auto' | 'flood';
};

function colorDist(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
}

type SampleColor = { r: number; g: number; b: number };

function sampleBorderPalette(data: Uint8ClampedArray, w: number, h: number): SampleColor[] {
  const samples: SampleColor[] = [];
  const stepX = Math.max(1, Math.floor(w / 40));
  const stepY = Math.max(1, Math.floor(h / 40));

  const pushPx = (x: number, y: number) => {
    const idx = (y * w + x) * 4;
    if (data[idx + 3] < 20) return;
    samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
  };

  for (let x = 0; x < w; x += stepX) {
    pushPx(x, 0);
    if (h > 1) pushPx(x, h - 1);
  }
  for (let y = 0; y < h; y += stepY) {
    pushPx(0, y);
    if (w > 1) pushPx(w - 1, y);
  }

  if (!samples.length) return [{ r: 255, g: 255, b: 255 }];

  // Cluster into up to 6 representative border colors so gradient / two-tone backdrops work cleanly
  const clusters: { r: number; g: number; b: number; count: number }[] = [];
  for (const s of samples) {
    let best = -1;
    let bestD = 28;
    for (let i = 0; i < clusters.length; i++) {
      const c = clusters[i];
      const d = colorDist(s.r, s.g, s.b, c.r, c.g, c.b);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best >= 0) {
      const c = clusters[best];
      const n = c.count + 1;
      c.r = (c.r * c.count + s.r) / n;
      c.g = (c.g * c.count + s.g) / n;
      c.b = (c.b * c.count + s.b) / n;
      c.count = n;
    } else if (clusters.length < 6) {
      clusters.push({ ...s, count: 1 });
    }
  }
  clusters.sort((a, b) => b.count - a.count);
  return clusters.map(({ r, g, b }) => ({ r, g, b }));
}

function minPaletteDist(r: number, g: number, b: number, palette: SampleColor[]): number {
  let minD = 999;
  for (let i = 0; i < palette.length; i++) {
    const c = palette[i];
    const d = colorDist(r, g, b, c.r, c.g, c.b);
    if (d < minD) minD = d;
  }
  return minD;
}

/**
 * Local border-sampled flood fill + soft alpha matting & edge feathering.
 * Zero network requests, runs directly on ImageData.
 */
export function removeBackground(imageData: ImageData, opts: RemoveBgOptions = {}): ImageData {
  const w = imageData.width;
  const h = imageData.height;
  const total = w * h;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src);
  if (!total) return new ImageData(out, w, h);

  const tol = Math.max(8, Math.min(110, opts.tolerance ?? 36));
  const feather = Math.max(0, Math.min(4, Math.round(opts.feather ?? 2)));
  const mode = opts.mode ?? 'auto';
  const palette = sampleBorderPalette(src, w, h);

  // 0 = undecided/foreground, 1 = visited background
  const bg = new Uint8Array(total);
  const queued = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const trySeed = (x: number, y: number) => {
    const idx = y * w + x;
    if (queued[idx]) return;
    const p = idx * 4;
    if (src[p + 3] < 20 || minPaletteDist(src[p], src[p + 1], src[p + 2], palette) <= tol * 1.25) {
      queued[idx] = 1;
      bg[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    trySeed(x, 0);
    if (h > 1) trySeed(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    trySeed(0, y);
    if (w > 1) trySeed(w - 1, y);
  }

  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];
  const stepGuard = tol * 0.78;
  const globalLimit = tol * 1.18;

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % w;
    const y = (idx - x) / w;
    const p = idx * 4;
    const pr = src[p];
    const pg = src[p + 1];
    const pb = src[p + 2];

    for (let k = 0; k < 4; k++) {
      const nx = x + dx[k];
      const ny = y + dy[k];
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const nIdx = ny * w + nx;
      if (queued[nIdx]) continue;
      const np = nIdx * 4;
      if (src[np + 3] < 20) {
        queued[nIdx] = 1;
        bg[nIdx] = 1;
        queue[tail++] = nIdx;
        continue;
      }
      const nr = src[np];
      const ng = src[np + 1];
      const nb = src[np + 2];
      const dPal = minPaletteDist(nr, ng, nb, palette);
      const dStep = colorDist(pr, pg, pb, nr, ng, nb);
      if (dPal <= globalLimit && dStep <= stepGuard) {
        queued[nIdx] = 1;
        bg[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    }
  }

  // In auto mode, also clean tiny isolated background islands near backdrop color outside dense interior
  const alpha = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const p = i * 4;
    if (bg[i]) {
      alpha[i] = 0;
    } else if (mode === 'auto') {
      const d = minPaletteDist(src[p], src[p + 1], src[p + 2], palette);
      if (d < tol * 0.55) {
        // Keep if surrounded by foreground; only soften if adjacent to bg
        const x = i % w;
        const y = (i - x) / w;
        const touchesBg =
          (x > 0 && bg[i - 1]) ||
          (x < w - 1 && bg[i + 1]) ||
          (y > 0 && bg[i - w]) ||
          (y < h - 1 && bg[i + w]);
        alpha[i] = touchesBg ? Math.round((d / Math.max(1, tol * 0.8)) * 255) : 255;
      } else {
        alpha[i] = 255;
      }
    } else {
      alpha[i] = 255;
    }
  }

  // Soft feather along alpha transitions
  if (feather > 0) {
    let curr = alpha;
    for (let pass = 0; pass < feather; pass++) {
      const next = new Float32Array(curr);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (bg[i]) continue;
          const touchesBg =
            curr[i - 1] < 200 ||
            curr[i + 1] < 200 ||
            curr[i - w] < 200 ||
            curr[i + w] < 200;
          if (!touchesBg) continue;
          const avg =
            (curr[i] * 2 +
              curr[i - 1] +
              curr[i + 1] +
              curr[i - w] +
              curr[i + w]) /
            6;
          next[i] = Math.min(curr[i], avg);
        }
      }
      curr = next;
    }
    for (let i = 0; i < total; i++) {
      const a = Math.round((src[i * 4 + 3] * curr[i]) / 255);
      out[i * 4 + 3] = Math.max(0, Math.min(255, a));
    }
  } else {
    for (let i = 0; i < total; i++) {
      const a = Math.round((src[i * 4 + 3] * alpha[i]) / 255);
      out[i * 4 + 3] = Math.max(0, Math.min(255, a));
    }
  }

  return new ImageData(out, w, h);
}

/**
 * Extracts a tightly cropped foreground layer where mask[i] > 0.
 */
export function extractForegroundLayer(
  imageData: ImageData,
  mask: Uint8ClampedArray,
): { foreground: ImageData; bbox: { x: number; y: number; w: number; h: number } } {
  const w = imageData.width;
  const h = imageData.height;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x] > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return {
      foreground: new ImageData(new Uint8ClampedArray(imageData.data), w, h),
      bbox: { x: 0, y: 0, w, h },
    };
  }

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const out = new Uint8ClampedArray(bw * bh * 4);
  const src = imageData.data;

  for (let dy = 0; dy < bh; dy++) {
    const sy = minY + dy;
    for (let dx = 0; dx < bw; dx++) {
      const sx = minX + dx;
      const m = mask[sy * w + sx];
      const sp = (sy * w + sx) * 4;
      const dp = (dy * bw + dx) * 4;
      out[dp] = src[sp];
      out[dp + 1] = src[sp + 1];
      out[dp + 2] = src[sp + 2];
      out[dp + 3] = Math.round((src[sp + 3] * m) / 255);
    }
  }

  return {
    foreground: new ImageData(out, bw, bh),
    bbox: { x: minX, y: minY, w: bw, h: bh },
  };
}
