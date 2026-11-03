import type { Design, Page } from './types';

export const AI_MODEL_LABEL = 'MiMo V2.6 Flash';
export const AI_GATEWAY_LABEL = 'Vercel AI Gateway';

export type AiStage =
  | 'request'
  | 'config'
  | 'validation'
  | 'rate_limit'
  | 'gateway'
  | 'model'
  | 'parse'
  | 'timeout'
  | 'network'
  | 'internal'
  | 'unknown';

export type AiErrorData = {
  message: string;
  stage: AiStage;
  code: string;
  status?: number;
  requestId?: string;
  model?: string;
  details?: Record<string, unknown>;
  action?: string;
};

export class AiRequestError extends Error {
  stage: AiStage;
  code: string;
  status?: number;
  requestId?: string;
  model?: string;
  details?: Record<string, unknown>;
  action?: string;

  constructor(data: AiErrorData) {
    super(data.message);
    this.name = 'AiRequestError';
    this.stage = data.stage;
    this.code = data.code;
    this.status = data.status;
    this.requestId = data.requestId;
    this.model = data.model;
    this.details = data.details;
    this.action = data.action;
  }
}

export type AiHealth = {
  ok: boolean;
  configured: boolean;
  model: string;
  gateway: string;
  message: string;
};

export async function checkAiHealth(): Promise<AiHealth | null> {
  try {
    const res = await fetch('/api/ai', { method: 'GET', headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data as AiHealth;
  } catch {
    return null;
  }
}

export async function callAi<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 75_000);
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...payload, action }),
      signal: controller.signal,
    });
    const raw = await res.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      const err = new AiRequestError({
        message: `The AI endpoint returned ${res.status} but not JSON. This usually means the serverless function is missing or the SPA fallback answered instead.`,
        stage: 'gateway',
        code: 'NON_JSON_RESPONSE',
        status: res.status,
        action,
      });
      logAiFailure(err);
      throw err;
    }
    if (!res.ok || data?.ok === false) {
      const err = new AiRequestError({
        message: data?.error || `The AI request failed with HTTP ${res.status}.`,
        stage: (data?.stage as AiStage) || (res.status === 503 ? 'config' : 'gateway'),
        code: data?.code || `HTTP_${res.status}`,
        status: res.status,
        requestId: data?.requestId,
        model: data?.model,
        details: data?.details,
        action,
      });
      logAiFailure(err);
      throw err;
    }
    return data as T;
  } catch (err) {
    if (err instanceof AiRequestError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      const timeoutErr = new AiRequestError({
        message: 'The AI request timed out after 75 seconds.',
        stage: 'timeout',
        code: 'CLIENT_TIMEOUT',
        action,
      });
      logAiFailure(timeoutErr);
      throw timeoutErr;
    }
    const netErr = new AiRequestError({
      message:
        "Couldn't reach the AI endpoint. Check your connection — and if you're running locally, make sure the dev server has AI_GATEWAY_API_KEY in .env.local.",
      stage: 'network',
      code: 'ENDPOINT_UNREACHABLE',
      action,
    });
    logAiFailure(netErr);
    throw netErr;
  } finally {
    window.clearTimeout(timer);
  }
}

function logAiFailure(err: AiRequestError) {
  // Deliberate console diagnostics: no prompts or API keys, but enough to trace.
  console.error('[Editrim AI] request failed', {
    action: err.action,
    stage: err.stage,
    code: err.code,
    status: err.status,
    requestId: err.requestId,
    model: err.model,
    message: err.message,
    details: err.details,
  });
}

/** A compact, token-friendly description of the active page for AI review. */
export function summarizePage(design: Design, page: Page): string {
  const bg = page.background.kind === 'solid'
    ? `solid ${page.background.color}`
    : page.background.kind === 'linear'
      ? `gradient ${page.background.from} → ${page.background.to} at ${page.background.angle}°`
      : `photo background`;

  const rows = page.elements.slice(0, 40).map((el, i) => {
    const base = `#${i + 1} ${el.type} at (${Math.round(el.x)},${Math.round(el.y)}) ${Math.round(el.w)}×${Math.round(el.h)}${el.rotation ? ` rotated ${el.rotation}°` : ''}`;
    if (el.type === 'text') {
      return `${base}; "${el.text.replace(/\n/g, ' / ').slice(0, 180)}"; ${el.fontFamily} ${el.fontWeight} ${Math.round(el.fontSize)}px, ${el.color}, align ${el.align}${el.uppercase ? ', uppercase' : ''}${el.italic ? ', italic' : ''}`;
    }
    if (el.type === 'shape') {
      return `${base}; shape ${el.shape}, fill ${el.fill.kind === 'solid' ? el.fill.color : el.fill.kind === 'linear' ? `gradient ${el.fill.from}→${el.fill.to}` : 'none'}, stroke ${el.stroke} ${el.strokeWidth}px`;
    }
    if (el.type === 'image') return `${base}; image`;
    return `${base}; icon`;
  });

  return [
    `Design: ${design.title} — ${design.size.width}×${design.size.height}, page ${page.name}.`,
    `Background: ${bg}. Elements: ${page.elements.length}.`,
    ...rows,
  ].join('\n');
}

/** Scene outline with exact IDs, for the AI edit-command agent. */
export function summarizePageForEdit(design: Design, page: Page): string {
  const bg = page.background.kind === 'solid'
    ? page.background.color
    : page.background.kind === 'linear'
      ? `gradient ${page.background.from} → ${page.background.to} at ${page.background.angle}°`
      : 'photo background';

  const rows = page.elements
    .filter(el => !el.hidden)
    .slice(0, 36)
    .map(el => {
      const flags = `${el.locked ? ' LOCKED' : ''}${el.type === 'text' && el.uppercase ? ' UPPERCASE' : ''}`;
      if (el.type === 'text') {
        return `id="${el.id}" type="text" role="${el.name}" x=${Math.round(el.x)} y=${Math.round(el.y)} w=${Math.round(el.w)} h=${Math.round(el.h)} rotation=${el.rotation} text=${JSON.stringify(el.text.slice(0, 220))} font="${el.fontFamily}" weight=${el.fontWeight} size=${Math.round(el.fontSize)} color="${el.color}" align=${el.align}${flags}`;
      }
      if (el.type === 'shape') {
        const fill = el.fill.kind === 'solid' ? el.fill.color : el.fill.kind === 'linear' ? `linear(${el.fill.from},${el.fill.to})` : 'none';
        return `id="${el.id}" type="shape" role="${el.name}" shape=${el.shape} x=${Math.round(el.x)} y=${Math.round(el.y)} w=${Math.round(el.w)} h=${Math.round(el.h)} rotation=${el.rotation} fill="${fill}" stroke="${el.stroke}" strokeWidth=${el.strokeWidth} radius=${el.radius}${flags}`;
      }
      if (el.type === 'image') {
        return `id="${el.id}" type="image" role="${el.name}" x=${Math.round(el.x)} y=${Math.round(el.y)} w=${Math.round(el.w)} h=${Math.round(el.h)} rotation=${el.rotation} radius=${el.radius}${flags}`;
      }
      return `id="${el.id}" type="icon" role="${el.name}" x=${Math.round(el.x)} y=${Math.round(el.y)} w=${Math.round(el.w)} h=${Math.round(el.h)} color="${el.color}"${flags}`;
    });

  return [
    `Design: ${design.title} — ${design.size.width}×${design.size.height}, page "${page.name}".`,
    `Background: ${bg}. Elements: ${page.elements.length}.`,
    ...rows,
  ].join('\n').slice(0, 9000);
}

export const AI_TONES = [
  'Warm and confident',
  'Bold and direct',
  'Quiet and editorial',
  'Playful and human',
  'Luxury and understated',
  'Technical and precise',
];

export const AI_STYLES = [
  'Editorial',
  'Bold type',
  'Quiet minimal',
  'Playful',
  'Luxury',
  'Retro modern',
];

export const AI_LANGUAGES = [
  'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Japanese',
  'Korean', 'Mandarin Chinese', 'Arabic', 'Hindi', 'Dutch', 'Turkish',
  'Polish', 'Swedish', 'Indonesian', 'Vietnamese',
];
