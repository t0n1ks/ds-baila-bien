import { useCallback, useEffect, useRef, useState } from 'react';
import { asset } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Reveal from './Reveal.jsx';
import { useScrollBehavior } from './usePrefersReducedMotion.js';

/**
 * A slide renders the owner's file from public/images/uploads/.
 * Until a real file is uploaded the src 404s — we catch that and fall back
 * to a styled placeholder instead of a broken image.
 */
function Slide({ item, placeholder }) {
  const [broken, setBroken] = useState(false);
  const src = asset(item.src);
  const frame = 'aspect-[4/5] w-full object-cover sm:aspect-[16/10]';

  return (
    <figure
      tabIndex={0}
      className="group relative w-full shrink-0 grow-0 basis-full snap-center overflow-hidden rounded-2xl border border-line bg-surface sm:basis-[85%] lg:basis-[70%]"
    >
      {broken ? (
        <div
          className={`${frame} grid place-items-center bg-[linear-gradient(135deg,rgb(var(--surface))_0%,rgb(var(--surface-2))_100%)]`}
        >
          <span className="font-display text-sm font-semibold text-muted">{placeholder}</span>
        </div>
      ) : item.type === 'video' ? (
        <video
          src={src}
          className={frame}
          muted
          loop
          playsInline
          autoPlay
          onError={() => setBroken(true)}
        />
      ) : (
        <img
          src={src}
          alt={item.caption}
          loading="lazy"
          decoding="async"
          className={`${frame} block transition-transform duration-500 group-hover:scale-[1.03]`}
          onError={() => setBroken(true)}
        />
      )}

      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-5 font-display text-base font-semibold text-brand-cream opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        {item.caption}
      </figcaption>
    </figure>
  );
}

function Arrow({ direction, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg/90 text-ink shadow-lg shadow-black/15 backdrop-blur-sm transition-colors hover:bg-surface md:grid ${
        direction === 'prev' ? 'left-3 lg:left-6' : 'right-3 lg:right-6'
      }`}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === 'prev' ? <path d="m14 5-7 7 7 7" /> : <path d="m10 5 7 7-7 7" />}
      </svg>
    </button>
  );
}

export default function Gallery() {
  const { t } = useLanguage();
  const behavior = useScrollBehavior();
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const items = t.gallery.items ?? [];
  const count = items.length;

  /** Scroll so that slide `index` sits where scroll-snap would centre it. */
  const goTo = useCallback(
    (index) => {
      const track = trackRef.current;
      if (!track) return;
      const slide = track.children[Math.max(0, Math.min(index, track.children.length - 1))];
      if (!slide) return;
      track.scrollTo({
        left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
        behavior,
      });
    },
    [behavior],
  );

  // Keep the dots in sync with wherever a swipe left off.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const centre = track.scrollLeft + track.clientWidth / 2;
        let nearest = 0;
        let distance = Infinity;
        Array.from(track.children).forEach((slide, index) => {
          const gap = Math.abs(slide.offsetLeft + slide.clientWidth / 2 - centre);
          if (gap < distance) {
            distance = gap;
            nearest = index;
          }
        });
        setActive(nearest);
      });
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, [count]);

  // Nothing to show -> no section at all.
  if (count === 0) return null;

  return (
    <section id="galerie" className="shell scroll-mt-24 py-20 sm:py-28">
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-section font-bold text-ink">{t.gallery.heading}</h2>
        <p className="text-muted">{t.gallery.intro}</p>
      </Reveal>

      <Reveal delay={90} className="relative mt-10">
        {count > 1 && (
          <Arrow direction="prev" label={t.gallery.prev} onClick={() => goTo(active - 1)} />
        )}

        <div
          ref={trackRef}
          role="group"
          aria-roledescription="carousel"
          aria-label={t.gallery.heading}
          tabIndex={0}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
        >
          {items.map((item, index) => (
            <Slide key={`${item.src}-${index}`} item={item} placeholder={t.gallery.placeholder} />
          ))}
        </div>

        {count > 1 && (
          <Arrow direction="next" label={t.gallery.next} onClick={() => goTo(active + 1)} />
        )}
      </Reveal>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2.5">
          {items.map((item, index) => (
            <button
              key={`dot-${item.src}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`${t.gallery.slideLabel} ${index + 1}`}
              aria-current={index === active}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === active ? 'w-7 bg-accent' : 'w-2.5 bg-line hover:bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
