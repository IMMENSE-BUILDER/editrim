import LZString from 'lz-string';
import type { Design } from './types';
import { hydrateAssets } from './storage';

export type ShareResult = { url: string; ok: boolean; reason?: string };

export async function buildShareLink(design: Design): Promise<ShareResult> {
  const hydrated = await hydrateAssets(design);
  const json = JSON.stringify(hydrated);
  const payload = LZString.compressToEncodedURIComponent(json);
  const url = `${window.location.origin}/view#d=${payload}`;
  if (url.length > 100_000) {
    return {
      url,
      ok: false,
      reason: 'This design contains large images. Export a PDF or remove uploads to share it as a link.',
    };
  }
  return { url, ok: true };
}

export function decodeShare(hash: string): Design | null {
  try {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(raw);
    const data = params.get('d');
    if (!data) return null;
    const json = LZString.decompressFromEncodedURIComponent(data);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.pages)) return null;
    return parsed as Design;
  } catch {
    return null;
  }
}
