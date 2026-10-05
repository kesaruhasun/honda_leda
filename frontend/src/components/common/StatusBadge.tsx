import React, { ReactNode } from 'react';

export type StatusVariant =
  | 'emergency'
  | 'urgent'
  | 'routine'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

export interface StatusBadgeProps {
  children?: ReactNode;
  status?: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  status,
  variant,
  size = 'sm',
  dot = false,
  className = '',
}) => {
  // Infer variant from status string if not explicitly given
  let resolvedVariant: StatusVariant = variant || 'neutral';
  const label = children || status || 'Unknown';

  if (!variant && status) {
    const s = String(status).toUpperCase();
    if (s === 'EMERGENCY' || s === 'STAT' || s === 'CRITICAL' || s === 'CANCELLED' || s === 'UNPAID' || s === 'ERROR' || s === 'ABNORMAL') {
      resolvedVariant = 'emergency';
    } else if (s === 'URGENT' || s === 'PENDING' || s === 'SCHEDULED' || s === 'WARNING' || s === 'LOW_STOCK') {
      resolvedVariant = 'urgent';
    } else if (s === 'CONFIRMED' || s === 'PAID' || s === 'COMPLETED' || s === 'DISPENSED' || s === 'ACTIVE' || s === 'SUCCESS' || s === 'NORMAL') {
      resolvedVariant = 'success';
    } else if (s === 'IN_PROGRESS' || s === 'PROCESSING' || s === 'COLLECTED' || s === 'INFO') {
      resolvedVariant = 'info';
    } else {
      resolvedVariant = 'neutral';
    }
  }

  const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
    emergency: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    urgent: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    routine: {
      badge: 'bg-teal-50 text-teal-800 border-teal-200/80',
      dot: 'bg-teal-500',
    },
    success: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    warning: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    error: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    info: {
      badge: 'bg-sky-50 text-sky-800 border-sky-200/80',
      dot: 'bg-sky-500',
    },
    neutral: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200/80',
      dot: 'bg-slate-400',
    },
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const style = variantStyles[resolvedVariant];

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded-md border shrink-0 whitespace-nowrap transition-colors ${style.badge} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />}
      <span className="truncate">{label}</span>
    </span>
  );
};
export default StatusBadge;
