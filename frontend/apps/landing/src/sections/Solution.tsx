import { useTranslation } from 'react-i18next';

export function Solution() {
  const { t } = useTranslation('landing');

  return (
    <section id="solution" className="section-py bg-gradient-to-b from-white to-neutral-50">
      <div className="container-narrow flex flex-col gap-12">
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
              className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-brand-50 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500 text-white">
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
