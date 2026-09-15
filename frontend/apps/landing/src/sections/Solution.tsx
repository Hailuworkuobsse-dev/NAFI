import { useTranslation } from 'react-i18next';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function Solution() {
  const { t } = useTranslation('landing');
  const sectionRef = useScrollAnimation();

  return (
    <section id="solution" className="section-py bg-gradient-to-b from-white to-neutral-50">
      <div ref={sectionRef} className="container-narrow flex flex-col gap-12 animate-on-scroll">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {t('solution.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
            {t('solution.title')}
          </h2>
          <p className="mt-4 text-lg text-neutral-600">{t('solution.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {([
            'diaspora',
            'banks',
            'dbe',
            'nafa',
            'suppliers',
            'farmers',
            'government',
          ] as const).map((key, idx) => (
            <div
              key={key}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-brand-50 to-accent-50 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg font-bold">{idx + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {t(`solution.nodes.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {t(`solution.nodes.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
