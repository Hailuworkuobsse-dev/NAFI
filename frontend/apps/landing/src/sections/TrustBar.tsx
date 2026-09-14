import { useTranslation } from 'react-i18next';

const PARTNERS = ['NBE', 'DBE', 'MoA', 'EIC', 'NAFA', 'EIB', 'IFAD', 'World Bank'] as const;

export function TrustBar() {
  const { t } = useTranslation('landing');

  return (
    <section className="border-y border-neutral-200 bg-white py-8">
      <div className="container-narrow flex flex-col items-center gap-4">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
          {t('trustBar.title')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {PARTNERS.map((partner) => (
            <span
              key={partner}
              className="text-sm font-semibold tracking-tight text-neutral-400 transition-colors hover:text-neutral-600"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
