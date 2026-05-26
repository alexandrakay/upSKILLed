'use client';

import { Terminal } from 'lucide-react';
import { TOOLS } from '@/lib/catalog';
import { cn } from '@/lib/utils';

type Props = {
  selected: string | null;
  onSelect: (id: string) => void;
};

export function ToolGrid({ selected, onSelect }: Props) {
  const security = TOOLS.filter((t) => t.section === 'security');
  const devops = TOOLS.filter((t) => t.section === 'devops');

  const ToolButton = ({ tool }: { tool: (typeof TOOLS)[number] }) => (
    <button
      key={tool.id}
      onClick={() => onSelect(tool.id)}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium transition-colors',
        selected === tool.id
          ? 'border-purple-500 bg-purple-500/10 text-purple-300'
          : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-neutral-200'
      )}
    >
      <Terminal
        className="h-5 w-5"
        color={selected === tool.id ? '#a855f7' : '#888888'}
      />
      {tool.label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Security</p>
        <div className="grid grid-cols-5 gap-2">
          {security.map((t) => <ToolButton key={t.id} tool={t} />)}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">CLI / DevOps</p>
        <div className="grid grid-cols-5 gap-2">
          {devops.map((t) => <ToolButton key={t.id} tool={t} />)}
        </div>
      </div>
    </div>
  );
}
