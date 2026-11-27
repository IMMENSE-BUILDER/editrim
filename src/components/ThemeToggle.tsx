import { useEffect, useState } from 'react';
import { Switch } from '@/components/liquid-glass/controls/Switch';
import { EditrimIcon } from './EditrimIcon';
import { THEME_KEY, applyTheme, readTheme, subscribeTheme, toggleTheme, type Theme } from '../lib/theme';

/**
 * Dark-mode switch for the dashboard rail. A labelled refracting glass track,
 * not a mystery icon: the knob position, the label and the sun/moon always say
 * which mode is active.
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

  const handleToggle = () => setTheme(toggleTheme());

  return (
    <div
      className={`rail-theme ${dark ? 'is-dark' : 'is-light'}`}
      title={`Switch to ${next} mode`}
    >
      <Switch
        size="sm"
        checked={dark}
        onChange={handleToggle}
        color="#3b82f6"
        theme={theme}
        label=""
      />
      <button
        type="button"
        className="rail-theme-label"
        onClick={handleToggle}
        aria-pressed={dark}
        aria-label={`Switch to ${next} mode`}
      >
        <EditrimIcon name={dark ? 'moon' : 'sun'} size={11} />
        {dark ? 'Dark' : 'Light'}
      </button>
    </div>
  );
}
