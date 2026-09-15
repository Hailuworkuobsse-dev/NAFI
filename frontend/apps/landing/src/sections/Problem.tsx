import { TrendingDown, Coins, FileWarning, PackageX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardBody } from '@nafi/ui-react';

const ITEMS = [
  { key: 'credit', Icon: TrendingDown },
  { key: 'diaspora', Icon: Coins },
  { key: 'enforcement', Icon: FileWarning },
  { key: 'leakage', Icon: PackageX },
] as const;

export function Problem() {
  const { t } = useTranslation('landing');

  return (
    <section id="problem" className="section-py bg-neutral-50">
      <div className="container-narrow flex flex-col gap-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-danger">
            {t('problem.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
            {t('problem.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ key, Icon }) => (
            <Card key={key} className="group border-danger/20 bg-white transition-all hover:shadow-lg hover:-translate-y-1">
              <CardBody className="flex flex-col gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-danger-light text-danger group-hover:scale-110 group-hover:bg-danger group-hover:text-white transition-all">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {t(`problem.items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {t(`problem.items.${key}.description`)}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
