import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FORM_ENDPOINT, FORM_MODE, WEB3FORMS_KEY, hasPendingDetails, PLACEHOLDERS } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import PendingNotice from './PendingNotice.jsx';
import Reveal from './Reveal.jsx';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  level: '',
  date: '',
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

export default function TrialForm() {
  const { t } = useLanguage();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

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
      await deliver(payload);
      setStatus('success');
    } catch (error) {
      console.error('[TrialForm]', error);
      setStatus('error');
    }
  };

  const invalid = (field) =>
    errors[field] ? { 'aria-invalid': true, 'aria-describedby': `${field}-error` } : {};

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
            <form noValidate onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
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

              <div className="sm:col-span-1">
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
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-sm text-accent-text">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="sm:col-span-1">
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
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-accent-text">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="phone">
                  {t.form.fields.phone} <span className="text-muted/70">({t.form.optional})</span>
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
                  {t.form.fields.level} <span className="text-muted/70">({t.form.optional})</span>
                </label>
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
              </div>

              <div className="sm:col-span-2">
                <label className="label" htmlFor="date">
                  {t.form.fields.date} <span className="text-muted/70">({t.form.optional})</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className="field"
                  value={values.date}
                  onChange={set('date')}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label" htmlFor="message">
                  {t.form.fields.message} <span className="text-muted/70">({t.form.optional})</span>
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

              <div className="sm:col-span-2">
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
                  <span className="text-sm leading-relaxed text-muted">
                    {t.form.consent.before}
                    <Link
                      to="/datenschutz"
                      className="text-accent-text underline underline-offset-2"
                    >
                      {t.form.consent.linkText}
                    </Link>
                    {t.form.consent.after} *
                  </span>
                </label>
                {errors.consent && (
                  <p id="consent-error" className="mt-1.5 text-sm text-accent-text">
                    {errors.consent}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <button type="submit" className="btn-accent" disabled={status === 'sending'}>
                  {status === 'sending' ? t.form.sending : t.form.submit}
                </button>
                {status === 'error' && (
                  <p role="alert" className="text-sm text-accent-text">
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
