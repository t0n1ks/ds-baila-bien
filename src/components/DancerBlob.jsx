import { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
import { REST_PATH, SHAPE, useJelly } from './jellyBlob.js';
import usePrefersReducedMotion from './usePrefersReducedMotion.js';

const Dancer = lazy(() => import('./Dancer.jsx'));

/**
 * The decorative group shared by Upcoming Events (md+) and the trial form
 * (phones): a springy rounded-square blob whose edge backs away from the
 * pointer, a faint "Baila Bien" projected on the wall behind, and the Lottie
 * dancer on top.
 *
 * The caller sizes and places it through `className`. The box is 11:10, or
 * with `flat` a 2:1 landscape bar whose dancer and wordmark are about half
 * the size (the phone accent above the trial form). `media` is the viewport
 * where it is shown: the dancer's chunk is fetched only there and once the
 * blob comes near the viewport, so the other layout never downloads it. `areaRef` widens where the jelly listens for
 * mouse/touch; by default it is the blob's own box.
 */
export default function DancerBlob({ wordmark, media, areaRef, flat = false, className = '' }) {
  const boxRef = useRef(null);
  const pathRef = useRef(null);
  // useId gives ":r0:"-style ids; colons are not safe inside url(#…).
  const gradientId = `blob-${useId().replace(/:/g, '')}`;
  const still = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  // Off under reduced motion, where the blob simply stays in its rest shape.
  useJelly({ pathRef, boxRef, areaRef: areaRef ?? boxRef, enabled: !still });

  useEffect(() => {
    const node = boxRef.current;
    if (!node || !window.matchMedia) return undefined;
    const shown = window.matchMedia(media);
    let observer;

    const watch = () => {
      if (!shown.matches || observer) return;
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
    shown.addEventListener('change', watch);
    return () => {
      shown.removeEventListener('change', watch);
      observer?.disconnect();
    };
  }, [media]);

  return (
    <div ref={boxRef} aria-hidden="true" className={`dancer-blob ${flat ? 'aspect-[2/1]' : 'aspect-[11/10]'} ${className}`.trim()}>
      <svg
        viewBox={`0 0 ${SHAPE.width} ${SHAPE.height}`}
        preserveAspectRatio="none"
        className="dancer-blob__shape absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <radialGradient id={gradientId} cx="0.3" cy="0.2" r="1.2">
            <stop offset="0" style={{ stopColor: 'rgb(var(--blob-from))' }} />
            <stop offset="1" style={{ stopColor: 'rgb(var(--blob-to))' }} />
          </radialGradient>
        </defs>
        <path ref={pathRef} d={REST_PATH} fill={`url(#${gradientId})`} />
      </svg>

      {/* 0.24 × the blob's height (the box is its own size container): both
          words sit on the solid part. Flat: 0.18 × its (lower) height. */}
      <p className={`pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center font-display ${flat ? 'text-[18cqh]' : 'text-[24cqh]'} font-extrabold leading-[0.85] tracking-tight text-ink/[0.07]`}>
        {wordmark.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </p>

      {/* The Lottie canvas (612 × 736), centred: 79.4 % of the blob's height,
          or 60 % of the flat bar's (≈ half the phone size it replaced). */}
      <div
        className={
          flat
            ? 'absolute left-[37.5%] top-[20%] h-[60%] w-[25%]'
            : 'absolute left-[20%] top-[10.3%] h-[79.4%] w-[60%]'
        }
      >
        {ready && (
          <Suspense fallback={null}>
            <Dancer still={still} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
