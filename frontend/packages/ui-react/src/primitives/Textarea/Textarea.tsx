import * as React from 'react';
import { cn } from '../../lib/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, helperText, id, ...props }, ref) => {
    const textareaId = id || React.useId();
    const describedById = `${textareaId}-desc`;
    const message = error ?? hint ?? helperText;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          aria-describedby={message ? describedById : undefined}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />
        {message && (
          <p
            id={describedById}
            className={cn(
              'mt-1 text-sm',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {message}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
