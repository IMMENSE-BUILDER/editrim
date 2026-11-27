export type BeatDetectionResult = {
  bpm: number;
  beats: number[];
};

export type SubtitleCue = {
  start: number;
  end: number;
  text: string;
};

/**
 * Pure-JS onset-flux + adaptive threshold beat detector.
 * Zero network calls; works directly on decoded PCM mono samples.
 */
export function detectBeats(samples: Float32Array, sampleRate: number): BeatDetectionResult {
  if (!samples.length || sampleRate <= 0) return { bpm: 120, beats: [] };

  const hop = Math.max(64, Math.round(sampleRate * 0.01));
  const win = Math.max(hop, Math.round(sampleRate * 0.02));
  const frameCount = Math.max(0, Math.floor((samples.length - win) / hop) + 1);
  if (frameCount < 4) return { bpm: 120, beats: [] };

  const energy = new Float32Array(frameCount);
  let maxEnergy = 0;
  for (let f = 0; f < frameCount; f++) {
    const start = f * hop;
    let sumSq = 0;
    for (let j = 0; j < win; j++) {
      const s = samples[start + j];
      sumSq += s * s;
    }
    const rms = Math.sqrt(sumSq / win);
    energy[f] = rms;
    if (rms > maxEnergy) maxEnergy = rms;
  }

  if (maxEnergy < 1e-5) return { bpm: 120, beats: [] };

  const flux = new Float32Array(frameCount);
  let maxFlux = 0;
  for (let f = 1; f < frameCount; f++) {
    const posDiff = Math.max(0, energy[f] - energy[f - 1] * 0.85);
    flux[f] = posDiff;
    if (posDiff > maxFlux) maxFlux = posDiff;
  }

  const radius = 24; // ~240ms each side
  const minGapFrames = Math.max(1, Math.round((0.24 * sampleRate) / hop));
  const beats: number[] = [];
  let lastPeak = -minGapFrames;

  for (let f = 1; f < frameCount - 1; f++) {
    if (flux[f] < maxFlux * 0.14) continue;
    if (flux[f] < flux[f - 1] || flux[f] < flux[f + 1]) continue;

    const a = Math.max(0, f - radius);
    const b = Math.min(frameCount - 1, f + radius);
    let mean = 0;
    for (let k = a; k <= b; k++) mean += flux[k];
    mean /= b - a + 1;

    let varSum = 0;
    for (let k = a; k <= b; k++) {
      const d = flux[k] - mean;
      varSum += d * d;
    }
    const std = Math.sqrt(varSum / (b - a + 1));
    const thresh = mean + 1.25 * std + maxFlux * 0.04;

    if (flux[f] >= thresh && f - lastPeak >= minGapFrames) {
      beats.push(Number(((f * hop) / sampleRate).toFixed(3)));
      lastPeak = f;
    }
  }

  // Estimate BPM from median octave-normalized inter-onset intervals
  const iois: number[] = [];
  for (let i = 1; i < beats.length; i++) {
    let dt = beats[i] - beats[i - 1];
    if (dt <= 0.05 || dt > 2.5) continue;
    while (dt < 0.3) dt *= 2;
    while (dt > 1.0) dt /= 2;
    iois.push(dt);
  }

  let bpm = 120;
  if (iois.length >= 1) {
    iois.sort((a, b) => a - b);
    const med = iois[Math.floor(iois.length / 2)];
    // Refine average around median (±15%) to reject outliers
    const near = iois.filter(v => Math.abs(v - med) <= med * 0.15);
    const avgDt = near.reduce((s, v) => s + v, 0) / near.length;
    bpm = Math.max(60, Math.min(200, Math.round(60 / avgDt)));
  }

  return { bpm, beats };
}

export async function decodeAudioBeats(url: string): Promise<BeatDetectionResult> {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return { bpm: 120, beats: [] };
  const ctx = new Ctx();
  try {
    const resp = await fetch(url);
    const arr = await resp.arrayBuffer();
    const audioBuf = await ctx.decodeAudioData(arr);
    const len = audioBuf.length;
    const mono = new Float32Array(len);
    const channels = audioBuf.numberOfChannels;
    for (let c = 0; c < channels; c++) {
      const data = audioBuf.getChannelData(c);
      for (let i = 0; i < len; i++) mono[i] += data[i] / channels;
    }
    return detectBeats(mono, audioBuf.sampleRate);
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

function parseTimestamp(raw: string): number {
  const clean = raw.trim().replace(',', '.').split(/\s+/)[0];
  const parts = clean.split(':').map(Number);
  if (parts.some(n => !Number.isFinite(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

export function parseSrtOrVtt(raw: string): SubtitleCue[] {
  const normalized = raw.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '');
  const blocks = normalized.split(/\n{2,}/);
  const cues: SubtitleCue[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trimEnd()).filter(Boolean);
    if (!lines.length) continue;
    if (/^(WEBVTT|NOTE|STYLE)/i.test(lines[0])) continue;
    const arrowIdx = lines.findIndex(l => l.includes('-->'));
    if (arrowIdx < 0) continue;
    const [a, b] = lines[arrowIdx].split('-->');
    const start = parseTimestamp(a);
    const end = Math.max(start + 0.25, parseTimestamp(b));
    const text = lines.slice(arrowIdx + 1).join('\n').trim();
    if (text) cues.push({ start, end, text });
  }
  return cues;
}

function fmtSrtTime(sec: number, sep: ',' | '.'): string {
  const s = Math.max(0, sec);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const ms = Math.round((s - Math.floor(s)) * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}${sep}${pad(ms, 3)}`;
}

export function formatSrt(cues: SubtitleCue[]): string {
  return cues
    .map((c, i) => `${i + 1}\n${fmtSrtTime(c.start, ',')} --> ${fmtSrtTime(c.end, ',')}\n${c.text}`)
    .join('\n\n') + (cues.length ? '\n' : '');
}

export function formatVtt(cues: SubtitleCue[]): string {
  const body = cues
    .map(c => `${fmtSrtTime(c.start, '.')} --> ${fmtSrtTime(c.end, '.')}\n${c.text}`)
    .join('\n\n');
  return `WEBVTT\n\n${body}${cues.length ? '\n' : ''}`;
}
