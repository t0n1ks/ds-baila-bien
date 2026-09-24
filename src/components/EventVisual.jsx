import { useRef } from 'react';
import DancerBlob from './DancerBlob.jsx';

/**
 * Right column beside the event flyer (md+ only): a short teaser, then the
 * blob + dancer group. The jelly reacts to mouse/touch anywhere over this
 * column.
 */
export default function EventVisual({ wordmark, teaser }) {
  const ref = useRef(null);

  // Positioned over the whole grid cell, so the flyer alone sets the row
  // height: text starts at the flyer's top edge, the blob ends at its bottom.
  // On desktop the block (text + blob) is only as wide as the blob and sits
  // at the right edge of the cell — the page's right content edge — so the
  // spare room ends up between the columns.
  return (
    <div ref={ref} className="event-column absolute inset-0">
      <div className="event-block flex h-full flex-col">
        {/* Tablet: left-aligned with the blob. Desktop: centred over it. */}
        <h3 className="font-display text-2xl font-bold leading-tight text-ink lg:text-center lg:text-3xl">
          {teaser.title}
        </h3>
        <p className="mt-2 text-lg font-light leading-relaxed text-muted lg:text-center">{teaser.text}</p>

        {/* The stage takes the height left under the text; the blob is the
            largest 11:10 box that fits, at the bottom so it ends level with
            the flyer. Tablet: pinned left, under the left-aligned text.
            Desktop: centred, so it stays under the centred text even if a
            longer teaser leaves it narrower than the block. */}
        <div className="event-stage relative mt-6 min-h-0 flex-1">
          <DancerBlob
            wordmark={wordmark}
            media="(min-width: 768px)"
            areaRef={ref}
            className="absolute bottom-0 left-0 w-[min(100cqw,110cqh)] lg:left-1/2 lg:-translate-x-1/2"
          />
        </div>
      </div>
    </div>
  );
}
