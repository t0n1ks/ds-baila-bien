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

  return (
    <div ref={ref} className="hidden md:block">
      <h3 className="font-display text-2xl font-bold text-ink lg:text-3xl">{teaser.title}</h3>
      <p className="mt-2 text-lg font-light leading-relaxed text-muted">{teaser.text}</p>

      {/* Blob and dancer sit low in the square, leaving air under the text.
          The dancer keeps its size (72 % of the box); the blob is a little
          smaller than it used to be, so the dancer reads larger against it. */}
      <div aria-hidden="true" className="relative mt-6 aspect-square w-full">
        <div className="event-blob absolute inset-x-[15%] bottom-[8%] top-[22%] animate-blob" />

        <p className="pointer-events-none absolute inset-x-0 bottom-0 top-[14%] flex select-none flex-col items-center justify-center font-display text-[clamp(4rem,11vw,9.5rem)] font-extrabold leading-[0.85] tracking-tight text-ink/[0.07]">
          {wordmark.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </p>

        <div className="absolute inset-x-[14%] bottom-[4%] top-[24%]">
          {ready && (
            <Suspense fallback={null}>
              <Dancer still={still} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
