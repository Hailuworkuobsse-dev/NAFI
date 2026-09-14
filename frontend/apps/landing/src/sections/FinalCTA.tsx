import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@nafi/ui-react';

export function FinalCTA() {
  const { t } = useTranslation('landing');

  return (
    <section className="bg-gradient-to-br from-brand-600 to-brand-800 py-20">
      <div className="container-narrow flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
          {t('finalCta.title')}
        </h2>
        <p className="max-w-xl text-lg text-brand-100">{t('finalCta.subtitle')}</p>
        <Button
          asChild
          size="lg"
          className="mt-2 bg-white text-brand-700 hover:bg-brand-50"
        >
          <Link to="/register">
            {t('finalCta.cta')} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
