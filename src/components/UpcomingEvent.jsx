import { asset } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
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
      <div className="shell">
        <Reveal>
          <h2 className="font-display text-section font-bold text-ink">{t.events.heading}</h2>
        </Reveal>

        <Reveal delay={90} className="mt-10 w-full min-[480px]:w-[72%] sm:w-[60%] lg:w-[40%] xl:w-[34%]">
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
      </div>
    </section>
  );
}
