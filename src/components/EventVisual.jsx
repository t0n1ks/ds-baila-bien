import { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion.js';

const Dancer = lazy(() => import('./Dancer.jsx'));

const WIDE = '(min-width: 768px)';

/**
 * Ink-blot outlines in a 130 × 100 box (landscape). Same commands in each,
 * so the blob can morph between them. Every outline spans the full box, so
 * the blob keeps touching the left edge (teaser text) and the bottom edge
 * (flyer). Checked by rasterising all 38 dancer frames on each outline: her
 * whole figure and the wordmark stay on the solid part, clear of the rim.
 */
const BLOB_PATHS = [
  'M129.9 51.6C130.5 59.3 128.0 68.0 124.1 75.3C120.1 82.6 114.1 91.3 106.1 95.3C98.2 99.4 85.8 99.1 76.3 99.7C66.8 100.4 58.7 99.8 49.1 99.2C39.5 98.5 26.2 100.0 18.6 95.9C10.9 91.8 5.7 81.9 3.2 74.6C0.7 67.2 4.0 59.4 3.6 51.6C3.2 43.8 -1.8 35.2 0.7 27.7C3.1 20.3 10.4 11.7 18.3 7.2C26.2 2.6 38.3 1.1 48.0 0.3C57.7 -0.5 67.8 0.4 76.6 2.5C85.5 4.6 93.7 8.6 101.0 13.1C108.4 17.5 115.7 22.9 120.5 29.3C125.3 35.7 129.3 44.0 129.9 51.6Z',
  'M130.0 47.5C129.6 55.2 125.0 63.3 120.6 70.2C116.3 77.2 110.9 84.4 103.7 89.1C96.6 93.9 86.7 96.9 77.6 98.5C68.6 100.1 58.3 100.6 49.3 99.0C40.3 97.4 31.5 93.3 23.7 88.8C16.0 84.2 6.1 78.6 2.8 71.7C-0.6 64.8 3.7 55.7 3.4 47.5C3.1 39.3 -2.0 30.1 0.8 22.6C3.6 15.1 11.9 6.3 20.2 2.6C28.5 -1.1 41.1 0.6 50.5 0.3C59.9 -0.0 67.0 0.4 76.5 0.7C86.0 1.0 99.7 -1.8 107.4 2.1C115.1 5.9 119.0 16.4 122.7 24.0C126.5 31.6 130.3 39.8 130.0 47.5Z',
  'M128.7 51.4C128.5 59.1 130.4 67.3 127.1 74.4C123.8 81.4 117.0 89.9 109.0 93.5C101.0 97.2 88.5 95.0 78.9 96.1C69.4 97.1 61.5 99.9 51.6 99.9C41.7 100.0 27.8 100.6 19.7 96.4C11.5 92.3 5.9 82.5 2.7 75.0C-0.4 67.5 -0.4 58.9 0.6 51.4C1.6 43.9 4.4 36.4 8.6 29.9C12.8 23.4 18.8 17.2 25.8 12.3C32.9 7.5 41.9 2.7 51.0 0.9C60.1 -0.9 70.7 0.3 80.4 1.6C90.1 2.9 101.2 4.6 109.2 9.0C117.2 13.4 125.2 20.9 128.4 27.9C131.7 35.0 129.0 43.6 128.7 51.4Z',
];

/**
 * Right column beside the event flyer (md+ only): a short teaser, then the
 * decorative group — a slowly morphing ink-blot blob, a faint "Baila Bien" projected
 * on the wall behind, and the Lottie dancer on top. The dancer's chunk is
 * fetched only on wide screens and once the section comes near the viewport,
 * so phones never download it.
 */
export default function EventVisual({ wordmark, teaser }) {
  const ref = useRef(null);
  // useId gives ":r0:"-style ids; colons are not safe inside url(#…).
  const gradientId = `blob-${useId().replace(/:/g, '')}`;
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
          largest 13:10 box that fits, pinned bottom-left so its left edge
          lines up with the text and its bottom with the flyer. */}
      <div aria-hidden="true" className="event-stage relative mt-6 min-h-0 flex-1">
        <div className="absolute bottom-0 left-0 aspect-[13/10] w-[min(100cqw,130cqh)]">
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
            <path d={BLOB_PATHS[0]} fill={`url(#${gradientId})`}>
              {/* SMIL, not CSS: path morphing works in Safari this way. It is
                  left out entirely under reduced motion. */}
              {!still && (
                <animate
                  attributeName="d"
                  dur="18s"
                  repeatCount="indefinite"
                  values={[...BLOB_PATHS, BLOB_PATHS[0]].join(';')}
                  keyTimes="0;0.33;0.66;1"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
                />
              )}
            </path>
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
