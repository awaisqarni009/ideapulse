'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = DEFAULT_DURATION }: Omit<ToastMessage, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => {
        // Drop the oldest if limit exceeded per DESIGN.md §7.10
        const updated = [...prev, newToast];
        if (updated.length > MAX_TOASTS) {
          return updated.slice(updated.length - MAX_TOASTS);
        }
        return updated;
      });

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast],
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: 'success', message, title }),
    [showToast],
  );
  const error = useCallback(
    (message: string, title?: string) => showToast({ type: 'error', message, title }),
    [showToast],
  );
  const warning = useCallback(
    (message: string, title?: string) => showToast({ type: 'warning', message, title }),
    [showToast],
  );
  const info = useCallback(
    (message: string, title?: string) => showToast({ type: 'info', message, title }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Toast viewport per DESIGN.md §7.10: top-right on desktop, top-center full-width on mobile */}
      <aside
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:top-6 sm:items-end"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const isError = toast.type === 'error';
  const role = isError ? 'alert' : 'status';

  // 2px left border color in semantic tokens per DESIGN.md §7.10
  const borderColors: Record<ToastType, string> = {
    success: 'border-l-[var(--accent-success)]',
    error: 'border-l-[var(--accent-danger)]',
    warning: 'border-l-[var(--accent-warning)]',
    info: 'border-l-[var(--indigo)]',
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--accent-success)]" />,
    error: <AlertCircle className="h-5 w-5 shrink-0 text-[var(--accent-danger)]" />,
    warning: <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--accent-warning)]" />,
    info: <Info className="h-5 w-5 shrink-0 text-[var(--indigo-bright)]" />,
  };

  return (
    <div
      role={role}
      className={`pointer-events-auto relative flex w-full max-w-[380px] items-start gap-3 rounded-[var(--radius-lg)] border border-l-2 border-[var(--border-default)] ${borderColors[toast.type]} animate-in fade-in slide-in-from-top-2 bg-[var(--surface-4)] p-4 shadow-2xl backdrop-blur-[var(--blur-md)] transition-all duration-200`}
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 var(--edge-specular)',
      }}
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-xs leading-relaxed">
        {toast.title && <p className="font-semibold text-[var(--text-primary)]">{toast.title}</p>}
        <p className="text-[var(--text-secondary)]">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-full p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--indigo)]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
