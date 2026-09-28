/**
 * Single place for everything the owner (or a later migration) has to change.
 * Values wrapped in [[...]] are placeholders — they are NOT invented here and
 * are rendered visibly on the site so nothing ships to production half-filled.
 */

/* ------------------------------------------------------------------ *
 * Form delivery
 * ------------------------------------------------------------------ *
 * Now (GitHub Pages): FORM_MODE = 'stub'. The form validates, shows
 * loading/success and logs the payload. Nothing leaves the browser.
 *
 * After the move to Vercel — the only supported route:
 *   browser → POST /api/trial (our own Vercel serverless function)
 *           → Brevo transactional e-mail API → CORPORATE_EMAIL
 *   - The Brevo API key lives ONLY in Vercel → Project → Settings →
 *     Environment Variables and is read server-side (process.env) inside
 *     /api/trial. Never put it in this file, anywhere in src/, or in a
 *     VITE_* variable — all of that ships in the public bundle.
 *   - Then set FORM_MODE = 'endpoint' and FORM_ENDPOINT = '/api/trial'.
 *     The browser only ever sends the form values, no key.
 *   - Before launch: sign Brevo's DPA (Auftragsverarbeitungsvertrag) and
 *     name Brevo in Datenschutz §3 (replaces the [[MAIL-DIENSTLEISTER]]
 *     placeholder, which also clears the ⚠️ notice on the form).
 */
export const FORM_MODE = 'stub'; // 'stub' | 'endpoint'
export const FORM_ENDPOINT = '[[FORM_ENDPOINT]]'; // → '/api/trial' after the Vercel move

/* ------------------------------------------------------------------ *
 * Contact
 * ------------------------------------------------------------------ *
 * The public contact address, and where trial-form submissions go once
 * the form is connected. The footer shows `settings.contactEmail` from
 * src/content/site.json (editable in the CMS) — keep the two in step.
 */
export const CORPORATE_EMAIL = 'bailabien.mz.de@gmail.com';

/** True while any [[PLACEHOLDER]] is still unfilled — drives the ⚠️ notices. */
export const hasPendingDetails = (value) => /\[\[[^\]]+\]\]/.test(String(value ?? ''));

/**
 * Prefix a path from the content files with the Vite base (Pages subpath safe).
 * "/images/uploads/1.jpg" and "images/uploads/1.jpg" both become
 * "/ds-baila-bien/images/uploads/1.jpg"; full URLs pass through untouched.
 */
export const asset = (path) => {
  const value = String(path ?? '').trim();
  if (!value || /^(https?:|data:|blob:)/i.test(value)) return value;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${value.replace(/^\/+/, '')}`;
};

export const STORAGE_KEYS = {
  theme: 'bb-theme',
  lang: 'bb-lang',
};
