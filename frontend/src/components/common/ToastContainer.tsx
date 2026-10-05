import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClass = 'border-sky-200 bg-sky-50/95 text-sky-900';
        let iconColor = 'text-sky-600';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          colorClass = 'border-emerald-200 bg-emerald-50/95 text-emerald-900';
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClass = 'border-rose-200 bg-rose-50/95 text-rose-900';
          iconColor = 'text-rose-600';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClass = 'border-amber-200 bg-amber-50/95 text-amber-900';
          iconColor = 'text-amber-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto apple-card p-3.5 flex items-start gap-3 border shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-2 ${colorClass}`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${iconColor} mt-0.5`} />
            <div className="flex-1 text-xs min-w-0">
              <h4 className="font-bold truncate">{toast.title}</h4>
              <p className="mt-0.5 text-[11px] opacity-90 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 shrink-0"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
export default ToastContainer;
