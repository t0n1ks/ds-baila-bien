import LegalNotice from '../components/LegalNotice.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Datenschutz() {
  const { t } = useLanguage();
  return <LegalNotice doc={t.legal.datenschutz} />;
}
