import { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
import { REST_PATH, useJelly } from './jellyBlob.js';
import usePrefersReducedMotion from './usePrefersReducedMotion.js';

const Dancer = lazy(() => import('./Dancer.jsx'));

const WIDE = '(min-width: 768px)';

/**
 * Right column beside the event flyer (md+ only): a short teaser, then the
 * decorative group — a springy ink-blot blob that dents away from the
 * pointer, a faint "Baila Bien" projected on the wall behind, and the Lottie
 * dancer on top. The dancer's chunk is fetched only on wide screens and once
 * the section comes near the viewport, so phones never download it.
 */
export default function EventVisual({ wordmark, teaser }) {
  const ref = useRef(null);
  const boxRef = useRef(null);
  const pathRef = useRef(null);
  // useId gives ":r0:"-style ids; colons are not safe inside url(#…).
  const gradientId = `blob-${useId().replace(/:/g, '')}`;
  const still = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  // Jelly reacts to mouse/touch anywhere over this column; off under
  // reduced motion, where the blob simply stays in its rest shape.
  useJelly({ pathRef, boxRef, areaRef: ref, enabled: !still });

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
          largest 13:10 box that fits, pinned bottom-left so its left edge
          lines up with the text and its bottom with the flyer. */}
      <div aria-hidden="true" className="event-stage relative mt-6 min-h-0 flex-1">
        <div ref={boxRef} className="absolute bottom-0 left-0 aspect-[13/10] w-[min(100cqw,130cqh)]">
          <svg
            viewBox="0 0 130 100"
            preserveAspectRatio="none"
            className="event-blob absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <radialGradient id={gradientId} cx="0.3" cy="0.2" r="1.2">
                <stop offset="0" style={{ stopColor: 'rgb(var(--blob-from))' }} />
                <stop offset="1" style={{ stopColor: 'rgb(var(--blob-to))' }} />
              </radialGradient>
            </defs>
            <path ref={pathRef} d={REST_PATH} fill={`url(#${gradientId})`} />
          </svg>

          {/* 0.24 × the blob's height: both words sit on the solid part. */}
          <p className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center font-display text-[calc(min(76.923cqw,100cqh)*0.24)] font-extrabold leading-[0.85] tracking-tight text-ink/[0.07]">
            {wordmark.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </p>

          {/* The Lottie canvas (612 × 736): 79.4 % of the blob's height,
              centred — the same size relative to the blob's height as before. */}
          <div className="absolute left-[24.62%] top-[10.3%] h-[79.4%] w-[50.77%]">
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
