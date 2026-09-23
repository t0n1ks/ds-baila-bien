import { useState } from 'react';
import { asset } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import Carousel from './Carousel.jsx';
import MediaFrame from './MediaFrame.jsx';
import { MEDIA_SLIDE, isVideoSrc } from './media.js';
import Reveal from './Reveal.jsx';

/** Drop any ?query / #hash tail from the stored permalink. */
function cleanUrl(url) {
  return String(url ?? '')
    .trim()
    .split(/[?#]/)[0];
}

/** The permalink, unless it is still the example value. */
function postHref(post) {
  const url = cleanUrl(post?.url);
  return url && !/EXAMPLE/i.test(url) ? url : '';
}

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
 * served from our own public/images/uploads/ and framed by MediaFrame.
 */
function Post({ post, isActive, labels }) {
  const src = asset(post.media);
  const href = postHref(post);

  // "Coming soon" only while no media is set. A set-but-unloadable file still
  // renders the card (plain surface + link) so a bad path is visible, not hidden.
  if (!src) {
    return (
      <MediaFrame className="flex flex-col items-start justify-center gap-4 p-7">
        <InstagramIcon />
        <p className="font-display text-lg font-semibold text-muted">{labels.placeholder}</p>
      </MediaFrame>
    );
  }

  const linkProps = href
    ? { as: 'a', href, target: '_blank', rel: 'noopener noreferrer', draggable: false }
    : {};

  return (
    <MediaFrame
      {...linkProps}
      src={src}
      video={isVideoSrc(src)}
      alt={post.caption || labels.heading}
      active={isActive}
    >
      <span className="pointer-events-none absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-brand-cream backdrop-blur-sm">
        <InstagramIcon className="" />
      </span>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12 text-brand-cream">
        {post.caption && (
          <span className="font-display text-base font-semibold">{post.caption}</span>
        )}
        {href && (
          <span className="font-display text-sm font-semibold opacity-90">
            {labels.viewOnInstagram} ↗
          </span>
        )}
      </span>
    </MediaFrame>
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
            slideClass={MEDIA_SLIDE}
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
