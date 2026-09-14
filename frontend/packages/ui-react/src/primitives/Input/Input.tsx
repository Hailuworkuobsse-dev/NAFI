import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    hint,
    error,
    leadingIcon,
    trailingIcon,
    fullWidth = true,
    className,
    disabled,
    required,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedById = `${inputId}-desc`;
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {leadingIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={hint || error ? describedById : undefined}
          className={cn(
            'h-10 w-full rounded border bg-white px-3 text-sm text-neutral-900',
            'placeholder:text-neutral-400',
            'transition-colors',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
            hasError ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-neutral-300',
            leadingIcon && 'pl-9',
            trailingIcon && 'pr-9',
            className,
          )}
          {...props}
        />

        {trailingIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {trailingIcon}
          </span>
        )}
      </div>

      {(hint || error) && (
        <p
          id={describedById}
          className={cn('text-xs', hasError ? 'text-danger' : 'text-neutral-500')}
          role={hasError ? 'alert' : undefined}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
