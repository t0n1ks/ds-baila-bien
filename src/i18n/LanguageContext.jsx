import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../config.js';
import content from '../content/content.json';

const LanguageContext = createContext(null);

export const LANGS = ['de', 'en'];
const DEFAULT_LANG = 'de';

function readStored() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.lang);
    return LANGS.includes(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readStored);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    try {
      localStorage.setItem(STORAGE_KEYS.lang, lang);
    } catch {
      /* private mode: the choice simply does not persist */
    }
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((current) => (current === 'de' ? 'en' : 'de'));
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggle,
      /** All copy for the active language. */
      t: content[lang],
      /** Language-independent content: settings + legal texts. */
      settings: content.settings,
      legal: content.legal,
    }),
    [lang, toggle],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
