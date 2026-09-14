import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, Card, CardBody, CardHeader, cn } from '@nafi/ui-react';

const AUDIENCES = [
  { key: 'diaspora', accent: 'brand' },
  { key: 'farmers', accent: 'brand' },
  { key: 'banks', accent: 'info' },
  { key: 'government', accent: 'danger' },
] as const;

const accentMap = {
  brand: 'text-brand-600 bg-brand-50',
  info: 'text-info-dark bg-info-light',
  danger: 'text-danger-dark bg-danger-light',
} as const;

export function AudiencePaths() {
  const { t } = useTranslation('landing');

  return (
    <section id="audience" className="section-py bg-neutral-50">
      <div className="container-narrow flex flex-col gap-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('audience.title')}
          </h2>
          <p className="mt-3 text-lg text-neutral-600">{t('audience.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ key, accent }) => {
            const points = t(`audience.${key}.points`, { returnObjects: true }) as string[];
            return (
              <Card key={key} className="flex flex-col">
                <CardHeader
                  title={
                    <span
                      className={cn(
                        'inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase',
                        accentMap[accent],
                      )}
                    >
                      {t(`audience.${key}.title`)}
                    </span>
                  }
                />
                <CardBody className="flex flex-1 flex-col gap-4">
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {points.map((point, idx) => (
                      <li key={idx} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span className="text-neutral-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-2">
                    <Button asChild variant="outline" size="sm" fullWidth>
                      <Link to="/register">{t(`audience.${key}.cta`)}</Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
