import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import PendingNotice from './PendingNotice.jsx';

const SPLIT_RE = /(\[\[[^\]]+\]\])/g;
// Separate, non-global copy: a /g regex keeps lastIndex between .test() calls.
const IS_PLACEHOLDER = /^\[\[[^\]]+\]\]$/;

/** Renders [[PLACEHOLDER]] tokens as visibly unfinished, never as plain text. */
function withPlaceholders(text) {
  return text.split(SPLIT_RE).map((part, i) =>
    IS_PLACEHOLDER.test(part) ? (
      <mark
        key={i}
        className="rounded bg-accent/20 px-1 py-0.5 font-display text-[0.92em] font-semibold text-ink"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** Shared frame for Impressum and Datenschutzerklärung. */
export default function LegalNotice({ doc }) {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [doc.title]);

  return (
    <main id="main" className="shell py-16 sm:py-24">
      <Link
        to="/"
        className="font-display text-sm font-semibold text-accent-text underline decoration-2 underline-offset-4"
      >
        {t.legalUi.back}
      </Link>

      <h1 className="mt-8 font-display text-section font-bold text-ink">{doc.title}</h1>
      <PendingNotice className="mt-8" />
      <p className="mt-4 text-sm text-muted">{t.legalUi.bindingNote}</p>

      <div className="prose-legal mt-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p className="whitespace-pre-line">{withPlaceholders(section.body)}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
