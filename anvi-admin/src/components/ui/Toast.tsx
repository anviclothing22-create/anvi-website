import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastMessage } from '../../hooks/useToast';

export interface ToastProps {
  toasts: ToastMessage[];
  onRemove?: (id: string) => void;
  onClose?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove, onClose }) => {
  const handleDismiss = (id: string) => {
    if (onRemove) onRemove(id);
    if (onClose) onClose(id);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const styleVariant = toast.type || toast.variant || 'info';
        const displayBody = toast.message || toast.description || '';

        const iconMap = {
          success: <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />,
          error: <AlertCircle size={18} className="text-rose-600 shrink-0" />,
          info: <Info size={18} className="text-blue-600 shrink-0" />,
          warning: <AlertTriangle size={18} className="text-amber-600 shrink-0" />,
        };

        const bgMap = {
          success: 'border-emerald-200 bg-emerald-50/95 text-emerald-900',
          error: 'border-rose-200 bg-rose-50/95 text-rose-900',
          info: 'border-blue-200 bg-blue-50/95 text-blue-900',
          warning: 'border-amber-200 bg-amber-50/95 text-amber-900',
        };

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-fade-in',
              bgMap[styleVariant]
            )}
          >
            {iconMap[styleVariant]}
            <div className="flex-1 text-xs leading-relaxed">
              {toast.title && <strong className="block font-semibold mb-0.5">{toast.title}</strong>}
              {displayBody && <span>{displayBody}</span>}
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(toast.id)}
              className="text-current opacity-60 hover:opacity-100 p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
