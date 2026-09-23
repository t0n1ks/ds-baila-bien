import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import useAnchorNav, { useGoToTop } from './useAnchorNav.js';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path strokeLinecap="round" d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M17.7 6.3l1.5-1.5M4.8 19.2l1.5-1.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8Z" />
    </svg>
  );
}

export default function Navbar() {
  const { t, lang, settings, toggle: toggleLang } = useLanguage();
  const { resolved, toggle: toggleTheme } = useTheme();
  const goTo = useAnchorNav();
  const goToTop = useGoToTop();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const jump = (id) => {
    setOpen(false);
    goTo(id);
  };

  const home = () => {
    setOpen(false);
    goToTop();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'border-b border-line bg-bg/90 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          jump('main');
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        {t.nav.skipToContent}
      </a>

      {/* left = logo · centre = section anchors · right = language + theme */}
      {/* Mobile: logo hard left, controls hard right (space-between).
          Desktop: 1fr/auto/1fr so the anchor row stays optically centred on
          the page, whatever the logo and the toggles measure. */}
      <div className="shell flex h-[4.5rem] items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <button
          type="button"
          onClick={home}
          aria-label={t.nav.logoLabel}
          className="mr-auto cursor-pointer whitespace-nowrap font-display text-lg font-extrabold leading-none tracking-tight text-ink md:mr-0 md:justify-self-start"
        >
          {settings.logoText}
          <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
        </button>

        <nav aria-label={settings.brandName} className="hidden items-center justify-center gap-1 md:flex">
          {t.nav.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => jump(item.id)}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0 md:justify-self-end">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t.nav.langLabel}
            className="rounded-full border border-line px-3 py-1.5 font-display text-xs font-semibold text-ink transition-colors hover:bg-surface"
          >
            <span className={lang === 'de' ? '' : 'text-muted'}>DE</span>
            <span className="mx-1 text-muted">/</span>
            <span className={lang === 'en' ? '' : 'text-muted'}>EN</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t.nav.themeLabel}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-surface"
          >
            {resolved === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink md:hidden"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="shell border-t border-line pb-5 pt-3 md:hidden">
          <ul className="flex flex-col">
            {t.nav.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => jump(item.id)}
                  className="w-full border-b border-line/60 py-3.5 text-left font-display text-2xl font-semibold text-ink"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
