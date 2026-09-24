import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';

// [[PLACEHOLDER]] tokens, web addresses and email addresses, in that order.
// A trailing full stop or comma belongs to the sentence, not the address.
const SPLIT_RE = /(\[\[[^\]]+\]\]|https?:\/\/[^\s]*[^\s.,;:)]|[^\s@(]+@[^\s@]+\.[^\s.,;:)]+)/g;
// Separate, non-global copies: a /g regex keeps lastIndex between .test() calls.
const IS_PLACEHOLDER = /^\[\[[^\]]+\]\]$/;
const IS_URL = /^https?:\/\//;
const IS_EMAIL = /^[^\s@]+@[^\s@]+$/;

const LINK = 'break-words text-accent-text underline decoration-1 underline-offset-2';

/**
 * Renders [[PLACEHOLDER]] tokens as visibly unfinished, never as plain text,
 * and makes web and email addresses clickable.
 */
function renderBody(text) {
  return text.split(SPLIT_RE).map((part, i) => {
    if (IS_PLACEHOLDER.test(part)) {
      return (
        <mark
          key={i}
          className="rounded bg-accent/20 px-1 py-0.5 font-display text-[0.92em] font-semibold text-ink"
        >
          ⚠️ {part}
        </mark>
      );
    }
    if (IS_URL.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={LINK}>
          {part}
        </a>
      );
    }
    if (IS_EMAIL.test(part)) {
      return (
        <a key={i} href={`mailto:${part}`} className={LINK}>
          {part}
        </a>
      );
    }
    return part;
  });
}

/** Shared frame for Impressum and Datenschutzerklärung. */
export default function LegalNotice({ doc }) {
  const { t } = useLanguage();
  const { pathname } = useLocation();

  // Land at the top when the route changes — but not when the visitor merely
  // switches language while reading.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <main id="main" className="shell py-16 sm:py-24">
      <Link
        to="/"
        className="font-display text-sm font-semibold text-accent-text underline decoration-2 underline-offset-4"
      >
        {t.legalUi.back}
      </Link>

      <h1 className="mt-8 font-display text-section font-bold text-ink">{doc.title}</h1>
      <p className="mt-4 text-sm text-muted">{t.legalUi.bindingNote}</p>

      <div className="prose-legal mt-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p className="whitespace-pre-line">{renderBody(section.body)}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
