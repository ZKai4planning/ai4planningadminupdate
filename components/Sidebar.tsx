"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SIDEBAR_ITEMS } from "@/app/lib/sidebar";
import { cn } from "@/app/lib/utils";
import axiosInstance from "@/app/lib/axiosinstance";
import {
  readCurrentAuth,
  resolveAuthEmail,
  resolveAuthName,
  resolveAuthUserId,
} from "@/app/lib/auth-session";
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
  const router = useRouter();

  const [userName, setUserName] = useState("Admin User");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadFromCache = () => {
      if (typeof window === "undefined") return;
      const cached = localStorage.getItem("adminProfile");
      if (!cached) return;

      try {
        const parsed = JSON.parse(cached) as {
          name?: string;
          email?: string;
          profilePicture?: string;
        };
        if (!isMounted) return;
        if (parsed.name) setUserName(parsed.name);
        if (typeof parsed.email === "string") setEmail(parsed.email);
        if (typeof parsed.profilePicture === "string") setProfilePicture(parsed.profilePicture);
      } catch {
        // Ignore invalid local profile cache
      }
    };

    const loadProfile = async () => {
      const auth = readCurrentAuth();
      const authName = resolveAuthName(auth);
      const authEmail = resolveAuthEmail(auth);
      const userId = resolveAuthUserId(auth);

      if (isMounted) {
        if (authName) setUserName(authName);
        if (authEmail) setEmail(authEmail);
      }

      loadFromCache();

      if (!userId) return;

      try {
        const response = await axiosInstance.get(`/admin/profile/${userId}`);
        const data = response?.data?.data ?? response?.data ?? {};
        if (!isMounted) return;

        const nextName =
          (typeof data?.name === "string" && data.name) || authName || "Admin User";
        const nextEmail =
          (typeof data?.email === "string" && data.email) || authEmail || "";
        const nextPicture =
          (typeof data?.profilePicture === "string" && data.profilePicture) || "";

        setUserName(nextName);
        setEmail(nextEmail);
        setProfilePicture(nextPicture);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "adminProfile",
            JSON.stringify({
              name: nextName,
              email: nextEmail,
              phoneNumber:
                typeof data?.phoneNumber === "string" ? data.phoneNumber : "",
              profilePicture: nextPicture,
            }),
          );
        }
      } catch {
        // Keep sidebar stable if profile API fails.
      }
    };

    const onProfileUpdated = () => {
      loadFromCache();
    };

    void loadProfile();
    if (typeof window !== "undefined") {
      window.addEventListener("admin-profile-updated", onProfileUpdated);
      window.addEventListener("storage", onProfileUpdated);
    }

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("admin-profile-updated", onProfileUpdated);
        window.removeEventListener("storage", onProfileUpdated);
      }
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("currentAuth");
    localStorage.removeItem("currentAuth");
    document.cookie = "admin_auth=; path=/; max-age=0; samesite=lax";
    router.push("/");
    router.refresh();
  };

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
        <div className="flex items-center gap-3 min-w-0">
          {/* <Logo collapsed={collapsed && !isOverlay} /> */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            A
          </div>
          {!(collapsed && !isOverlay) && (
            <span className="text-base font-semibold text-slate-900 truncate">
              Ai4planning
            </span>
          )}
        </div>

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

          if (item.id === "logout") {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isOverlay) {
                    onToggle();
                  }
                  handleLogout();
                }}
                className={cn(
                  "w-full relative flex items-center rounded-md transition group",
                  collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-2",
                  "text-red-600 hover:bg-red-50",
                )}
              >
                <Icon className="text-lg text-red-600" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
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
        {/* <div className="p-3">
          <button
            onClick={onGetStarted}
            className="w-full px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
          >
            💬 {!collapsed && "Got Feedback?"}
          </button>
        </div> */}

        {!collapsed ? (
          <div className="px-4 py-3 border-t border-slate-200">
            <Link
              href="/admin/profile"
              onClick={isOverlay ? onToggle : undefined}
              className="flex items-center gap-3 rounded-md p-1.5 transition hover:bg-slate-100"
            >
              <div className="h-9 w-9 overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white flex items-center justify-center">
                {profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (userName || "A").charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{userName || "Admin User"}</p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="px-3 py-3 border-t border-slate-200">
            <Link
              href="/admin/profile"
              className="flex items-center justify-center rounded-md p-1.5 transition hover:bg-slate-100"
              title={userName || "Profile"}
            >
              <div className="h-9 w-9 overflow-hidden rounded-full bg-blue-600 text-sm font-semibold text-white flex items-center justify-center">
                {profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (userName || "A").charAt(0).toUpperCase()
                )}
              </div>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
