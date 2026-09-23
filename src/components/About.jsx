import { useLanguage } from '../i18n/LanguageContext.jsx';
import Reveal from './Reveal.jsx';

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="shell scroll-mt-24 py-20 sm:py-28">
      <Reveal className="grid gap-10 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-16">
        <h2 className="font-display text-section font-bold text-ink">{t.about.heading}</h2>
        <p className="max-w-measure text-lg leading-relaxed text-ink sm:text-xl">{t.about.text}</p>
      </Reveal>

      <Reveal
        as="ul"
        delay={90}
        className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:mt-20 sm:grid-cols-3"
      >
        {t.about.stats.map((stat) => (
          <li key={stat.label} className="bg-bg px-7 py-10 sm:px-8 sm:py-12">
            <p className="font-display text-[clamp(3.5rem,7vw,5.5rem)] font-extrabold leading-none tracking-tight text-accent-text">
              {stat.value}
            </p>
            <p className="mt-4 max-w-[22ch] leading-snug text-muted">{stat.label}</p>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
