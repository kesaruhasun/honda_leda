import React from 'react';
import { LucideIcon, HelpCircle } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'teal' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'slate';
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  loading?: boolean;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal',
  trend,
  loading = false,
  tooltip,
  onClick,
  className = '',
}) => {
  const iconVariants: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200/80',
  };

  if (loading) {
    return (
      <div className={`apple-card p-4 space-y-3 min-w-0 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-3.5 bg-slate-200 rounded-md w-24 animate-pulse" />
          <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-7 bg-slate-200 rounded-lg w-20 animate-pulse mt-1" />
        <div className="h-3 bg-slate-100 rounded-md w-32 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`apple-card p-4 flex flex-col justify-between min-w-0 transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate" title={title}>
            {title}
          </span>
          {tooltip && (
            <span title={tooltip} className="text-slate-400 hover:text-slate-600 cursor-help shrink-0">
              <HelpCircle className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg border shrink-0 ${iconVariants[variant] || iconVariants.teal}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums truncate" title={String(value)}>
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="mt-1 flex items-center justify-between gap-2 text-[11px] min-w-0">
            {subtitle && (
              <span className="text-slate-500 truncate" title={subtitle}>
                {subtitle}
              </span>
            )}
            {trend && (
              <span
                className={`font-mono font-semibold shrink-0 ${
                  trend.isPositive === undefined
                    ? 'text-slate-600'
                    : trend.isPositive
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {trend.value} {trend.label && <span className="font-sans text-slate-400 text-[10px]">{trend.label}</span>}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
