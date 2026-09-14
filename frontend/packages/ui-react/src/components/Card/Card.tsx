import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('rounded-md border border-neutral-200 bg-white shadow-card', className)}
      {...props}
    />
  );
});

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, title, description, action, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-0.5">
        {title && <h3 className="text-base font-semibold text-neutral-900">{title}</h3>}
        {description && <p className="text-sm text-neutral-500">{description}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
});

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...props }, ref) {
    return <div ref={ref} className={cn('px-5 py-4', className)} {...props} />;
  },
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3',
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';
