import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion.js';

/**
 * Reels usually open on a black frame, so a paused clip (and its blurred
 * fill) shows a frame a moment in instead of the very first one.
 */
const PREVIEW_AT = 1;

/**
 * The preview frame as a tiny JPEG. It only feeds the blurred fill, so a
 * 64 px copy is plenty and costs nothing next to a second <video>.
 */
function grabFrame(video) {
  try {
    if (!video.videoWidth) return '';
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = Math.max(1, Math.round((64 * video.videoHeight) / video.videoWidth));
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch {
    return '';
  }
}

/**
 * One framing for every uploaded image or clip (gallery + Instagram cards).
 *
 * The card has the same aspect ratio on every screen. The media itself is
 * `contain`ed, so nothing is ever cropped — portrait flyers keep their edge
 * text, landscape photos keep their sides. The leftover space is filled by a
 * blurred, darkened copy of the same picture (for clips: their first frame).
 *
 * Without `src` the frame renders just its children — the placeholder.
 * Overlays (captions, icons) are passed as children and sit on top.
 * `fallback` replaces the media when a set file fails to load.
 *
 * @param as      element for the card: 'figure', 'a', 'div', …
 * @param active  clips play only while their slide is the selected one
 */
export default function MediaFrame({
  as: Tag = 'div',
  src = '',
  video = false,
  alt = '',
  active = true,
  fallback = null,
  className = '',
  children,
  ...rest
}) {
  const videoRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [broken, setBroken] = useState(false);
  const [poster, setPoster] = useState('');

  const showMedia = Boolean(src) && !broken;

  // Only the slide in view plays; everything else stays paused so a carousel
  // of clips does not decode several videos at once.
  useEffect(() => {
    const clip = videoRef.current;
    if (!clip) return;
    if (active && !reducedMotion) {
      const attempt = clip.play();
      if (attempt?.catch) attempt.catch(() => {});
    } else {
      clip.pause();
    }
  }, [active, reducedMotion, showMedia]);

  const fill = video ? poster : src;

  return (
    <Tag {...rest} className={`media-frame group ${className}`}>
      {showMedia && fill && (
        <img src={fill} alt="" aria-hidden="true" draggable={false} decoding="async" className="media-frame__fill" />
      )}

      {showMedia &&
        (video ? (
          <video
            ref={videoRef}
            src={src}
            className="media-frame__media"
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedMetadata={(event) => {
              const clip = event.currentTarget;
              if (clip.currentTime === 0 && Number.isFinite(clip.duration)) {
                clip.currentTime = Math.min(PREVIEW_AT, clip.duration / 4);
              }
            }}
            onSeeked={(event) => {
              if (!poster) setPoster(grabFrame(event.currentTarget));
            }}
            onError={() => setBroken(true)}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="media-frame__media"
            onError={() => setBroken(true)}
          />
        ))}

      {broken && fallback}
      {children}
    </Tag>
  );
}
