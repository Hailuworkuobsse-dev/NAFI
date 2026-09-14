import * as RadixToast from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { cn } from '@nafi/ui-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextValue {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles = {
  default: 'border-neutral-200 bg-white text-neutral-900',
  success: 'border-success/30 bg-success-light text-success-dark',
  error: 'border-danger/30 bg-danger-light text-danger-dark',
  warning: 'border-warning/30 bg-warning-light text-warning-dark',
  info: 'border-info/30 bg-info-light text-info-dark',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setMessages((prev) => [...prev, { id, ...message }]);
  }, []);

  const dismiss = (id: string) => setMessages((prev) => prev.filter((m) => m.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}

        {messages.map((m) => (
          <RadixToast.Root
            key={m.id}
            open
            onOpenChange={(open) => !open && dismiss(m.id)}
            duration={5000}
            className={cn(
              'flex items-start gap-3 rounded-md border p-4 shadow-dropdown',
              variantStyles[m.variant ?? 'default'],
            )}
          >
            <div className="flex-1">
              <RadixToast.Title className="text-sm font-medium">{m.title}</RadixToast.Title>
              {m.description && (
                <RadixToast.Description className="mt-0.5 text-xs opacity-80">
                  {m.description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close aria-label="Dismiss">
              <X className="h-4 w-4 opacity-60 hover:opacity-100" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}

        <RadixToast.Viewport className="fixed bottom-4 right-4 z-toast flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
