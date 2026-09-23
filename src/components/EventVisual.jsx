import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion.js';

const Dancer = lazy(() => import('./Dancer.jsx'));

const WIDE = '(min-width: 768px)';

/**
 * Right column beside the event flyer (md+ only): a short teaser, then the
 * decorative group — a breathing brand blob, a faint "Baila Bien" projected
 * on the wall behind, and the Lottie dancer on top. The dancer's chunk is
 * fetched only on wide screens and once the section comes near the viewport,
 * so phones never download it.
 */
export default function EventVisual({ wordmark, teaser }) {
  const ref = useRef(null);
  const still = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !window.matchMedia) return undefined;
    const wide = window.matchMedia(WIDE);
    let observer;

    const watch = () => {
      if (!wide.matches || observer) return;
      if (typeof IntersectionObserver === 'undefined') {
        setReady(true);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setReady(true);
          observer.disconnect();
        },
        { rootMargin: '200px 0px' },
      );
      observer.observe(node);
    };

    watch();
    wide.addEventListener('change', watch);
    return () => {
      wide.removeEventListener('change', watch);
      observer?.disconnect();
    };
  }, []);

  // Positioned over the whole grid cell, so the flyer alone sets the row
  // height: text starts at the flyer's top edge, the blob ends at its bottom.
  return (
    <div ref={ref} className="absolute inset-0 flex flex-col">
      <h3 className="font-display text-2xl font-bold leading-tight text-ink lg:text-3xl">{teaser.title}</h3>
      <p className="mt-2 text-lg font-light leading-relaxed text-muted">{teaser.text}</p>

      {/* The stage takes the height left under the text; the blob is the
          largest square that fits, pinned bottom-left so its left edge lines
          up with the text and its bottom with the flyer. */}
      <div aria-hidden="true" className="event-stage relative mt-6 min-h-0 flex-1">
        <div className="absolute bottom-0 left-0 aspect-square w-[min(100cqw,100cqh)]">
          <div className="event-blob absolute inset-0 animate-blob" />

          <p className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center font-display text-[calc(min(100cqw,100cqh)*0.28)] font-extrabold leading-[0.85] tracking-tight text-ink/[0.07]">
            {wordmark.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </p>

          {/* The Lottie canvas (612 × 736) at 66 % of the blob's width: every
              frame of the loop stays inside every blob shape with room to
              spare. */}
          <div className="absolute left-[17%] top-[10.3%] h-[79.4%] w-[66%]">
            {ready && (
              <Suspense fallback={null}>
                <Dancer still={still} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
