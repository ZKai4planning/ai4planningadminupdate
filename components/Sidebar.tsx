"use client";

import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
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

const PROFILE_CACHE_KEY = "adminProfile";

export default function Sidebar({
  collapsed,
  onToggle,
  isOverlay = false,
  isOpen = true,
}: {
  collapsed: boolean;
  onToggle: () => void;
  isOverlay?: boolean;
  isOpen?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState("Admin User");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  const [profileStatus, setProfileStatus] = useState<{
    completionPercentage: number;
    completedFields: number;
    totalFields: number;
  } | null>(null);

  const isRouteActive = (href?: string) => {
    if (!href) return false;

    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }

    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    let isMounted = true;

    const auth = readCurrentAuth();
    const userId = resolveAuthUserId(auth);
    const authName = resolveAuthName(auth);
    const authEmail = resolveAuthEmail(auth);

    if (authName) setUserName(authName);
    if (authEmail) setEmail(authEmail);

    const cachedProfile =
      typeof window !== "undefined"
        ? window.localStorage.getItem(PROFILE_CACHE_KEY)
        : null;

    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile) as {
          name?: string;
          email?: string;
          profilePicture?: string;
        };

        setUserName(parsed.name || authName || "Admin User");
        setEmail(parsed.email || authEmail || "");
        setProfilePicture(parsed.profilePicture || "");
      } catch {}
    }

    const loadProfile = async () => {
      if (!userId) return;

      try {
        const res = await axiosInstance.get(`/admin/profile/${userId}`);
        const data = res?.data?.data ?? res?.data ?? {};

        if (!isMounted) return;

        setUserName(data.name || authName || "Admin User");
        setEmail(data.email || authEmail || "");
        setProfilePicture(data.profilePicture || "");
      } catch {}
    };

    const loadProfileStatus = async () => {
      if (!userId) return;

      try {
        const res = await axiosInstance.get(`/admin/profile/${userId}/status`);
        const data = res?.data ?? {};

        if (!isMounted) return;

        setProfileStatus({
          completionPercentage: data.completionPercentage ?? 0,
          completedFields: data.completedFields ?? 0,
          totalFields: data.totalFields ?? 0,
        });
      } catch (err) {
        console.error("Profile status failed", err);
      }
    };

    loadProfile();
    loadProfileStatus();

    const handleProfileUpdated = () => {
      const latestProfile =
        typeof window !== "undefined"
          ? window.localStorage.getItem(PROFILE_CACHE_KEY)
          : null;

      if (latestProfile) {
        try {
          const parsed = JSON.parse(latestProfile) as {
            name?: string;
            email?: string;
            profilePicture?: string;
          };

          if (!isMounted) return;

          setUserName(parsed.name || authName || "Admin User");
          setEmail(parsed.email || authEmail || "");
          setProfilePicture(parsed.profilePicture || "");
        } catch {}
      }

      void loadProfile();
      void loadProfileStatus();
    };

    window.addEventListener("admin-profile-updated", handleProfileUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("admin-profile-updated", handleProfileUpdated);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    document.cookie = "admin_auth=; path=/; max-age=0;";
    router.push("/");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "flex flex-col overflow-hidden border-r border-slate-200 bg-gradient-to-b from-white to-slate-50/70 transition-all duration-300",
        isOverlay
          ? "fixed inset-y-0 left-0 z-50 h-dvh w-[18rem] max-w-[85vw] shadow-xl"
          : "sticky top-0 h-screen",
        isOverlay
          ? isOpen
            ? "translate-x-0"
            : "-translate-x-full"
          : collapsed
          ? "w-20"
          : "w-64"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-sm">
            A
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[18px] font-semibold tracking-tight text-slate-900">
                Ai4planning
              </p>
              <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {!isOverlay && (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        )}

        {isOverlay && (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close sidebar"
          >
            <FiX />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(item.href);

          if (item.id === "logout") {
            return (
              <button
                key={item.id}
                onClick={handleLogout}
                className={cn(
                  "mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-red-600 transition hover:bg-red-50",
                  collapsed && "justify-center"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href || "#"}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                collapsed && "justify-center",
                active
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition",
                  active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                )}
              />
              {!collapsed && (
                <span className="truncate text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && profileStatus && (
        <div className="shrink-0 border-t border-slate-200 px-4 py-3">
          <div
            onClick={() => router.push("/admin/profile")}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:bg-slate-50"
          >
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Profile Completion</span>
              <span className="font-semibold text-slate-800">{profileStatus.completionPercentage}%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                style={{
                  width: `${profileStatus.completionPercentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              {profileStatus.completedFields} of {profileStatus.totalFields} completed
            </p>
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-slate-200 px-4 py-3">
        <Link
          href="/admin/profile"
          className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-slate-200 hover:bg-white"
        >
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-sm">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{userName}</p>
              <p className="truncate text-xs text-slate-500">{email}</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
