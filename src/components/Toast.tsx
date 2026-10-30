import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, AlertTriangle } from 'lucide-react';

type Toast = { id: number; message: string; kind: 'success' | 'error' };
type ToastApi = { toast: (message: string, kind?: 'success' | 'error') => void };

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    const id = ++idRef.current;
    setItems(prev => [...prev.slice(-2), { id, message, kind }]);
    window.setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className={`toast ${t.kind === 'error' ? 'toast-error' : ''}`}>
            {t.kind === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
