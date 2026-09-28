/**
 * Builds the per-language view the components read from the CMS files:
 *
 *   site.json       settings shared by both languages (brand, logos, e-mail…)
 *   gallery.json    media items, stored once; caption as { de, en }
 *   events.json     the upcoming-event flyer, stored once; caption as { de, en }
 *   instagram.json  profile link + post cards, stored once; caption as { de, en }
 *   de.json/en.json every other text on the site, same structure in both
 *
 * Result: { de: t, en: t, settings: { de, en } } — `t` is the same shape the
 * site always used (t.gallery.items included), settings[lang] likewise.
 * Pure function, so scripts/ can run it in Node without Vite.
 */

/** { de, en } → the text for `lang`, falling back to German when empty. */
export const pick = (value, lang) =>
  value && typeof value === 'object' ? value[lang] || value.de || '' : (value ?? '');

export function assemble({ site, gallery, events, instagram, de, en }) {
  const locales = { de, en };
  const out = { settings: {} };

  for (const lang of Object.keys(locales)) {
    const t = locales[lang];
    out[lang] = {
      ...t,
      gallery: {
        ...t.gallery,
        items: (gallery.items ?? []).map((item) => ({ ...item, caption: pick(item.caption, lang) })),
      },
    };
    out.settings[lang] = {
      ...site,
      instagramUrl: instagram.profileUrl,
      instagramHandle: instagram.handle,
      instagramPosts: (instagram.posts ?? []).map((post) => ({ ...post, caption: pick(post.caption, lang) })),
      upcomingEvent: { ...events, caption: pick(events.caption, lang) },
    };
  }
  return out;
}
