'use client';

import { useCurrency } from '@/lib/currency-context';

export interface PaymentMethodCardProps {
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  badge?: string;
}

export function PaymentMethodCard({
  value,
  selected,
  onSelect,
  icon: Icon,
  label,
  description,
  badge,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={
        selected
          ? 'flex w-full items-center gap-3 rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 p-4 text-left transition-all'
          : 'flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-cyber-cyan/30'
      }
    >
      <div
        className={
          selected
            ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyber-cyan/50 bg-cyber-cyan/20 text-cyber-cyan'
            : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 bg-cyber-darker text-white/70'
        }
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white">{label}</p>
          {badge && (
            <span className="rounded-full border border-cyber-magenta/40 bg-cyber-magenta/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyber-magenta">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-white/60">{description}</p>
      </div>
      <div
        className={
          selected
            ? 'h-4 w-4 shrink-0 rounded-full border-2 border-cyber-cyan bg-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]'
            : 'h-4 w-4 shrink-0 rounded-full border-2 border-white/30'
        }
      />
    </button>
  );
}

export function useFormat() {
  const { format } = useCurrency();
  return format;
}
