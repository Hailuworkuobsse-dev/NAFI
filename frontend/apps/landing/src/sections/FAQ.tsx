import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const KEYS = ['what', 'howInvest', 'risk', 'farmer', 'government'] as const;

export function FAQ() {
  const { t } = useTranslation('landing');

  return (
    <section id="faq" className="section-py bg-neutral-50">
      <div className="container-narrow flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{t('faq.title')}</h2>

        <RadixAccordion.Root
          type="single"
          collapsible
          className="mx-auto w-full max-w-3xl divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white"
        >
          {KEYS.map((key) => (
            <RadixAccordion.Item key={key} value={key} className="group">
              <RadixAccordion.Header>
                <RadixAccordion.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-50">
                  {t(`faq.items.${key}.q`)}
                  <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-data-[state=open]:rotate-180" />
                </RadixAccordion.Trigger>
              </RadixAccordion.Header>
              <RadixAccordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="px-5 pb-5 text-sm text-neutral-600">
                  {t(`faq.items.${key}.a`)}
                </div>
              </RadixAccordion.Content>
            </RadixAccordion.Item>
          ))}
        </RadixAccordion.Root>
      </div>
    </section>
  );
}
