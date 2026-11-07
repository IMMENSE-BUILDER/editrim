import { AI_LANGUAGES, AiRequestError, callAi } from './ai';

/** The write modes exposed by the inline text bar. */
export type InlineWriteMode = 'rewrite' | 'shorten' | 'expand';

export const INLINE_TONES = ['Formal', 'Casual', 'Confident', 'Friendly', 'Bold'] as const;
export type InlineTone = (typeof INLINE_TONES)[number];

/** Keep the selection bar in sync with the full AI Studio language list. */
export const INLINE_LANGUAGES = AI_LANGUAGES;
export type InlineLanguage = (typeof AI_LANGUAGES)[number];

export const INLINE_WRITE_LABELS: Record<InlineWriteMode, string> = {
  rewrite: 'Rewrite',
  shorten: 'Shorten',
  expand: 'Expand',
};

type CopyResponse = {
  ok: true;
  text: string;
  requestId?: string;
  elapsedMs?: number;
};

export type InlineRunRequest =
  | { kind: 'write'; mode: InlineWriteMode; tone: string }
  | { kind: 'translate'; language: InlineLanguage };

/** Build the exact /api/ai write payload — copy and brand voice only, never design data. */
export function inlineWritePayload(
  mode: InlineWriteMode,
  text: string,
  tone: string,
  brandVoice: string,
): Record<string, unknown> {
  return { mode, text, tone, brandVoice };
}

/** Build the exact /api/ai translate payload. */
export function inlineTranslatePayload(text: string, language: InlineLanguage): Record<string, unknown> {
  return { text, language };
}

function readCopy(res: CopyResponse, action: 'write' | 'translate'): string {
  const text = typeof res?.text === 'string' ? res.text.trim() : '';
  if (!text) {
    throw new AiRequestError({
      message: 'The AI returned no text. Try again.',
      stage: 'parse',
      code: action === 'translate' ? 'EMPTY_TRANSLATION' : 'EMPTY_COPY',
      action,
    });
  }
  return text;
}

/** Rewrite, shorten or expand the selected copy with the chosen tone and brand voice. */
export async function requestInlineWrite(
  mode: InlineWriteMode,
  text: string,
  tone: string,
  brandVoice: string,
): Promise<string> {
  const res = await callAi<CopyResponse>('write', inlineWritePayload(mode, text, tone, brandVoice));
  return readCopy(res, 'write');
}

/** Translate the selected copy into one of the inline languages. */
export async function requestInlineTranslate(text: string, language: InlineLanguage): Promise<string> {
  const res = await callAi<CopyResponse>('translate', inlineTranslatePayload(text, language));
  return readCopy(res, 'translate');
}

/** Single-line, length-capped server message for the inline error state. */
export function truncateMessage(message: string, max = 140): string {
  const clean = message.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** `42 → 58` character-count delta. */
export function formatCharDelta(before: string, after: string): string {
  return `${before.length} → ${after.length}`;
}
