import * as RadixTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string | undefined;
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  className?: string | undefined;
}

export function Tabs({ items, defaultValue, value, onValueChange, className }: TabsProps) {
  return (
    <RadixTabs.Root
      defaultValue={defaultValue ?? items[0]?.value}
      value={value || items[0]?.value}
      onValueChange={onValueChange}
      className={cn('flex flex-col gap-4', className)}
    >
      <RadixTabs.List className="inline-flex gap-1 border-b border-neutral-200">
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              'text-neutral-600 hover:text-neutral-900',
              'data-[state=active]:text-brand-600',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-transparent',
              'data-[state=active]:after:bg-brand-500',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="ml-2 rounded-full bg-neutral-100 px-1.5 text-xs text-neutral-600">
                {item.count}
              </span>
            )}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {items.map((item) => (
        <RadixTabs.Content
          key={item.value}
          value={item.value}
          className="focus-visible:outline-none"
        >
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
