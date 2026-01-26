'use client';

import * as React from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.slice(-3).map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

// Individual Toast
const toastStyles: Record<ToastType, { border: string; icon: typeof CheckCircle; iconColor: string }> = {
  success: { border: 'border-l-emerald-500', icon: CheckCircle, iconColor: 'text-emerald-500' },
  error: { border: 'border-l-red-500', icon: XCircle, iconColor: 'text-red-500' },
  warning: { border: 'border-l-amber-500', icon: AlertTriangle, iconColor: 'text-amber-500' },
  info: { border: 'border-l-blue-500', icon: Info, iconColor: 'text-blue-500' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isExiting, setIsExiting] = React.useState(false);
  const { border, icon: Icon, iconColor } = toastStyles[toast.type];

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 200);
  };

  return (
    <div
      className={cn(
        'w-80 p-4 bg-white rounded-lg shadow-lg border-l-4 transform transition-all duration-200',
        border,
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      )}
      onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
      onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900">{toast.title}</p>
          {toast.description && (
            <p className="text-sm text-slate-600 mt-1">{toast.description}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="text-slate-400 hover:text-slate-600 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Standalone Toast component for direct use
export function Toast({
  type,
  title,
  description,
  onDismiss,
}: {
  type: ToastType;
  title: string;
  description?: string;
  onDismiss?: () => void;
}) {
  const { border, icon: Icon, iconColor } = toastStyles[type];

  return (
    <div
      className={cn(
        'w-80 p-4 bg-white rounded-lg shadow-lg border-l-4',
        border
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900">{title}</p>
          {description && (
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
