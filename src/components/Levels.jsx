import { useLanguage } from '../i18n/LanguageContext.jsx';
import Reveal from './Reveal.jsx';

/** One card per level: name and short name (English in both languages), description. */
export default function Levels() {
  const { t } = useLanguage();

  return (
    <section id="levels" className="shell scroll-mt-24 py-20 sm:py-28">
      <Reveal>
        <h2 className="font-display text-section font-bold text-ink">{t.levels.heading}</h2>
      </Reveal>

      <ol className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-3 md:gap-6">
        {t.levels.items.map((level, index) => (
          <Reveal
            as="li"
            key={level.name}
            delay={90 + index * 50}
            className="flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-7"
          >
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-2xl font-semibold text-ink sm:text-3xl">{level.name}</span>
              <span className="font-display text-sm font-semibold text-accent-text">{level.tag}</span>
            </p>
            <p className="mt-4 leading-relaxed text-muted">{level.text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
