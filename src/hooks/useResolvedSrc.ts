import { useEffect, useState } from 'react';
import { isAssetSrc, resolveSrc } from '../lib/storage';

const cache = new Map<string, string>();

export function useResolvedSrc(src: string | undefined): string | null {
  const [resolved, setResolved] = useState<string | null>(() => {
    if (!src) return null;
    if (!isAssetSrc(src)) return src;
    return cache.get(src) ?? null;
  });

  useEffect(() => {
    let alive = true;
    if (!src) {
      setResolved(null);
      return;
    }
    if (!isAssetSrc(src)) {
      setResolved(src);
      return;
    }
    const cached = cache.get(src);
    if (cached) {
      setResolved(cached);
      return;
    }
    resolveSrc(src).then(url => {
      if (!alive) return;
      if (url) cache.set(src, url);
      setResolved(url || null);
    });
    return () => {
      alive = false;
    };
  }, [src]);

  return resolved;
}
