import { Link } from 'react-router-dom';
import { hasPendingDetails } from '../config.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Footer() {
  const { t, settings } = useLanguage();
  const emailPending = hasPendingDetails(settings.contactEmail);

  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="shell grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {settings.brandName}
          </p>
          <p className="mt-3 max-w-measure leading-relaxed text-muted">{t.footer.tagline}</p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold text-ink">{t.footer.contactHeading}</h2>
          {emailPending ? (
            <p className="mt-3 text-muted">⚠️ {settings.contactEmail}</p>
          ) : (
            <a className="mt-3 block text-muted hover:text-ink" href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
          )}
          <h2 className="mt-6 font-display text-sm font-semibold text-ink">{t.footer.followHeading}</h2>
          <a
            className="mt-3 block text-muted hover:text-ink"
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {settings.instagramHandle}
          </a>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold text-ink">{t.footer.legalHeading}</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link className="text-muted hover:text-ink" to="/impressum">
                {t.footer.impressum}
              </Link>
            </li>
            <li>
              <Link className="text-muted hover:text-ink" to="/datenschutz">
                {t.footer.datenschutz}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell border-t border-line py-6 text-sm text-muted">
        © {new Date().getFullYear()} {settings.brandName}. {t.footer.rights}
      </div>
    </footer>
  );
}
