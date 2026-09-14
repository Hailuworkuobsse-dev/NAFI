import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { Button } from '../../primitives/Button/Button';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dismissible?: boolean;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modal-backdrop bg-neutral-900/50 backdrop-blur-sm" />
        <Dialog.Content
          onInteractOutside={(e) => !dismissible && e.preventDefault()}
          onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
          className={cn(
            'fixed left-1/2 top-1/2 z-modal w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-modal',
            'flex max-h-[90vh] flex-col',
            sizeMap[size],
          )}
        >
          {(title || description) && (
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
              <div className="flex flex-col gap-0.5">
                {title && (
                  <Dialog.Title className="text-lg font-semibold text-neutral-900">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-sm text-neutral-500">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              {dismissible && (
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Close">
                    <X className="h-4 w-4" />
                  </Button>
                </Dialog.Close>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-6 py-4">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
