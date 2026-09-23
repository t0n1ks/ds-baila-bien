import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Reveal from './Reveal.jsx';

/** https://www.instagram.com/p/ABC/ -> https://www.instagram.com/p/ABC/embed */
function toEmbedUrl(url) {
  return `${String(url).replace(/\/+$/, '')}/embed`;
}

/**
 * Click-to-load (Zwei-Klick-Lösung): nothing is requested from Meta until
 * the visitor presses the button, so simply opening the page transfers no
 * data to Instagram. See Datenschutz §5.
 */
function Post({ url, labels }) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={toEmbedUrl(url)}
        title={url}
        loading="lazy"
        scrolling="no"
        className="h-[34rem] w-full rounded-2xl border border-line bg-white sm:h-[40rem]"
      />
    );
  }

  return (
    <div className="flex h-[34rem] flex-col items-start justify-end gap-4 rounded-2xl border border-line bg-surface p-7 sm:h-[40rem]">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
      <p className="mt-auto max-w-[36ch] text-sm leading-relaxed text-muted">{labels.privacyNote}</p>
      <button type="button" className="btn-accent" onClick={() => setLoaded(true)}>
        {labels.loadButton}
      </button>
    </div>
  );
}

export default function InstagramBlock() {
  const { t, settings } = useLanguage();

  return (
    <section id="instagram" className="scroll-mt-24 border-y border-line bg-surface-2 py-20 sm:py-28">
      <div className="shell">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-section font-bold text-ink">{t.instagram.heading}</h2>
            <p className="mt-4 max-w-measure leading-relaxed text-muted">{t.instagram.intro}</p>
          </div>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-quiet shrink-0"
          >
            {settings.instagramHandle}
          </a>
        </Reveal>

        <Reveal delay={90} className="mt-10 grid gap-4 sm:grid-cols-2">
          {t.instagram.posts.map((url) => (
            <Post key={url} url={url} labels={t.instagram} />
          ))}
        </Reveal>

        <Reveal delay={140} className="mt-8">
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-sm font-semibold text-accent-text underline decoration-2 underline-offset-4"
          >
            {t.instagram.profileLink}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
