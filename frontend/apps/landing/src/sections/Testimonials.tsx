import { useTranslation } from 'react-i18next';

import { Card, CardBody } from '@nafi/ui-react';

const KEYS = ['one', 'two'] as const;

export function Testimonials() {
  const { t } = useTranslation('landing');

  return (
    <section className="section-py bg-white">
      <div className="container-narrow flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
          {t('testimonials.title')}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {KEYS.map((key) => (
            <Card key={key}>
              <CardBody className="flex flex-col gap-4">
                <p className="text-lg leading-relaxed text-neutral-700">
                  “{t(`testimonials.items.${key}.quote`)}”
                </p>
                <div className="flex items-center gap-3 border-t border-neutral-100 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {t(`testimonials.items.${key}.author`).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {t(`testimonials.items.${key}.author`)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t(`testimonials.items.${key}.role`)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
