// 'use client';

// import Link from 'next/link';
// import { useState, useEffect } from 'react';
// import { usePathname } from 'next/navigation';
// import {
//   LayoutDashboard,
//   FolderOpen,
//   Users,
//   DollarSign,
//   FileText,
//   MessageSquare,
//   Building,
//   Menu,
//   X,
//   ChevronRight,
//   Zap,
// } from 'lucide-react';
// import Image from "next/image";

// export default function Sidebar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const pathname = usePathname();

//   const menuItems = [
//     { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
//      { href: '/admin/team', label: 'Team', icon: Users },
//          { href: '/admin/clients', label: 'Clients', icon: Users },
//     { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
//     { href: '/admin/services', label: 'Services', icon: Zap },
//     // { href: '/admin/documents', label: 'Documents', icon: FileText },
//     // { href: '/admin/payments', label: 'Payments', icon: DollarSign },
//     // { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
//     // { href: '/admin/council', label: 'Council Status', icon: Building },
//   ];

//   useEffect(() => {
//     setIsOpen(false);
//   }, [pathname]);

//   return (
//     <>
//       {/* Mobile Menu Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
//       >
//         {isOpen ? <X size={24} /> : <Menu size={24} />}
//       </button>

//       {/* Overlay for mobile */}
//       {isOpen && (
//         <div
//           className="md:hidden fixed inset-0 bg-black/50 z-30 animate-fadeIn"
//           onClick={() => setIsOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } md:translate-x-0 fixed md:sticky top-0 md:top-0 z-40 w-64 h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-slate-100 p-6 transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col border-r border-slate-800 shadow-xl`}
//       >
//         {/* Logo Section */}
//     <div className="mb-8 mt-12 md:mt-0 animate-slideInDown">
//   <div className="flex items-center gap-3 mb-2">
//     <div className="w-50 h-10 rounded-lg overflow-hidden">
//       <Image
//         src="/images/logo2.png"
//         alt="AI4Planning logo"
//         width={150}
//         height={150}
//         className="object-contain"
//         priority
//       />
//     </div>

//     <div>
//       <h1 className="text-xl font-bold text-white">AI4Planning</h1>
//     </div>
//   </div>
// </div>

//         {/* Navigation Section */}
//         <nav className="space-y-1 flex-1">

//           {menuItems.map((item, idx) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.href;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={() => setIsOpen(false)}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium group relative overflow-hidden
//                   ${
//                     isActive
//                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
//                       : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
//                   }
//                 `}
//                 style={{
//                   animation: `slideInLeft 0.4s ease-out ${idx * 0.05}s both`,
//                 }}
//               >
//                 <Icon
//                   size={18}
//                   className={`transition-transform duration-300 group-hover:scale-110 ${
//                     isActive ? 'text-blue-200' : ''
//                   }`}
//                 />
//                 <span className="flex-1">{item.label}</span>
//                 {isActive && (
//                   <ChevronRight size={16} className="text-blue-200" />
//                 )}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Footer Section */}
//         <div className="pt-6 border-t border-slate-800 animate-slideInUp">

//           <p className="text-xs text-slate-500 mt-4 text-center">
//             © 2026 AI4Planning
//           </p>
//         </div>
//       </aside>
//     </>
//   );
// }

"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { SIDEBAR_ITEMS } from "@/app/lib/sidebar";
import { cn } from "@/app/lib/utils";
import { Logo } from "./logo";

/* ---------------- Divider ---------------- */
function SidebarDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-slate-300" />
      <span className="text-[10px] uppercase font-semibold tracking-widest text-black/40">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-300" />
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
export default function Sidebar({
  collapsed,
  onToggle,
  onGetStarted,
  isOverlay = false,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onGetStarted: () => void;
  isOverlay?: boolean;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();

  const userName = "Amelia Wright";
  const email = "amelia.wright@example.co.uk";

  return (
    <aside
      className={cn(
        "bg-white text-slate-700 flex flex-col border-r border-slate-200",
        "transition-all duration-300 ease-in-out",
        // positioning & height
        isOverlay
          ? "fixed inset-y-0 left-0 z-40 h-screen"
          : "sticky top-0 h-screen",
        // width & animation
        collapsed
          ? isOverlay
            ? "-translate-x-full w-64"
            : "w-20"
          : "translate-x-0 w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
        <Logo collapsed={collapsed && !isOverlay} />

        {/* Toggle only on desktop */}
        {!isOverlay && (
          <button onClick={onToggle} className="p-2 rounded hover:bg-slate-100">
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="px-0 py-3 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isOpen = openGroup === item.id;
          const isActive = item.href
            ? item.href === "/admin"
              ? pathname === "/admin" || pathname === "/admin/"
              : pathname === item.href || pathname.startsWith(item.href + "/")
            : false;

          /* -------- Section Dividers -------- */
          // if (item.id === "employees") {
          //   return (
          //     <div key={item.id}>
          //       {!collapsed && <SidebarDivider label="Employee" />}
          //     </div>
          //   )
          // }

          if (item.id === "reports") {
            return (
              <div key={item.id}>
                {!collapsed && <SidebarDivider label="Cases" />}
              </div>
            );
          }

          if (!item.children && item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "relative flex items-center rounded-md transition group",
                  collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-2",
                  isActive ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100",
                )}
                onClick={isOverlay ? onToggle : undefined}
              >
                {isActive && (
                  <span className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-r-md" />
                )}

                <Icon
                  className={cn(
                    "text-lg",
                    isActive
                      ? "text-blue-600"
                      : "text-slate-500 group-hover:text-slate-700",
                  )}
                />

                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          }

          /* -------- Parent With Children -------- */
          return (
            <div key={item.id}>
              <button
                onClick={() => setOpenGroup(isOpen ? null : item.id)}
                className={cn(
                  "w-full flex items-center rounded-md transition hover:bg-slate-100",
                  collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-2",
                )}
              >
                <Icon className="text-lg text-slate-500" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.children?.map((child) => {
                    const childActive =
                      pathname === child.href ||
                      pathname.startsWith(child.href + "/");

                    return (
                      <Link
                        key={child.id}
                        href={child.href}
                        onClick={isOverlay ? onToggle : undefined}
                        className={cn(
                          "relative block px-3 py-2 rounded-md text-sm transition",
                          childActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-500 hover:bg-slate-100",
                        )}
                      >
                        {childActive && (
                          <span className="absolute right-0 top-0 h-full w-1 bg-blue-600 rounded-r-md" />
                        )}
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-slate-200">
        <div className="p-3">
          <button
            onClick={onGetStarted}
            className="w-full px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
          >
            💬 {!collapsed && "Got Feedback?"}
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
