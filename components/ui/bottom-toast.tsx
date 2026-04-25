'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export type ToastPayload = {
  message: string;
  type?: ToastType;
};

type BottomToastProps = {
  toast: ToastPayload | null;
  onClose: () => void;
  durationMs?: number;
};

const getToastClasses = (type: ToastType) => {
  if (type === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  if (type === 'error') {
    return 'border-red-200 bg-red-50 text-red-800';
  }
  return 'border-slate-200 bg-white text-slate-800';
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  if (type === 'success') {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (type === 'error') {
    return <AlertCircle className="h-4 w-4" />;
  }
  return <Info className="h-4 w-4" />;
};

export default function BottomToast({
  toast,
  onClose,
  durationMs = 3500,
}: BottomToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [durationMs, onClose, toast]);

  if (!toast) return null;

  const toastType = toast.type ?? 'info';

  return (
    <div className="pointer-events-none fixed bottom-6 right-4 z-[60]">
      <div
        role="alert"
        className={`pointer-events-auto inline-flex max-w-[min(100vw-2rem,36rem)] items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${getToastClasses(
          toastType,
        )}`}
      >
        <ToastIcon type={toastType} />
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-current/70 hover:bg-black/5 hover:text-current"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
