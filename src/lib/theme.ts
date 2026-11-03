export type Theme = 'light' | 'dark';

export const THEME_KEY = 'vellum_theme_v1';
export const THEME_EVENT = 'vellum:theme';

export function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: Theme, options: { persist?: boolean } = {}) {
  const { persist = true } = options;
  const root = document.documentElement;
  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    root.classList.add('theme-switching');
    window.setTimeout(() => root.classList.remove('theme-switching'), 320);
  }
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#121116' : '#F4F1EA');
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Private browsing can reject storage; the theme still applies for this page.
    }
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
}

export function toggleTheme(): Theme {
  const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

export function subscribeTheme(handler: (theme: Theme) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<Theme>).detail);
  window.addEventListener(THEME_EVENT, listener);
  return () => window.removeEventListener(THEME_EVENT, listener);
}
