import { forwardRef, useState, type ChangeEvent } from 'react';

import { CURRENCY_SYMBOLS, type SupportedCurrency } from '@nafi/formatters';

import { cn } from '../../lib/cn';

export interface CurrencyInputProps {
  value?: string;
  onChange?: (value: string) => void;
  currency: SupportedCurrency;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  className?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value = '',
      onChange,
      currency,
      label,
      placeholder = '0.00',
      disabled,
      error,
      hint,
      fullWidth = true,
      className,
    },
    ref,
  ) {
    const [internal, setInternal] = useState(value);
    const current = value ?? internal;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
        setInternal(raw);
        onChange?.(raw);
      }
    };

    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && <label className="text-sm font-medium text-neutral-700">{label}</label>}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
            {CURRENCY_SYMBOLS[currency]}
          </span>
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={current}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={hasError || undefined}
            className={cn(
              'h-10 w-full rounded border bg-white pl-12 pr-16 text-right text-sm font-mono tabular-nums',
              'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              'disabled:cursor-not-allowed disabled:bg-neutral-50',
              hasError ? 'border-danger' : 'border-neutral-300',
              className,
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500">
            {currency}
          </span>
        </div>
        {error && (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';
