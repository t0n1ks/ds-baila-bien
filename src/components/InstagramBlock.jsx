import { useEffect, useRef, useState } from 'react';
import { asset } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Carousel from './Carousel.jsx';
import Reveal from './Reveal.jsx';
import usePrefersReducedMotion from './usePrefersReducedMotion.js';

const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

/** Drop any ?query / #hash tail from the stored permalink. */
function cleanUrl(url) {
  return String(url ?? '')
    .trim()
    .split(/[?#]/)[0];
}

/** A card is only real once the owner has uploaded media and pasted a link. */
function isReady(post) {
  const url = cleanUrl(post?.url);
  return Boolean(post?.media) && Boolean(url) && !/EXAMPLE/i.test(url);
}

const CARD = 'relative block h-[34rem] overflow-hidden rounded-2xl border border-line bg-surface sm:h-[40rem]';

function InstagramIcon({ className = 'text-muted' }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * A self-hosted preview that links out to the post.
 *
 * No iframe and no Instagram script: the old embed both leaked data to Meta
 * and swallowed touch events, which killed the carousel swipe. The media is
 * served from our own public/images/uploads/.
 */
function Post({ post, isActive, labels }) {
  const videoRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [broken, setBroken] = useState(false);

  const src = post.media ? asset(post.media) : '';
  const isVideo = VIDEO_RE.test(post.media ?? '');
  const href = cleanUrl(post.url);

  // Only the slide in view plays; everything else stays paused so a carousel
  // of clips does not decode five videos at once.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive && !reducedMotion) {
      const attempt = video.play();
      if (attempt?.catch) attempt.catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive, reducedMotion]);

  if (!isReady(post) || broken) {
    return (
      <div className={`${CARD} flex flex-col items-start justify-center gap-4 p-7`}>
        <InstagramIcon />
        <p className="font-display text-lg font-semibold text-muted">{labels.placeholder}</p>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      className={`${CARD} group`}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setBroken(true)}
        />
      ) : (
        <img
          src={src}
          alt={post.caption || labels.heading}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={() => setBroken(true)}
        />
      )}

      <span className="pointer-events-none absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-brand-cream backdrop-blur-sm">
        <InstagramIcon className="" />
      </span>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-brand-cream">
        {post.caption && (
          <span className="font-display text-base font-semibold">{post.caption}</span>
        )}
        <span className="font-display text-sm font-semibold opacity-90">
          {labels.viewOnInstagram} ↗
        </span>
      </span>
    </a>
  );
}

export default function InstagramBlock() {
  const { t, settings } = useLanguage();
  const posts = settings.instagramPosts ?? [];
  const [active, setActive] = useState(0);

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
            onActiveChange={setActive}
            slideClass="flex-[0_0_100%] sm:flex-[0_0_60%] lg:flex-[0_0_42%]"
          >
            {posts.map((post, index) => (
              <Post
                key={`${post.url}-${index}`}
                post={post}
                isActive={index === active}
                labels={t.instagram}
              />
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
