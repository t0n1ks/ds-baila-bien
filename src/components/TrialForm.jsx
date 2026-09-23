import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FORM_ENDPOINT, FORM_MODE, WEB3FORMS_KEY, hasPendingDetails, PLACEHOLDERS } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import PendingNotice from './PendingNotice.jsx';
import Reveal from './Reveal.jsx';
import { formatTuesday, upcomingTuesdays } from './tuesdays.js';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  level: '',
  date: '', // ISO date of a class Tuesday, e.g. "2026-10-06"
  message: '',
  consent: false,
  website: '', // honeypot
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function deliver(values) {
  if (FORM_MODE === 'stub') {
    // MVP: nothing leaves the browser. Swap FORM_MODE/FORM_ENDPOINT in
    // src/config.js to turn on real delivery — this is the only place.
    console.info('[TrialForm] stub submission', values);
    await new Promise((resolve) => setTimeout(resolve, 700));
    return;
  }

  const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      FORM_ENDPOINT.includes('web3forms') ? { access_key: WEB3FORMS_KEY, ...values } : values,
    ),
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
}

/** Drawn rather than native, so the select matches the other controls. */
function SelectChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FieldError({ id, children }) {
  return (
    <p id={id} className="mt-1.5 text-sm text-accent-text">
      {children}
    </p>
  );
}

export default function TrialForm() {
  const { t, lang } = useLanguage();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  // First two Tuesdays of each month, about three months ahead, recomputed each render.
  const tuesdays = upcomingTuesdays(6);

  const set = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = t.form.errors.name;
    if (!EMAIL_RE.test(values.email.trim())) next.email = t.form.errors.email;
    if (!values.consent) next.consent = t.form.errors.consent;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    // Honeypot filled -> a bot. Behave exactly like a success, send nothing.
    if (values.website) {
      setStatus('success');
      return;
    }
    if (!validate()) return;

    setStatus('sending');
    try {
      const { website: _honeypot, ...payload } = values;
      // The ISO date is for machines; the label makes the email unambiguous.
      await deliver({ ...payload, dateLabel: payload.date ? formatTuesday(payload.date, lang) : '' });
      setStatus('success');
    } catch (error) {
      console.error('[TrialForm]', error);
      setStatus('error');
    }
  };

  const invalid = (field) =>
    errors[field] ? { 'aria-invalid': true, 'aria-describedby': `${field}-error` } : {};

  const hint = ` (${t.form.optional})`;

  return (
    <section id="anmelden" className="shell scroll-mt-24 py-20 sm:py-28">
      <Reveal className="grid gap-10 md:grid-cols-[minmax(0,24rem)_1fr] md:gap-16">
        <div>
          <h2 className="font-display text-section font-bold text-ink">{t.form.heading}</h2>
          <p className="mt-4 max-w-measure leading-relaxed text-muted">{t.form.intro}</p>
          {hasPendingDetails(PLACEHOLDERS.CORPORATE_EMAIL) && <PendingNotice className="mt-8" />}
        </div>

        <div className="rounded-3xl border border-line bg-surface-2 p-6 sm:p-9">
          {status === 'success' ? (
            <div role="status" className="flex min-h-[18rem] flex-col items-start justify-center">
              <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                {t.form.success}
              </p>
              <button
                type="button"
                className="btn-quiet mt-8"
                onClick={() => {
                  setValues(EMPTY);
                  setStatus('idle');
                }}
              >
                {t.form.successAgain}
              </button>
            </div>
          ) : (
            // One column on phones, two from md for the short paired fields.
            <form noValidate onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
              {/* Honeypot: hidden from humans, irresistible to bots. */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={set('website')}
                />
              </div>

              <div>
                <label className="label" htmlFor="name">
                  {t.form.fields.name} *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="field"
                  value={values.name}
                  onChange={set('name')}
                  {...invalid('name')}
                />
                {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
              </div>

              <div>
                <label className="label" htmlFor="email">
                  {t.form.fields.email} *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="field"
                  value={values.email}
                  onChange={set('email')}
                  {...invalid('email')}
                />
                {errors.email && <FieldError id="email-error">{errors.email}</FieldError>}
              </div>

              <div>
                <label className="label" htmlFor="phone">
                  {t.form.fields.phone}
                  <span className="label-hint">{hint}</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="field"
                  value={values.phone}
                  onChange={set('phone')}
                />
              </div>

              <div>
                <label className="label" htmlFor="level">
                  {t.form.fields.level}
                  <span className="label-hint">{hint}</span>
                </label>
                <div className="relative">
                  <select
                    id="level"
                    name="level"
                    className="field"
                    value={values.level}
                    onChange={set('level')}
                  >
                    <option value="">{t.form.levelPlaceholder}</option>
                    {t.form.levelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label" htmlFor="date">
                  {t.form.fields.date}
                  <span className="label-hint">{hint}</span>
                </label>
                <div className="relative">
                  <select
                    id="date"
                    name="date"
                    className="field"
                    value={values.date}
                    onChange={set('date')}
                  >
                    <option value="">{t.form.datePlaceholder}</option>
                    {tuesdays.map((iso) => (
                      <option key={iso} value={iso}>
                        {formatTuesday(iso, lang)}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="label" htmlFor="message">
                  {t.form.fields.message}
                  <span className="label-hint">{hint}</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="field resize-y"
                  value={values.message}
                  onChange={set('message')}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="consent" className="flex cursor-pointer items-start gap-3">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={values.consent}
                    onChange={set('consent')}
                    className="mt-1 h-5 w-5 shrink-0 accent-accent"
                    {...invalid('consent')}
                  />
                  {/* Spacing is added here, not carried inside the strings:
                      the CMS trims leading/trailing whitespace on save, which
                      would otherwise glue the sentence to the link. */}
                  <span className="text-sm leading-relaxed text-muted">
                    {t.form.consent.before.trim()}{' '}
                    <Link to="/datenschutz" className="text-accent-text underline underline-offset-2">
                      {t.form.consent.linkText.trim()}
                    </Link>{' '}
                    {t.form.consent.after.trim()} *
                  </span>
                </label>
                {errors.consent && <FieldError id="consent-error">{errors.consent}</FieldError>}
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="btn-accent w-full py-4 text-lg"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? t.form.sending : t.form.submit}
                </button>
                {status === 'error' && (
                  <p role="alert" className="mt-3 text-sm text-accent-text">
                    {t.form.error}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
