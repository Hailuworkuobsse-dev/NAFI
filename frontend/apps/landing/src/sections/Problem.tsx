import { TrendingDown, Coins, FileWarning, PackageX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardBody } from '@nafi/ui-react';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

const ITEMS = [
  { key: 'credit', Icon: TrendingDown },
  { key: 'diaspora', Icon: Coins },
  { key: 'enforcement', Icon: FileWarning },
  { key: 'leakage', Icon: PackageX },
] as const;

export function Problem() {
  const { t } = useTranslation('landing');
  const sectionRef = useScrollAnimation();

  return (
    <section id="problem" className="section-py bg-gradient-to-b from-neutral-50 to-white">
      <div ref={sectionRef} className="container-narrow flex flex-col gap-10 animate-on-scroll">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-danger">
            {t('problem.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
            {t('problem.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ key, Icon }, idx) => (
            <Card key={key} className="group border-danger/20 bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <CardBody className="flex flex-col gap-4 p-6 relative">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-danger/5 transition-transform group-hover:scale-150" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-danger-light to-danger/20 text-danger group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-danger group-hover:to-danger-dark group-hover:text-white transition-all duration-300">
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
