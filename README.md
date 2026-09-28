# Baila Bien Mainz — website

Business-card site for the dance school. Vite + React 18 + Tailwind, deployed
to GitHub Pages: **https://t0n1ks.github.io/ds-baila-bien/**

## Editing the content (no code)

All text and images live in **`src/content/`**, one file per admin section.
Nothing is hardcoded in the components.

| File | Admin section | Holds |
|---|---|---|
| `gallery.json` | Galerie | gallery media (once) + caption `{ de, en }` per item |
| `events.json` | Events | upcoming-event flyer (once) + caption `{ de, en }` |
| `instagram.json` | Instagram | profile link/handle + post cards (once) + caption `{ de, en }` |
| `de.json` | Deutsch | every other German text, legal pages included |
| `en.json` | English | the same structure in English |
| `site.json` | Einstellungen | brand name, logos, contact e-mail, maps link, default theme |

`src/content/assemble.js` combines them into the per-language view the
components read.

**Option A — GitHub web UI (always works).**
Open the file under [`src/content/`](https://github.com/t0n1ks/ds-baila-bien/tree/main/src/content)
→ pencil icon → edit → *Commit changes*. Photos and videos go into
`public/images/uploads/` (*Add file → Upload files*), then reference them from
`gallery.json` as `/images/uploads/<filename>`.

**Option B — the admin UI at `/admin/`.**
Open https://t0n1ks.github.io/ds-baila-bien/admin/ and choose
**Sign In with Token**, pasting a GitHub personal access token
(fine-grained, repository `ds-baila-bien`, permission *Contents: read & write*).
For a proper multi-user login without tokens, deploy
[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) as a Cloudflare
Worker, create a GitHub OAuth App, and add `base_url: <worker url>` under
`backend` in `public/admin/config.yml`.

Either way: saving commits to `main`, GitHub Actions rebuilds, and the change is
live in 1–2 minutes.

> If you add a new key to a content file, also declare it in
> `public/admin/config.yml` — the CMS strips keys it does not know about.
> `npm run check:content` verifies exactly that, plus DE/EN key and list-length
> parity, identical Deutsch/English field lists, and paired media captions.
> `npm run check:media` lists uploads nothing references (read-only).

`de.json` and `en.json` hold all translated copy, including the Impressum and
the Datenschutzerklärung. **The German version is the legally binding one** —
the English pages are a courtesy translation and say so at the top. Media and
values that are the same in both languages are stored once, so they cannot
drift apart.

## Still to fill in

Everything written as `[[PLACEHOLDER]]` is deliberately unset and rendered with a
visible ⚠️ marker. Still open:

- `src/config.js`: `[[FORM_ENDPOINT]]` / `[[FORM_KEY]]` — form delivery (see
  *The trial form* below)
- Datenschutz §3 in `src/content/de.json` / `en.json`: `[[MAIL-DIENSTLEISTER …]]` /
  `[[MAIL PROCESSOR …]]` — the form's mail processor. While it is open, the
  trial form shows the ⚠️ "Angaben ausstehend" notice.

(Contact e-mail, venue address and the Impressum details are filled in.)

The Impressum and Datenschutzerklärung are working templates and must be
reviewed by a lawyer before launch.

## The trial form

`FORM_MODE = 'stub'` in `src/config.js`: the form validates and shows the
success state, but nothing is sent anywhere. To switch on real delivery, change
`FORM_MODE`/`FORM_ENDPOINT` in that one file — see the comments there for the
Web3Forms (test) and Vercel + Brevo (production) variants. Whichever provider
goes live needs a DPA and must be named in Datenschutz §3.

## Privacy decisions baked in

- Fonts are self-hosted from `public/fonts/` — no Google Fonts CDN.
- No analytics, no tracking, no map embed. Only `localStorage` for the theme and
  language choice, which is functionally necessary → **no cookie banner needed**.
- Instagram content is not embedded at all. The cards show an image or short
  video uploaded to `public/images/uploads/` and link out to the post, so the
  page never talks to Meta.
- The gallery and Instagram carousels run on Embla, installed from npm and
  bundled with the site — no carousel script is fetched from a CDN.

## Development

```bash
npm install
npm run dev      # http://localhost:5173/ds-baila-bien/
npm run build
npm run preview
```

## Deployment

Push to `main` → `.github/workflows/deploy.yml` builds and publishes to Pages.
One-time setup: repo → *Settings* → *Pages* → *Source: GitHub Actions*.

The router is `HashRouter` because Pages has no server rewrites, and
`vite.config.js` sets `base: '/ds-baila-bien/'`. On a later move to Vercel:
set `base` to `'/'`, swap `HashRouter` for `BrowserRouter` (`vercel.json` with
the SPA rewrites is already in the repo), and point `FORM_ENDPOINT` at
`/api/trial`.
