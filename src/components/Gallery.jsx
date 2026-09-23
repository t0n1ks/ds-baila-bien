import { useState } from 'react';
import { asset } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Reveal from './Reveal.jsx';

/**
 * A tile renders the owner's file from public/images/uploads/.
 * Until a real file is uploaded the src 404s — we catch that and fall back
 * to a styled placeholder instead of a broken image.
 */
function Tile({ item, placeholder }) {
  const [broken, setBroken] = useState(false);
  const src = asset(item.src);

  return (
    <figure
      tabIndex={0}
      className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface"
    >
      {broken ? (
        <div className="grid aspect-[4/5] place-items-center bg-[linear-gradient(135deg,rgb(var(--surface))_0%,rgb(var(--surface-2))_100%)]">
          <span className="font-display text-sm font-semibold text-muted">{placeholder}</span>
        </div>
      ) : item.type === 'video' ? (
        <video
          src={src}
          className="block w-full"
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
          className="block w-full transition-transform duration-500 group-hover:scale-[1.03]"
          onError={() => setBroken(true)}
        />
      )}

      <figcaption
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-5 font-display text-base font-semibold text-brand-cream opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
      >
        {item.caption}
      </figcaption>
    </figure>
  );
}

export default function Gallery() {
  const { t } = useLanguage();

  return (
    <section id="galerie" className="shell scroll-mt-24 py-20 sm:py-28">
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-section font-bold text-ink">{t.gallery.heading}</h2>
        <p className="text-muted">{t.gallery.intro}</p>
      </Reveal>

      <Reveal delay={90} className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {t.gallery.items.map((item) => (
          <Tile key={item.src} item={item} placeholder={t.gallery.placeholder} />
        ))}
      </Reveal>
    </section>
  );
}
