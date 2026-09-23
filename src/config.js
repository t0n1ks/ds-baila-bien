/**
 * Single place for everything the owner (or a later migration) has to change.
 * Values wrapped in [[...]] are placeholders — they are NOT invented here and
 * are rendered visibly on the site so nothing ships to production half-filled.
 */

/* ------------------------------------------------------------------ *
 * Form delivery
 * ------------------------------------------------------------------ *
 * MVP: no real delivery. The form validates, shows loading/success and
 * logs the payload. Nothing leaves the browser.
 *
 * Phase 1 (test): set FORM_MODE = 'endpoint' and FORM_ENDPOINT to a
 *   form-to-email service, e.g. Web3Forms:
 *     FORM_ENDPOINT = 'https://api.web3forms.com/submit'
 *     WEB3FORMS_KEY = '<real key>'
 *   TODO prod: sign a DPA (Auftragsverarbeitungsvertrag) with that
 *   provider and name it in the Datenschutz "Kontaktformular" section.
 *
 * Phase 2 (production, after the move to Vercel): FORM_MODE = 'endpoint'
 *   and FORM_ENDPOINT = '/api/trial' (serverless -> Brevo). The access
 *   key is dropped; secrets live in Vercel env vars only.
 */
export const FORM_MODE = 'stub'; // 'stub' | 'endpoint'
export const FORM_ENDPOINT = '[[FORM_ENDPOINT]]';
export const WEB3FORMS_KEY = '[[FORM_KEY]]';

/* ------------------------------------------------------------------ *
 * Legal / contact placeholders (§ 5 DDG, DSGVO)
 * ------------------------------------------------------------------ */
export const PLACEHOLDERS = {
  CORPORATE_EMAIL: '[[CORPORATE_EMAIL]]',
  LEGAL_NAME: '[[LEGAL_NAME]]',
  LEGAL_FORM: '[[LEGAL_FORM]]',
  VERTRETUNGSBERECHTIGTE_PERSON: '[[VERTRETUNGSBERECHTIGTE_PERSON]]',
  STREET: '[[STREET]]',
  ZIP_CITY: '[[ZIP_CITY]]',
  PLZ: '[[PLZ]]',
  PHONE: '[[PHONE]]',
  IMPRESSUM_EMAIL: '[[IMPRESSUM_EMAIL]]',
  VAT_ID: '[[VAT_ID]]',
  HRB: '[[HRB]]',
  AMTSGERICHT: '[[AMTSGERICHT]]',
};

/** True while any [[PLACEHOLDER]] is still unfilled — drives the ⚠️ notices. */
export const hasPendingDetails = (value) => /\[\[[^\]]+\]\]/.test(String(value ?? ''));

/**
 * Prefix a path from content.json with the Vite base (Pages subpath safe).
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
