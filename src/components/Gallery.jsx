import { useState } from 'react';
import { asset } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Carousel from './Carousel.jsx';
import Reveal from './Reveal.jsx';

const FRAME = 'aspect-[4/5] w-full object-cover sm:aspect-[16/10]';
const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

/**
 * A slide renders the owner's file from public/images/uploads/.
 * Until a real file is uploaded the src 404s — we catch that and fall back
 * to a styled placeholder instead of a broken image.
 */
function Slide({ item, placeholder }) {
  const [broken, setBroken] = useState(false);
  const src = asset(item.src);
  const isVideo = item.type === 'video' || VIDEO_RE.test(src);

  return (
    <figure className="group relative overflow-hidden rounded-2xl border border-line bg-surface">
      {!src || broken ? (
        <div
          className={`${FRAME} grid place-items-center bg-[linear-gradient(135deg,rgb(var(--surface))_0%,rgb(var(--surface-2))_100%)]`}
        >
          <span className="font-display text-sm font-semibold text-muted">{placeholder}</span>
        </div>
      ) : isVideo ? (
        <video
          src={src}
          className={FRAME}
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
          className={`${FRAME} block transition-transform duration-500 group-hover:scale-[1.03]`}
          onError={() => setBroken(true)}
        />
      )}

      {item.caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-5 font-display text-base font-semibold text-brand-cream opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * The German list is the source of truth for which media exist; the active
 * locale only supplies the caption. That keeps DE/EN in sync by construction
 * and degrades to the German caption instead of an empty one.
 */
function mergeItems(active = [], fallback = []) {
  const base = fallback.length >= active.length ? fallback : active;

  return base.map((item, index) => {
    const translated = active[index];
    const source = translated?.src ? translated : item;
    return {
      type: source.type ?? 'image',
      src: source.src,
      caption: translated?.caption || item.caption || '',
    };
  });
}

export default function Gallery() {
  const { t, fallback } = useLanguage();
  const items = mergeItems(t.gallery.items, fallback.gallery.items);

  // Nothing to show -> no section at all.
  if (items.length === 0) return null;

  return (
    <section id="galerie" className="shell scroll-mt-24 py-20 sm:py-28">
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-section font-bold text-ink">{t.gallery.heading}</h2>
        <p className="text-muted">{t.gallery.intro}</p>
      </Reveal>

      <Reveal delay={90} className="mt-10">
        <Carousel
          labels={t.gallery}
          ariaLabel={t.gallery.heading}
          slideClass="flex-[0_0_100%] sm:flex-[0_0_85%] lg:flex-[0_0_70%]"
        >
          {items.map((item, index) => (
            <Slide key={`${item.src}-${index}`} item={item} placeholder={t.gallery.placeholder} />
          ))}
        </Carousel>
      </Reveal>
    </section>
  );
}
