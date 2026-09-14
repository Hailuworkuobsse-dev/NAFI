import { ShieldCheck, Lock, FileCheck2, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardBody } from '@nafi/ui-react';

const ITEMS = [
  { key: 'sandbox', Icon: ShieldCheck },
  { key: 'escrow', Icon: Lock },
  { key: 'audit', Icon: FileCheck2 },
  { key: 'data', Icon: Database },
] as const;

export function Security() {
  const { t } = useTranslation('landing');

  return (
    <section id="security" className="section-py bg-brand-50/60">
      <div className="container-narrow flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{t('security.title')}</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ key, Icon }) => (
            <Card key={key}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {t(`security.items.${key}.title`)}
                </h3>
                <p className="text-sm text-neutral-600">
                  {t(`security.items.${key}.description`)}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
