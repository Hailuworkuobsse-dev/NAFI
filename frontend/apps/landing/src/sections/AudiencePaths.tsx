import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, Card, CardBody, CardHeader, cn } from '@nafi/ui-react';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

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
  const sectionRef = useScrollAnimation();

  return (
    <section id="audience" className="section-py bg-gradient-to-b from-neutral-50 to-white">
      <div ref={sectionRef} className="container-narrow flex flex-col gap-10 animate-on-scroll">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
            {t('audience.title')}
          </h2>
          <p className="mt-3 text-lg text-neutral-600">{t('audience.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ key, accent }) => {
            const points = t(`audience.${key}.points`, { returnObjects: true }) as string[];
            return (
              <Card key={key} className="group flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-2xl border-neutral-200 overflow-hidden">
                <CardHeader
                  title={
                    <span
                      className={cn(
                        'inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide',
                        accentMap[accent],
                      )}
                    >
                      {t(`audience.${key}.title`)}
                    </span>
                  }
                />
                <CardBody className="flex flex-1 flex-col gap-5 p-6">
                  <ul className="flex flex-col gap-3 text-sm">
                    {points.map((point, idx) => (
                      <li key={idx} className="flex gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                        <span className="text-neutral-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-4">
                    <Button asChild variant="outline" size="md" fullWidth className="group-hover:bg-gradient-to-r group-hover:from-brand-500 group-hover:to-brand-600 group-hover:text-white group-hover:border-transparent transition-all shadow-sm hover:shadow-md">
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
