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
  // Initialised straight from localStorage, so a reload or a direct hit on
  // /impressum comes up in the language that was chosen last.
  const [lang, setLang] = useState(readStored);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);

    // The <title> and meta description live outside React — keep them in sync
    // so the tab and share previews are not stuck in German.
    const meta = content[lang].meta;
    document.title = meta.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', meta.description);

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
      /** All copy for the active language, legal pages included. */
      t: content[lang],
      /** The German copy, used as the fallback when a translation is missing. */
      fallback: content[DEFAULT_LANG],
      /** Language-independent content: brand, links, Instagram posts. */
      settings: content.settings,
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
