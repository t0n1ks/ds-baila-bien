import LegalNotice from '../components/LegalNotice.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Impressum() {
  const { legal } = useLanguage();
  return <LegalNotice doc={legal.impressum} />;
}
