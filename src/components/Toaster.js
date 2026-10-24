'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'error' ? 6000 : 3000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="card flex items-start gap-3 px-4 py-3 shadow-lg" style={{ animation: 'toast-in .2s ease-out' }}>
            {t.type === 'error'
              ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
              : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />}
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button className="text-faint hover:text-ink" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Runs a server action and shows its result. Actions return { error } or { ok, message }. */
export function useRunAction() {
  const toast = useToast();
  return useCallback(async (fn, successMessage) => {
    try {
      const res = await fn();
      if (res?.error) {
        toast(res.error, 'error');
        return null;
      }
      if (successMessage || res?.message) toast(res?.message || successMessage);
      return res || {};
    } catch (e) {
      toast(e?.message || 'Something went wrong.', 'error');
      return null;
    }
  }, [toast]);
}
