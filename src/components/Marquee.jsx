import { useLanguage } from '../i18n/LanguageContext.jsx';

function Strip({ words, hidden }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-8 pr-8 font-display text-xl font-semibold sm:gap-12 sm:pr-12 sm:text-3xl"
    >
      {words.map((word, i) => (
        <li key={`${word}-${i}`} className="flex shrink-0 items-center gap-8 whitespace-nowrap sm:gap-12">
          {word}
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-ink/45" />
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden bg-accent py-4 text-accent-ink sm:py-5">
      <div className="flex w-max animate-marquee">
        <Strip words={t.marquee} />
        <Strip words={t.marquee} hidden />
      </div>
    </div>
  );
}
