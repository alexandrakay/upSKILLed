'use client';

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Mode = 'describe' | 'help';

type Props = {
  mode: Mode;
  value: string;
  onModeChange: (mode: Mode) => void;
  onValueChange: (value: string) => void;
};

export function CustomTab({ mode, value, onModeChange, onValueChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1 w-fit">
        {(['describe', 'help'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={cn(
              'rounded-md px-4 py-1.5 text-xs font-medium transition-colors',
              mode === m
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-neutral-500 hover:text-neutral-300'
            )}
          >
            {m === 'describe' ? 'Describe it' : 'Paste --help'}
          </button>
        ))}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={
          mode === 'describe'
            ? 'e.g. "A REST API for sending SMS messages via Twilio"'
            : 'Paste the output of your CLI tool\'s --help flag here…'
        }
        className="min-h-[140px] resize-none border-white/10 bg-white/[0.03] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-purple-500/40"
      />
    </div>
  );
}
