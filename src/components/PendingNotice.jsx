import { useLanguage } from '../i18n/LanguageContext.jsx';

/**
 * Visible ⚠️ marker wherever [[PLACEHOLDERS]] are still unfilled, so an
 * incomplete Impressum / contact address can never quietly reach production.
 */
export default function PendingNotice({ className = '' }) {
  const { t } = useLanguage();

  return (
    <div
      role="note"
      className={`rounded-2xl border border-dashed border-accent bg-accent/10 p-5 ${className}`.trim()}
    >
      <p className="font-display text-sm font-semibold text-ink">⚠️ {t.legalUi.pendingTitle}</p>
      <p className="mt-2 max-w-measure text-sm leading-relaxed text-muted">{t.legalUi.pendingText}</p>
    </div>
  );
}
