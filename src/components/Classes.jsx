import { useLanguage } from '../i18n/LanguageContext.jsx';
import Reveal from './Reveal.jsx';

export default function Classes() {
  const { t, settings } = useLanguage();

  return (
    <section id="kurse" className="scroll-mt-24 border-y border-line bg-surface-2 py-20 sm:py-28">
      <div className="shell">
        <Reveal className="grid gap-8 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-16">
          <div>
            <h2 className="font-display text-section font-bold text-ink">{t.classes.heading}</h2>
            <p className="mt-4 max-w-measure text-lg leading-relaxed text-ink">{t.classes.intro}</p>
            <p className="mt-3 max-w-measure leading-relaxed text-muted">{t.classes.drinkNote}</p>
          </div>

          <div className="self-start rounded-2xl border border-line bg-bg p-6 sm:p-7">
            <p className="font-display text-xl font-semibold text-ink">{t.classes.day}</p>
            <p className="mt-3 leading-relaxed text-muted">{t.classes.location}</p>
            <p className="mt-1 text-sm text-muted/80">{t.classes.locationNote}</p>
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-display text-sm font-semibold text-accent-text underline decoration-2 underline-offset-4"
            >
              {t.classes.mapsLabel}
            </a>
          </div>
        </Reveal>

        <Reveal delay={90} className="mt-14 sm:mt-16">
          <ol className="border-t border-line">
            {t.classes.rows.map((row) => (
              <li
                key={row.time}
                className="grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-[12rem_1fr] sm:items-baseline sm:gap-8 sm:py-6"
              >
                <span className="font-display text-base font-semibold text-accent-text sm:text-lg">
                  {row.time}
                </span>
                <span className="font-display text-xl font-semibold text-ink sm:text-2xl">{row.label}</span>
              </li>
            ))}
          </ol>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {t.classes.levelLegend.map((entry) => (
              <li key={entry} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {entry}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
