import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useScrollBehavior } from './usePrefersReducedMotion.js';

const SHOW_AFTER = 400;

/**
 * Floating "back to top" button. Rendered once for the whole app; it only
 * scrolls the current page, so it works on the legal routes too.
 */
export default function ScrollToTop() {
  const { t } = useLanguage();
  const behavior = useScrollBehavior();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={t.nav.backToTop}
      // Hidden from the tab order and from pointers while it is faded out.
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior })}
      style={{
        right: 'calc(1.25rem + env(safe-area-inset-right, 0px))',
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
      }}
      className={`fixed z-[60] grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-ink shadow-lg shadow-black/25 transition-[opacity,transform] duration-300 hover:scale-105 sm:h-14 sm:w-14 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
