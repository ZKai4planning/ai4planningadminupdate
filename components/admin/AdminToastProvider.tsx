'use client';

import { createContext, useContext, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import BottomToast, { type ToastPayload } from '@/components/ui/bottom-toast';

type AdminToastContextValue = {
  toast: ToastPayload | null;
  setToast: Dispatch<SetStateAction<ToastPayload | null>>;
  showToast: (payload: ToastPayload) => void;
  clearToast: () => void;
};

const AdminToastContext = createContext<AdminToastContextValue | undefined>(undefined);

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const value = useMemo<AdminToastContextValue>(
    () => ({
      toast,
      setToast,
      showToast: (payload) => setToast(payload),
      clearToast: () => setToast(null),
    }),
    [toast],
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <BottomToast toast={toast} onClose={() => setToast(null)} />
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error('useAdminToast must be used within AdminToastProvider.');
  }
  return context;
}
