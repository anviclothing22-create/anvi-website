import { createContext, useContext } from 'react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  variant?: 'success' | 'error' | 'info' | 'warning';
  message?: string;
  description?: string;
  title?: string;
  duration?: number;
}

export interface ToastNotification extends ToastMessage {}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within AppProviders/ToastContext.Provider');
  }
  return context;
}
