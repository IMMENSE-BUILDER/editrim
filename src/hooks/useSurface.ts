import { useEffect } from 'react';

/**
 * Marks the document as showing a neutral-chrome surface.
 *
 * styles/neutral.css keys its token overrides off `[data-surface="neutral"]`,
 * so the editor and dashboard pick up the neutral palette while the marketing
 * pages keep their paper one. Portals (modals, popovers) live under <body>,
 * so the attribute is set on <html> and reaches them too.
 */
export function useSurface(surface: 'neutral' | null) {
  useEffect(() => {
    if (!surface) return;
    const root = document.documentElement;
    const previous = root.dataset.surface;

    root.dataset.surface = surface;

    return () => {
      if (previous) root.dataset.surface = previous;
      else delete root.dataset.surface;
    };
  }, [surface]);
}
