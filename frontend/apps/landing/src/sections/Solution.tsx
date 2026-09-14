import { useTranslation } from 'react-i18next';

import { EcosystemDiagram } from './EcosystemDiagram';

export function Solution() {
  const { t } = useTranslation('landing');

  return (
    <section id="solution" className="section-py bg-white">
      <div className="container-narrow grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <EcosystemDiagram />
        </div>

        <div className="order-1 flex flex-col gap-4 lg:order-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {t('solution.eyebrow')}
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('solution.title')}
          </h2>
          <p className="text-lg text-neutral-600">{t('solution.subtitle')}</p>

          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {(
              ['diaspora', 'banks', 'dbe', 'nafa', 'suppliers', 'farmers', 'government'] as const
            ).map((key) => (
              <li key={key} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span>
                  <span className="font-semibold text-neutral-900">
                    {t(`solution.nodes.${key}.title`)}
                  </span>{' '}
                  <span className="text-neutral-600">
                    — {t(`solution.nodes.${key}.description`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
