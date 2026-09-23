# Baila Bien Mainz — website

Business-card site for the dance school. Vite + React 18 + Tailwind, deployed
to GitHub Pages: **https://t0n1ks.github.io/ds-baila-bien/**

## Editing the content (no code)

All text and images live in **`src/content/content.json`**. Nothing is
hardcoded in the components.

**Option A — GitHub web UI (always works).**
Open [`src/content/content.json`](https://github.com/t0n1ks/ds-baila-bien/blob/main/src/content/content.json)
→ pencil icon → edit → *Commit changes*. Photos and videos go into
`public/images/uploads/` (*Add file → Upload files*), then reference them from
the `gallery.items` list as `images/uploads/<filename>`.

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

> If you add a new key to `content.json`, also declare it in
> `public/admin/config.yml` — the CMS strips keys it does not know about.
> `npm run check:content` verifies exactly that, plus DE/EN key parity and
> that the two gallery lists still line up.

The `de` and `en` blocks hold all translated copy, including the Impressum and
the Datenschutzerklärung. **The German version is the legally binding one** —
the English pages are a courtesy translation and say so at the top. Values that
are the same in both languages (brand name, links, Instagram post URLs) live in
`settings`, so they cannot drift apart.

## Still to fill in

Everything written as `[[PLACEHOLDER]]` is deliberately unset and rendered with a
visible ⚠️ marker. Collected in `src/config.js` and in `content.json`:

- `[[CORPORATE_EMAIL]]` — inbox for trial-class requests
- `[[PLZ]]` — postcode of the ROXY venue
- Impressum per §5 DDG: `[[LEGAL_NAME]]`, `[[LEGAL_FORM]]`, `[[STREET]]`,
  `[[ZIP_CITY]]`, `[[PHONE]]`, `[[IMPRESSUM_EMAIL]]`,
  `[[VERTRETUNGSBERECHTIGTE_PERSON]]`, plus `[[VAT_ID]]` / `[[HRB]]` /
  `[[AMTSGERICHT]]` if applicable

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
