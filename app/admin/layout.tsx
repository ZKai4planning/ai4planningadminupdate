'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import HelpWidget from '@/components/bottombar';
import { DashboardFooter } from '@/components/Footer';
import { useMediaQuery } from '../lib/hooks/useMediaQuery';
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isLaptopUp = useMediaQuery('(min-width: 1024px)');
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    document.cookie = "admin_auth=; path=/; max-age=0; samesite=lax";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(p => !p)}
        onGetStarted={() => {}}
        isOverlay={!isLaptopUp}
      />

      {/* Main Area */}
      <main className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-end border-b border-slate-200 bg-white px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 animate-fadeIn">
          <div className="max-w-8xl mx-auto">
            {children}
          </div>
        </div>

        {/* Footer */}
        <DashboardFooter />
      </main>

      {/* Floating Help Widget */}
      <HelpWidget />
    </div>
  );
}
