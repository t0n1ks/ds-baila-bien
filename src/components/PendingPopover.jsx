import { useEffect, useId, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import PendingNotice from './PendingNotice.jsx';

/**
 * TEMPORARY — the phone version of <PendingNotice>: a small ⚠️ button that
 * opens the same notice as a popover. Remove it (and its one use in
 * TrialForm.jsx) once the [[PLACEHOLDERS]] are filled in; nothing else
 * depends on it.
 *
 * Place it inside a `relative` row: the popover spans that row's width,
 * just below it. Closes on a second tap, the ×, Escape or a tap outside.
 */
export default function PendingPopover({ className = '' }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelId = `pending-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={className}>
      <button
        type="button"
        aria-label={t.legalUi.pendingToggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-accent bg-accent/10 text-xl leading-none"
      >
        <span aria-hidden="true">⚠️</span>
      </button>

      {open && (
        <div id={panelId} className="absolute inset-x-0 top-full z-20 mt-3 rounded-2xl bg-bg shadow-xl">
          <PendingNotice className="pr-12" />
          <button
            type="button"
            aria-label={t.legalUi.pendingClose}
            onClick={() => setOpen(false)}
            className="absolute right-1.5 top-1.5 flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none text-muted hover:text-ink"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
    </div>
  );
}
