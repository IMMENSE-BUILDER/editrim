import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, AlertTriangle } from 'lucide-react';

type Toast = { id: number; message: string; kind: 'success' | 'error'; leaving?: boolean };
type ToastApi = { toast: (message: string, kind?: 'success' | 'error') => void };

const ToastContext = createContext<ToastApi>({ toast: () => {} });
const DWELL_MS = 3000;
const EXIT_MS = 190;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timers = useRef(new Map<number, number[]>());

  const toast = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    const id = ++idRef.current;
    setItems(prev => [...prev.slice(-2), { id, message, kind }]);
    const leaveTimer = window.setTimeout(() => {
      setItems(prev => prev.map(t => (t.id === id ? { ...t, leaving: true } : t)));
    }, DWELL_MS);
    const removeTimer = window.setTimeout(() => {
      setItems(prev => prev.filter(t => t.id !== id));
      timers.current.delete(id);
    }, DWELL_MS + EXIT_MS);
    timers.current.set(id, [leaveTimer, removeTimer]);
  }, []);

  useEffect(() => () => {
    timers.current.forEach(ids => ids.forEach(id => window.clearTimeout(id)));
    timers.current.clear();
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className={`toast ${t.kind === 'error' ? 'toast-error' : ''} ${t.leaving ? 'is-leaving' : ''}`}>
            {t.kind === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
