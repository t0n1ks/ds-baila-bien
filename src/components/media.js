const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

/** True for a clip, judged by the file extension of the stored path. */
export const isVideoSrc = (src) => VIDEO_RE.test(String(src ?? ''));

/**
 * Slide widths for carousels of media frames. The frame is portrait (see
 * --media-aspect in index.css), so slides stay narrow enough that a card
 * never grows taller than the screen. Shared so both carousels match.
 */
export const MEDIA_SLIDE =
  'flex-[0_0_100%] min-[480px]:flex-[0_0_72%] sm:flex-[0_0_60%] lg:flex-[0_0_40%] xl:flex-[0_0_34%]';
