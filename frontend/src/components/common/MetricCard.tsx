import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'teal' | 'coral' | 'amber' | 'emerald' | 'slate';
  delta?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal',
  delta,
}) => {
  const variantStyles = {
    teal: 'bg-clinical-teal-50 text-clinical-teal-700 border-clinical-teal-100',
    coral: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="apple-card apple-card-hover p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-clinical-ink-secondary">{title}</span>
        <div className={`p-2 rounded-xl border ${variantStyles[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold font-mono tracking-tight text-clinical-ink">{value}</div>
        <div className="mt-1 flex items-center justify-between text-[11px]">
          {subtitle && <span className="text-clinical-ink-muted">{subtitle}</span>}
          {delta && (
            <span
              className={`font-semibold font-mono ${
                delta.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {delta.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
