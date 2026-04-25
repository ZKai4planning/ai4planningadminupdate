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

  /* ---------------- ACTIVE ROUTE FIX ---------------- */
  const isRouteActive = (href?: string) => {
    if (!href) return false;

    // ✅ Fix for dashboard root
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }

    return pathname === href || pathname.startsWith(href + "/");
  };

  /* ---------------- LOAD DATA ---------------- */
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
        const res = await axiosInstance.get(
          `/admin/profile/${userId}/status`
        );

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

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    document.cookie = "admin_auth=; path=/; max-age=0;";
    router.push("/");
    router.refresh();
  };

  /* ---------------- UI ---------------- */
  return (
    <aside
      className={cn(
        "flex flex-col overflow-hidden border-r bg-white transition-all duration-300",
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
      {/* HEADER */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            A
          </div>
          {!collapsed && (
            <span className="truncate font-semibold">Ai4planning</span>
          )}
        </div>

        {!isOverlay && (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        )}

        {isOverlay && (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(item.href);

          if (item.id === "logout") {
            return (
              <button
                key={item.id}
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50"
              >
                <Icon />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href || "#"}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition",
                collapsed && "justify-center",
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon
                className={cn(
                  active ? "text-blue-600" : "text-slate-500"
                )}
              />
              {!collapsed && (
                <span className="truncate text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* PROFILE COMPLETION */}
      {!collapsed && profileStatus && (
        <div className="shrink-0 border-t px-4 py-3">
          <div
            onClick={() => router.push("/admin/profile")}
            className="cursor-pointer bg-slate-50 p-3 rounded-lg hover:bg-slate-100"
          >
            <div className="flex justify-between text-xs mb-2">
              <span>Profile Completion</span>
              <span>{profileStatus.completionPercentage}%</span>
            </div>

            <div className="h-2 bg-slate-200 rounded-full">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: `${profileStatus.completionPercentage}%`,
                }}
              />
            </div>

            <p className="text-[11px] mt-2 text-slate-400">
              {profileStatus.completedFields} of{" "}
              {profileStatus.totalFields} completed
            </p>
          </div>
        </div>
      )}

      {/* USER */}
      <div className="shrink-0 border-t px-4 py-3">
        <Link
          href="/admin/profile"
          className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-md"
        >
          <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden">
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
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-gray-400">{email}</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
