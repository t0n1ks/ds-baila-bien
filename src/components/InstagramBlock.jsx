import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Carousel from './Carousel.jsx';
import Reveal from './Reveal.jsx';

const POST_RE = /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)\/?/i;

/** A real permalink, as opposed to the [[EXAMPLE]] stand-ins in content.json. */
function isRealPost(url) {
  const match = POST_RE.exec(String(url ?? '').trim());
  return Boolean(match) && !/^EXAMPLE/i.test(match[1]);
}

/** https://www.instagram.com/p/ABC/ -> https://www.instagram.com/p/ABC/embed */
function toEmbedUrl(url) {
  return `${String(url).replace(/\/+$/, '')}/embed`;
}

const CARD = 'flex h-[34rem] flex-col rounded-2xl border border-line bg-surface p-7 sm:h-[40rem]';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Click-to-load (Zwei-Klick-Lösung): nothing is requested from Meta until
 * the visitor presses the button, so simply opening the page transfers no
 * data to Instagram. See Datenschutz §5.
 */
function Post({ url, labels }) {
  const [loaded, setLoaded] = useState(false);

  // No real permalink yet — show a neutral card rather than a dead embed.
  if (!isRealPost(url)) {
    return (
      <div className={`${CARD} items-start justify-center gap-4`}>
        <InstagramIcon />
        <p className="font-display text-lg font-semibold text-muted">{labels.placeholder}</p>
      </div>
    );
  }

  if (loaded) {
    return (
      <iframe
        src={toEmbedUrl(url)}
        title={labels.embedTitle}
        loading="lazy"
        scrolling="no"
        className="h-[34rem] w-full rounded-2xl border border-line bg-white sm:h-[40rem]"
      />
    );
  }

  return (
    <div className={`${CARD} items-start justify-end gap-4`}>
      <InstagramIcon />
      <p className="mt-auto max-w-[36ch] text-sm leading-relaxed text-muted">{labels.privacyNote}</p>
      <button type="button" className="btn-accent" onClick={() => setLoaded(true)}>
        {labels.loadButton}
      </button>
    </div>
  );
}

export default function InstagramBlock() {
  const { t, settings } = useLanguage();
  const posts = settings.instagramPosts ?? [];

  if (posts.length === 0) return null;

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

        <Reveal delay={90} className="mt-10">
          <Carousel
            labels={t.instagram}
            ariaLabel={t.instagram.heading}
            slideClass="flex-[0_0_100%] sm:flex-[0_0_60%] lg:flex-[0_0_42%]"
          >
            {posts.map((url, index) => (
              <Post key={`${url}-${index}`} url={url} labels={t.instagram} />
            ))}
          </Carousel>
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
