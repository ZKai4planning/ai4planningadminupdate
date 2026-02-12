'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import HelpWidget from '@/components/bottombar';
import { DashboardFooter } from '@/components/Footer';
import { useMediaQuery } from '../lib/hooks/useMediaQuery';
import { useRouter } from "next/navigation";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isLaptopUp = useMediaQuery('(min-width: 1024px)');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full bg-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-0">
      
      </div>
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(p => !p)}
        onGetStarted={() => {}}
        isOverlay={!isLaptopUp}
      />

      {/* Main Area */}
      <main className="relative z-10 flex flex-col flex-1 min-w-0">
      

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 animate-fadeIn">
          <div className="max-w-[1600px] mx-auto">
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
