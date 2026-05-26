'use client';

import { SERVICES } from '@/lib/catalog';
import { cn } from '@/lib/utils';

type Props = {
  selected: string | null;
  onSelect: (id: string) => void;
};

export function ServiceGrid({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {SERVICES.map((svc) => (
        <button
          key={svc.id}
          onClick={() => onSelect(svc.id)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium transition-colors',
            selected === svc.id
              ? 'border-purple-500 bg-purple-500/10 text-purple-300'
              : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-neutral-200'
          )}
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill={selected === svc.id ? '#a855f7' : `#${svc.icon.hex}`}
            aria-label={svc.label}
          >
            <path d={svc.icon.path} />
          </svg>
          {svc.label}
        </button>
      ))}
    </div>
  );
}
