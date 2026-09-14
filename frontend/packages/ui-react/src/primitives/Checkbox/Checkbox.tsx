import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '../../lib/cn';

export interface CheckboxProps {
  checked?: boolean | 'indeterminate' | undefined;
  onCheckedChange?: ((checked: boolean | 'indeterminate') => void) | undefined;
  disabled?: boolean | undefined;
  label?: string | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  className?: string | undefined;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { checked, onCheckedChange, disabled, label, hint, error, className },
  ref,
) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="inline-flex items-start gap-2">
        <RadixCheckbox.Root
          ref={ref}
          checked={checked ?? false}
          onCheckedChange={onCheckedChange ?? (() => {})}
          disabled={disabled ?? false}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-500',
            'data-[state=indeterminate]:border-brand-500 data-[state=indeterminate]:bg-brand-500',
            error ? 'border-danger' : 'border-neutral-300',
          )}
        >
          <RadixCheckbox.Indicator>
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        {label && <span className="text-sm text-neutral-700">{label}</span>}
      </label>
      {hint && !error && <p className="ml-7 text-xs text-neutral-500">{hint}</p>}
      {error && (
        <p className="ml-7 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
