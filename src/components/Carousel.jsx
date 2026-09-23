import useEmblaCarousel from 'embla-carousel-react';
import { Children, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion.js';

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

/**
 * Shared Embla carousel for the gallery and the Instagram block.
 *
 * Loops seamlessly in both directions, swipes natively on touch, and exposes
 * the same arrows/dots to pointer and keyboard users. Embla ships in our own
 * bundle (npm), so no third-party request is involved.
 *
 * @param labels  { prev, next, slideLabel } — all bilingual, from content.json
 * @param slideClass  per-section slide widths (Embla drives layout via flex-basis)
 * @param onActiveChange  fired with the selected index, so a section can react
 *   to it — the Instagram cards use it to play only the visible video.
 */
export default function Carousel({ labels, ariaLabel, slideClass, onActiveChange, children }) {
  const reducedMotion = usePrefersReducedMotion();
  const slides = Children.toArray(children);

  const options = useMemo(
    () => ({
      loop: true,
      align: 'center',
      containScroll: false,
      // Embla's duration is unitless; 0 lands instantly for reduced motion.
      duration: reducedMotion ? 0 : 26,
    }),
    [reducedMotion],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [active, setActive] = useState(0);
  const [snaps, setSnaps] = useState([]);

  // Held in a ref so the subscription below does not have to re-run whenever
  // the caller passes a fresh inline callback.
  const notify = useRef(onActiveChange);
  notify.current = onActiveChange;

  useEffect(() => {
    if (!emblaApi) return undefined;
    const sync = () => {
      const index = emblaApi.selectedScrollSnap();
      setActive(index);
      setSnaps(emblaApi.scrollSnapList());
      notify.current?.(index);
    };
    sync();
    emblaApi.on('select', sync).on('reInit', sync);
    return () => {
      emblaApi.off('select', sync).off('reInit', sync);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollNext();
    }
  };

  const many = slides.length > 1;

  return (
    <>
      <div className="relative">
        {many && <Arrow direction="prev" label={labels.prev} onClick={scrollPrev} />}

        <div
          ref={emblaRef}
          role="group"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="overflow-hidden"
        >
          {/* -ml-4 cancels the pl-4 each slide uses to create the gutter */}
          <div className="-ml-4 flex touch-pan-y">
            {slides.map((slide, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className={`min-w-0 pl-4 ${slideClass}`}>
                {slide}
              </div>
            ))}
          </div>
        </div>

        {many && <Arrow direction="next" label={labels.next} onClick={scrollNext} />}
      </div>

      {many && (
        <div className="mt-6 flex items-center justify-center gap-2.5">
          {snaps.map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <button
              key={index}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`${labels.slideLabel} ${index + 1}`}
              aria-current={index === active}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === active ? 'w-7 bg-accent' : 'w-2.5 bg-line hover:bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
