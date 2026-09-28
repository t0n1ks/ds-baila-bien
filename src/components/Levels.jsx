import { useLanguage } from '../i18n/LanguageContext.jsx';
import Reveal from './Reveal.jsx';

/**
 * "Level 1 — Beginner" → ["Level 1", "Beginner"], so the short name can take
 * the accent colour. A title without the dash renders whole.
 */
function splitTitle(title) {
  const [name, ...rest] = title.split(/\s+[—–-]\s+/);
  return [name, rest.join(' — ')];
}

/**
 * One card per level: title (English in both languages), intro, optional
 * focus paragraph, bullet list, optional closing note. Continues the Classes
 * band (same tint, no divider, tighter gap) and closes it with the bottom
 * border, so Prices starts a new block.
 */
export default function Levels() {
  const { t } = useLanguage();

  return (
    <section id="levels" className="scroll-mt-24 border-b border-line bg-surface-2 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <div className="shell">
        <Reveal>
          <h2 className="font-display text-section font-bold text-ink">{t.levels.heading}</h2>
        </Reveal>

        {/* Three columns only from lg: at tablet width six bullets per card get too narrow. */}
        <ol className="mt-10 grid gap-5 sm:mt-14 md:gap-6 lg:grid-cols-3">
          {t.levels.items.map((level, index) => {
            const [name, tag] = splitTitle(level.title);
            return (
              <Reveal
                as="li"
                key={level.title}
                delay={90 + index * 50}
                className="flex flex-col rounded-2xl border border-line bg-bg p-6 sm:p-7"
              >
                <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-2xl font-semibold text-ink sm:text-3xl">{name}</span>
                  {tag && <span className="font-display text-sm font-semibold text-accent-text">{tag}</span>}
                </h3>

                <p className="mt-4 leading-relaxed text-ink">{level.intro}</p>
                {level.focus && <p className="mt-3 leading-relaxed text-muted">{level.focus}</p>}

                {level.items?.length > 0 && (
                  <>
                    <p className="mt-5 font-display text-sm font-semibold text-ink">{level.listHeading}</p>
                    <ul className="mt-3 space-y-2">
                      {level.items.map((item) => (
                        <li key={item} className="flex gap-3 leading-relaxed text-muted">
                          <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {level.note && (
                  <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-muted">
                    {level.note}
                  </p>
                )}
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
