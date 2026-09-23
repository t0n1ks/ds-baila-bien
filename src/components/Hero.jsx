import { useLanguage } from '../i18n/LanguageContext.jsx';
import useAnchorNav from './useAnchorNav.js';

/**
 * Background layer. Today a brand-colour gradient wash; the markup is kept
 * as its own layer so a <video> can be dropped in later without touching
 * the hero composition.
 */
function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -right-[18%] -top-[30%] h-[85vh] w-[85vh] rounded-full opacity-[0.22] blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 68%)' }}
      />
      <div
        className="absolute -bottom-[35%] -left-[12%] h-[70vh] w-[70vh] rounded-full opacity-[0.18] blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--cool)) 0%, transparent 70%)' }}
      />
    </div>
  );
}

export default function Hero() {
  const { t } = useLanguage();
  const goTo = useAnchorNav();
  const [first, second] = t.hero.wordmark;

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-16">
      <HeroBackdrop />

      <div className="shell relative">
        <p className="mb-8 font-display text-sm font-semibold text-muted sm:mb-12">{t.hero.eyebrow}</p>

        {/* The wordmark is the hero: type used as the image, not as a label. */}
        <h1 className="font-display font-extrabold text-mega text-ink">
          <span className="block">{first}</span>
          <span className="block pl-[8vw] text-accent-text sm:pl-[14vw]">
            {second}
          </span>
          <span className="sr-only">— {t.hero.title}</span>
        </h1>

        <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:mt-14 md:grid-cols-[1fr_auto] md:items-end md:gap-12">
          <div>
            <p className="font-display text-display font-semibold text-ink">{t.hero.title}</p>
            <p className="mt-4 max-w-measure text-lg leading-relaxed text-muted">{t.hero.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-accent" onClick={() => goTo('anmelden')}>
              {t.hero.cta}
            </button>
            <button type="button" className="btn-quiet" onClick={() => goTo('kurse')}>
              {t.hero.secondaryCta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
