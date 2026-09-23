import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../config.js';
import content from '../content/content.json';

const ThemeContext = createContext(null);

const MODES = ['light', 'dark', 'system'];
const fallbackMode = MODES.includes(content.settings.defaultTheme)
  ? content.settings.defaultTheme
  : 'system';

function readStored() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    return MODES.includes(stored) ? stored : fallbackMode;
  } catch {
    return fallbackMode;
  }
}

/** system -> the OS preference; falls back to dark when unknown. */
function resolve(mode) {
  if (mode !== 'system') return mode;
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readStored);
  const [resolved, setResolved] = useState(() => resolve(readStored()));

  useEffect(() => {
    setResolved(resolve(mode));
    if (mode !== 'system' || !window.matchMedia) return undefined;

    const query = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => setResolved(query.matches ? 'light' : 'dark');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolved === 'light' ? '#efe6d5' : '#241812');
  }, [resolved]);

  useEffect(() => {
    // Functionally necessary storage of a user preference — no consent required.
    try {
      localStorage.setItem(STORAGE_KEYS.theme, mode);
    } catch {
      /* private mode: the choice simply does not persist */
    }
  }, [mode]);

  const toggle = useCallback(() => {
    setMode(resolve(mode) === 'dark' ? 'light' : 'dark');
  }, [mode]);

  const value = useMemo(() => ({ mode, resolved, setMode, toggle }), [mode, resolved, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
