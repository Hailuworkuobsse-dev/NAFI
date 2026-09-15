import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@nafi/ui-react';

import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function FinalCTA() {
  const { t } = useTranslation('landing');
  const sectionRef = useScrollAnimation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 py-24">
      {/* Decorative elements */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
      
      <div ref={sectionRef} className="container-narrow relative z-10 flex flex-col items-center gap-6 text-center animate-on-scroll">
        <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {t('finalCta.title')}
        </h2>
        <p className="max-w-xl text-lg text-brand-100">{t('finalCta.subtitle')}</p>
        <Button
          asChild
          size="lg"
          className="mt-4 bg-white text-brand-700 hover:bg-brand-50 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 px-8"
        >
          <Link to="/register">
            {t('finalCta.cta')} <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
