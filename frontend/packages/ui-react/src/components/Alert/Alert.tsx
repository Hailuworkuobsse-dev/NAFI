import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
}

const variantStyles = {
  info: {
    wrapper: 'bg-info-light border-info/30 text-info-dark',
    icon: <Info className="h-5 w-5" />,
  },
  success: {
    wrapper: 'bg-success-light border-success/30 text-success-dark',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  warning: {
    wrapper: 'bg-warning-light border-warning/30 text-warning-dark',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  danger: {
    wrapper: 'bg-danger-light border-danger/30 text-danger-dark',
    icon: <AlertCircle className="h-5 w-5" />,
  },
} as const;

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, variant = 'info', title, icon, children, onClose, ...props },
  ref,
) {
  const style = variantStyles[variant];
  return (
    <div
      ref={ref}
      role={variant === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded border p-4', style.wrapper, className)}
      {...props}
    >
      <span className="mt-0.5 shrink-0">{icon ?? style.icon}</span>
      <div className="flex-1">
        {title && <p className="mb-0.5 font-medium">{title}</p>}
        {children && <div className="text-sm">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-current opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
});

Alert.displayName = 'Alert';
