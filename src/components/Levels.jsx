import { useLanguage } from '../i18n/LanguageContext.jsx';
import Reveal from './Reveal.jsx';

/**
 * One card per level: name and short name (English in both languages),
 * description. Continues the Classes band (same tint, no divider, tighter
 * gap) and closes it with the bottom border, so Prices starts a new block.
 */
export default function Levels() {
  const { t } = useLanguage();

  return (
    <section id="levels" className="scroll-mt-24 border-b border-line bg-surface-2 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <div className="shell">
        <Reveal>
          <h2 className="font-display text-section font-bold text-ink">{t.levels.heading}</h2>
        </Reveal>

        <ol className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-3 md:gap-6">
          {t.levels.items.map((level, index) => (
            <Reveal
              as="li"
              key={level.name}
              delay={90 + index * 50}
              className="flex flex-col rounded-2xl border border-line bg-bg p-6 sm:p-7"
            >
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-2xl font-semibold text-ink sm:text-3xl">{level.name}</span>
                <span className="font-display text-sm font-semibold text-accent-text">{level.tag}</span>
              </p>
              <p className="mt-4 leading-relaxed text-muted">{level.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
