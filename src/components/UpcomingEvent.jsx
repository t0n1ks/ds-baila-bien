import { asset } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import EventVisual from './EventVisual.jsx';
import MediaFrame from './MediaFrame.jsx';
import { cardHref, isVideoSrc } from './media.js';
import Reveal from './Reveal.jsx';

/**
 * The current event flyer: one card, framed like the Instagram cards and
 * linking out the same way. Without a flyer the whole section is hidden.
 */
export default function UpcomingEvent() {
  const { t, settings } = useLanguage();
  const event = settings.upcomingEvent ?? {};
  const src = asset(event.media);

  if (!src) return null;

  const href = cardHref(event.url);
  const linkProps = href
    ? { as: 'a', href, target: '_blank', rel: 'noopener noreferrer', draggable: false }
    : {};

  return (
    <section id="events" className="scroll-mt-24 border-y border-line bg-surface-2 py-20 sm:py-28">
      {/* Capped narrower than the other sections on desktop, so flyer and
          dancer block don't drift apart on very wide screens. */}
      <div className="shell lg:max-w-[76rem]">
        <Reveal>
          <h2 className="font-display text-section font-bold text-ink">{t.events.heading}</h2>
        </Reveal>

        {/* Phones: the card alone, as before. md+: flyer left, decorative
            dancer visual on the right (pushed to the far right on desktop). */}
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-x-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-x-20">
          <Reveal delay={90} className="w-full min-[480px]:w-[72%] sm:w-[60%] md:w-full">
            <MediaFrame
              {...linkProps}
              src={src}
              video={isVideoSrc(src)}
              alt={event.caption || t.events.heading}
            >
              {(event.caption || href) && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12 text-brand-cream">
                  {event.caption && (
                    <span className="font-display text-base font-semibold">{event.caption}</span>
                  )}
                  {href && (
                    <span className="font-display text-sm font-semibold opacity-90">
                      {t.events.linkLabel} ↗
                    </span>
                  )}
                </span>
              )}
            </MediaFrame>
          </Reveal>

          <Reveal delay={140} className="relative hidden md:block">
            <EventVisual wordmark={t.hero.wordmark} teaser={t.events.teaser} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
