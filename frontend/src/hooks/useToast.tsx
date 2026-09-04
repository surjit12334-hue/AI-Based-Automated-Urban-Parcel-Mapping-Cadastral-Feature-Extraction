import { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

let toastRoot: ReactDOM.Root | null = null;
let toastContainerEl: HTMLDivElement | null = null;
let addToastFn: ((toast: Toast) => void) | null = null;

function ensureToastContainer() {
  if (toastContainerEl) return toastContainerEl;
  toastContainerEl = document.createElement('div');
  toastContainerEl.className = 'toast-container';
  document.body.appendChild(toastContainerEl);
  toastRoot = ReactDOM.createRoot(toastContainerEl);
  toastRoot.render(<ToastRenderer onRegister={(fn) => { addToastFn = fn; }} />);
  return toastContainerEl;
}

function ToastRenderer({ onRegister }: { onRegister: (fn: (toast: Toast) => void) => void }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register the add function on mount
  onRegister(addToast);

  const icons: Record<string, string> = {
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>',
    error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 9v4"/><circle cx="12" cy="17" r=".5"/><path d="M12 3l8.685 14.75A1 1 0 0 1 19.785 19H4.215a1 1 0 0 1-.9-1.25L12 3z"/></svg>',
    info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  };

  return (
    <>
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span dangerouslySetInnerHTML={{ __html: icons[t.type] }} />
          <span className="flex-1">{t.message}</span>
          <span className="toast-dismiss" onClick={() => removeToast(t.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
          </span>
        </div>
      ))}
    </>
  );
}

export function toast(type: Toast['type'], message: string) {
  ensureToastContainer();
  addToastFn?.({ id: crypto.randomUUID(), type, message });
}

toast.success = (msg: string) => toast('success', msg);
toast.error = (msg: string) => toast('error', msg);
toast.warning = (msg: string) => toast('warning', msg);
toast.info = (msg: string) => toast('info', msg);
