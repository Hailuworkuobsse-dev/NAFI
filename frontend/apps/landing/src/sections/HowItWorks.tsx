import { UserCheck, Coins, Package, Sprout, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Timeline, type TimelineItem } from '@nafi/ui-react';

const STEP_ICONS = [UserCheck, Coins, Package, Sprout, BadgeCheck];
const STEP_KEYS = ['onboard', 'fund', 'deploy', 'produce', 'settle'] as const;

export function HowItWorks() {
  const { t } = useTranslation('landing');

  const items: TimelineItem[] = STEP_KEYS.map((key, idx) => {
    const Icon = STEP_ICONS[idx]!;
    return {
      id: key,
      title: t(`how.steps.${key}.title`),
      description: t(`how.steps.${key}.description`),
      status: 'complete',
      icon: <Icon className="h-4 w-4" />,
    };
  });

  return (
    <section id="how" className="section-py bg-white">
      <div className="container-narrow flex flex-col gap-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{t('how.title')}</h2>
          <p className="mt-3 text-lg text-neutral-600">{t('how.subtitle')}</p>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <Timeline items={items} />
        </div>
      </div>
    </section>
  );
}
