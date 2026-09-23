import LegalNotice from '../components/LegalNotice.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Datenschutz() {
  const { legal } = useLanguage();
  return <LegalNotice doc={legal.datenschutz} />;
}
