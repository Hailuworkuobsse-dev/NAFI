import { useState } from 'react';

import { Card, CardBody, CardHeader, Input } from '@nafi/ui-react';

import { useAuth } from '@/auth/useAuth';

interface UssdScreen {
  text: string;
  options?: { key: string; label: string }[];
}

const SCREENS: Record<string, UssdScreen> = {
  root: {
    text: 'Welcome to NAFI\n1. My Contracts\n2. Input Deliveries\n3. Escrow Balance\n4. Payments\n5. Help',
    options: [
      { key: '1', label: 'My Contracts' },
      { key: '2', label: 'Input Deliveries' },
      { key: '3', label: 'Escrow Balance' },
      { key: '4', label: 'Payments' },
      { key: '5', label: 'Help' },
    ],
  },
  '1': {
    text: 'My Contracts\n1. Sesame — Active\n2. Coffee — Draft\n0. Back',
    options: [
      { key: '1', label: 'Sesame — Active' },
      { key: '2', label: 'Coffee — Draft' },
      { key: '0', label: 'Back' },
    ],
  },
  '2': {
    text: 'Input Deliveries\n1. NPK Fertilizer — Pending\n2. Sesame Seed — Verified\n0. Back',
    options: [
      { key: '1', label: 'NPK Fertilizer — Pending' },
      { key: '2', label: 'Sesame Seed — Verified' },
      { key: '0', label: 'Back' },
    ],
  },
  '3': {
    text: 'Escrow Balance\nETB 1,250,000.00\n0. Back',
    options: [{ key: '0', label: 'Back' }],
  },
  '4': {
    text: 'Payments\nLast settlement: 2026-08-15\nAmount: ETB 320,000.00\n0. Back',
    options: [{ key: '0', label: 'Back' }],
  },
  '5': {
    text: 'Help\nCall 8000 for support\n0. Back',
    options: [{ key: '0', label: 'Back' }],
  },
};

export function UssdSimulatorPage() {
  const { user } = useAuth();
  const [stack, setStack] = useState<string[]>(['root']);
  const [input, setInput] = useState('');

  const current = SCREENS[stack[stack.length - 1]!] ?? SCREENS.root!;

  const handleKey = (key: string) => {
    const top = stack[stack.length - 1];

    if (key === '0') {
      setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
      return;
    }

    if (top === 'root' && ['1', '2', '3', '4', '5'].includes(key)) {
      setStack((s) => [...s, key]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">USSD Simulator</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Test the feature-phone experience. Signed in as {user?.fullName}.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Feature phone" />
          <CardBody>
            <div className="mx-auto w-64 rounded-3xl border-8 border-neutral-800 bg-neutral-900 p-3">
              <div className="rounded bg-lime-100 p-4 font-mono text-xs text-neutral-900 shadow-inner">
                <pre className="whitespace-pre-wrap leading-relaxed">{current.text}</pre>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKey(k)}
                    className="rounded bg-neutral-700 py-3 text-base font-medium text-white hover:bg-neutral-600 active:bg-neutral-500"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Session stack" />
          <CardBody>
            <ol className="flex flex-col gap-1.5 text-sm text-neutral-700">
              {stack.map((s, i) => (
                <li key={`${s}-${i}`} className="flex items-center gap-2">
                  <span className="text-neutral-400">{i + 1}.</span>
                  <span className="font-mono">{s}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4">
              <Input
                placeholder="Type a USSD string e.g. *804#"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
