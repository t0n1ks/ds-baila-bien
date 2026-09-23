/**
 * Class nights for the trial form's "preferred date" select. Classes only run
 * on Tuesdays, so the form offers the next few of those instead of a free
 * date picker — computed on every render, never maintained by hand.
 */

const TUESDAY = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Today's calendar date in Mainz, as a UTC-midnight Date (no DST drift). */
function todayInMainz(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
      .formatToParts(now)
      .map((part) => [part.type, Number(part.value)]),
  );
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

/** ISO dates ("2026-10-06") of the next `count` Tuesdays, today included. */
export function upcomingTuesdays(count = 8, now = new Date()) {
  const today = todayInMainz(now);
  const first = today.getTime() + (((TUESDAY - today.getUTCDay() + 7) % 7) * DAY_MS);
  return Array.from({ length: count }, (_, index) =>
    new Date(first + index * 7 * DAY_MS).toISOString().slice(0, 10),
  );
}

const FORMATS = {
  de: { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }, // Di, 06. Okt. 2026
  en: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }, // Tue, Oct 6, 2026
};

/** "2026-10-06" -> "Di, 06. Okt. 2026" / "Tue, Oct 6, 2026". */
export function formatTuesday(iso, lang) {
  const formatter = new Intl.DateTimeFormat(lang, { ...(FORMATS[lang] ?? FORMATS.en), timeZone: 'UTC' });
  return formatter
    .formatToParts(new Date(`${iso}T00:00:00Z`))
    // German abbreviates the weekday as "Di." — drop that dot before the comma.
    .map((part) => (part.type === 'weekday' ? part.value.replace(/\.$/, '') : part.value))
    .join('');
}
