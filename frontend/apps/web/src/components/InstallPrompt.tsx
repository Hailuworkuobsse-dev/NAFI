import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Card, CardBody } from '@nafi/ui-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'nafi.pwa.install-dismissed';

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!event || hidden) return null;

  const install = async () => {
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') setHidden(true);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setHidden(true);
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-toast w-[min(92vw,22rem)] -translate-x-1/2">
      <Card className="shadow-modal">
        <CardBody className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-900">Install NAFI Farmer</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              Works offline. Faster access. Uses less data.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={install}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-neutral-400 hover:text-neutral-700"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </CardBody>
      </Card>
    </div>
  );
}
