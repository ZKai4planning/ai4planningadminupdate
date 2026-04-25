'use client';

import { useEffect, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar';
import HelpWidget from '@/components/bottombar';
import { DashboardFooter } from '@/components/Footer';
import { useMediaQuery } from '../lib/hooks/useMediaQuery';
import GlobalCommandPalette from '@/components/admin/GlobalCommandPalette';
import AdminNotificationCenter from '@/components/admin/AdminNotificationCenter';
import { AdminToastProvider } from '@/components/admin/AdminToastProvider';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLaptopUp = useMediaQuery('(min-width: 1024px)');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLaptopUp) {
      setMobileSidebarOpen(false);
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLaptopUp, mobileSidebarOpen]);

  return (
    <AdminToastProvider>
      <div className="relative flex min-h-screen w-full overflow-x-clip bg-slate-50">
        <div className="pointer-events-none absolute inset-0 -z-0">
        
        </div>
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggle={
            isLaptopUp
              ? () => setCollapsed((p) => !p)
              : () => setMobileSidebarOpen((p) => !p)
          }
          isOverlay={!isLaptopUp}
          isOpen={isLaptopUp ? true : mobileSidebarOpen}
        />

        {!isLaptopUp && mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar backdrop"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px]"
          />
        )}

        {/* Main Area */}
        <main className="relative z-10 flex min-w-0 flex-1 flex-col overflow-x-hidden">
          {!isLaptopUp && (
            <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                  aria-label="Open sidebar"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Admin Panel</p>
                  <p className="text-xs text-slate-500">Navigation and workspace</p>
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1 animate-fadeIn px-4 pb-20 pt-4 sm:px-5 md:px-6 md:pb-8 md:pt-6 lg:px-8 lg:pt-8">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </div>

          {/* Footer */}
          <DashboardFooter />
        </main>

        {/* Floating Help Widget */}
        <HelpWidget />
        <GlobalCommandPalette />
        <AdminNotificationCenter />
      </div>
    </AdminToastProvider>
  );
}
