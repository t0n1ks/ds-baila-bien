import { useLanguage } from '../i18n/LanguageContext.jsx';
import Reveal from './Reveal.jsx';

export default function Prices() {
  const { t } = useLanguage();

  return (
    <section id="preise" className="shell scroll-mt-24 py-20 sm:py-28">
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-section font-bold text-ink">{t.prices.heading}</h2>
        <p className="font-display text-base font-semibold text-accent-text">
          {t.prices.note}
        </p>
      </Reveal>

      <Reveal delay={90} className="mt-10 sm:mt-14">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="pb-3 text-sm font-medium text-muted">
                {t.prices.levelColumn}
              </th>
              <th scope="col" className="pb-3 text-right text-sm font-medium text-muted sm:text-left">
                {t.prices.priceColumn}
              </th>
              <th scope="col" className="pb-3 text-right text-sm font-medium text-muted">
                {t.prices.reducedColumn}
              </th>
            </tr>
          </thead>
          <tbody>
            {t.prices.rows.map((row) => (
              <tr key={row.level} className="border-b border-line">
                <th
                  scope="row"
                  className="py-6 pr-4 font-display text-2xl font-semibold text-ink sm:py-7 sm:text-3xl"
                >
                  {row.level}
                </th>
                <td className="py-6 text-right font-display text-2xl font-extrabold text-accent-text sm:py-7 sm:text-left sm:text-3xl">
                  {row.price}
                </td>
                <td className="py-6 text-right font-display text-xl font-semibold text-muted sm:py-7 sm:text-2xl">
                  {row.reduced}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <Reveal delay={140} className="mt-5 text-sm text-muted">
        {t.prices.footnote}
      </Reveal>
    </section>
  );
}
