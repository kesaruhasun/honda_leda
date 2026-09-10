import React, { ReactNode } from 'react';

export type BadgeVariant =
  | 'emergency'
  | 'urgent'
  | 'routine'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    emergency: 'bg-rose-50 text-rose-700 border-rose-200',
    urgent: 'bg-amber-50 text-amber-700 border-amber-200',
    routine: 'bg-teal-50 text-teal-700 border-teal-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border font-mono ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
