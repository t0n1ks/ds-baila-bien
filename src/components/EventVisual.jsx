import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion.js';

const Dancer = lazy(() => import('./Dancer.jsx'));

const WIDE = '(min-width: 768px)';

/**
 * Decorative fill beside the event flyer (md+ only): a breathing brand blob,
 * a faint "Baila Bien" projected on the wall behind, and the Lottie dancer
 * on top. The dancer's chunk is fetched only on wide screens and once the
 * section comes near the viewport, so phones never download it.
 */
export default function EventVisual({ wordmark }) {
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
    <div ref={ref} aria-hidden="true" className="relative hidden aspect-square w-full md:block">
      <div className="event-blob absolute inset-[9%] animate-blob" />

      <p className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center font-display text-[clamp(4rem,11vw,9.5rem)] font-extrabold leading-[0.85] tracking-tight text-ink/[0.07]">
        {wordmark.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </p>

      <div className="absolute inset-[14%]">
        {ready && (
          <Suspense fallback={null}>
            <Dancer still={still} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
