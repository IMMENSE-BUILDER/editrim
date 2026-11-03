import { useEffect, useState } from 'react';
import { VellumIcon } from './VellumIcon';
import { THEME_KEY, applyTheme, readTheme, subscribeTheme, toggleTheme, type Theme } from '../lib/theme';

/**
 * Dark-mode switch for the dashboard rail. A labelled track, not a mystery icon:
 * the knob position, the label and the sun/moon always say which mode is active.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  useEffect(() => subscribeTheme(setTheme), []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      if (event.newValue === 'light' || event.newValue === 'dark') {
        applyTheme(event.newValue, { persist: false });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const dark = theme === 'dark';
  const next = dark ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={`rail-theme ${dark ? 'is-dark' : 'is-light'}`}
      onClick={() => setTheme(toggleTheme())}
      aria-pressed={dark}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span className="rail-theme-track" aria-hidden="true">
        <i />
      </span>
      <span className="rail-theme-label">
        <VellumIcon name={dark ? 'moon' : 'sun'} size={11} />
        {dark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
