import * as RadixSwitch from '@radix-ui/react-switch';
import { forwardRef } from 'react';

import { cn } from '../../lib/cn';

export interface SwitchProps {
  checked?: boolean | undefined;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  disabled?: boolean | undefined;
  label?: string | undefined;
  className?: string | undefined;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onCheckedChange, disabled, label, className },
  ref,
) {
  return (
    <label className={cn('inline-flex items-center gap-3', className)}>
      <RadixSwitch.Root
        ref={ref}
        checked={checked ?? false}
        onCheckedChange={onCheckedChange ?? (() => {})}
        disabled={disabled ?? false}
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
          'data-[state=checked]:bg-brand-500 data-[state=unchecked]:bg-neutral-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <RadixSwitch.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform',
            'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
          )}
        />
      </RadixSwitch.Root>
      {label && <span className="text-sm text-neutral-700">{label}</span>}
    </label>
  );
});

Switch.displayName = 'Switch';
