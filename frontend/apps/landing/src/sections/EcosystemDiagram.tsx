import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Landmark,
  Users,
  Sprout,
  Tractor,
  Truck,
  ShieldCheck,
} from 'lucide-react';

import { cn } from '@nafi/ui-react';

const NODES = [
  { key: 'diaspora', Icon: Users, color: 'bg-brand-500' },
  { key: 'banks', Icon: Building2, color: 'bg-info' },
  { key: 'dbe', Icon: Landmark, color: 'bg-accent-500' },
  { key: 'nafa', Icon: ShieldCheck, color: 'bg-accent-500' },
  { key: 'suppliers', Icon: Truck, color: 'bg-neutral-500' },
  { key: 'farmers', Icon: Tractor, color: 'bg-brand-700' },
  { key: 'government', Icon: Sprout, color: 'bg-danger' },
] as const;

export function EcosystemDiagram() {
  const { t } = useTranslation('landing');
  const [active, setActive] = useState<(typeof NODES)[number]['key']>('farmers');

  const activeNode = NODES.find((n) => n.key === active)!;

  return (
    <div className="relative aspect-square w-full max-w-lg">
      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-brand-500 bg-white shadow-modal">
        <span className="text-lg font-bold text-brand-600">NAFI</span>
      </div>

      {[0, 1].map((ring) => (
        <div
          key={ring}
          aria-hidden="true"
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-neutral-200',
            ring === 0 ? 'h-56 w-56' : 'h-96 w-96',
          )}
        />
      ))}

      {NODES.map((node, idx) => {
        const angle = (idx / NODES.length) * Math.PI * 2 - Math.PI / 2;
        const radius = idx % 2 === 0 ? 130 : 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isActive = active === node.key;

        return (
          <button
            key={node.key}
            type="button"
            onClick={() => setActive(node.key)}
            aria-pressed={isActive}
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              left: '50%',
              top: '50%',
            }}
            className={cn(
              'absolute flex h-14 w-14 items-center justify-center rounded-full text-white shadow-card transition-transform',
              node.color,
              isActive ? 'scale-110 ring-4 ring-brand-200' : 'hover:scale-105',
            )}
            aria-label={t(`solution.nodes.${node.key}.title`)}
          >
            <node.Icon className="h-6 w-6" />
          </button>
        );
      })}

      <div className="absolute -bottom-4 left-1/2 w-[min(100%,20rem)] -translate-x-1/2 rounded-md border border-neutral-200 bg-white/95 p-4 shadow-dropdown backdrop-blur">
        <p className="text-sm font-semibold text-neutral-900">
          {t(`solution.nodes.${activeNode.key}.title`)}
        </p>
        <p className="mt-0.5 text-xs text-neutral-600">
          {t(`solution.nodes.${activeNode.key}.description`)}
        </p>
      </div>
    </div>
  );
}
