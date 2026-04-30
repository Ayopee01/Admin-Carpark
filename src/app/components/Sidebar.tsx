"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
// Icons
import { LuLayoutDashboard, LuSearch, LuWalletCards, LuUsers, LuSlidersHorizontal, LuSettings2, LuChevronLeft, LuLogOut, LuX } from "react-icons/lu";
import { FaParking } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
// Types
import type { PermissionKey, SidebarUser, SidebarMenuItem } from "@/src/app/type/auth/Permission";

/* -------------------- Config -------------------- */

const menuItems: SidebarMenuItem[] = [
  {
    label: "แดชบอร์ด",
    href: "/landing/dashboard",
    icon: LuLayoutDashboard,
    permissions: ["dashboard"],
  },
  {
    label: "ตรวจสอบ",
    href: "/landing/check-payment",
    icon: LuSearch,
    permissions: ["transactions"],
  },
  {
    label: "ยอดรวมทั้งหมด",
    href: "/landing/summary",
    icon: LuWalletCards,
    permissions: ["overview"],
  },
  {
    label: "การตั้งค่าสมาชิก",
    href: "/landing/member",
    icon: LuUsers,
    permissions: ["settings"],
  },
  {
    label: "ตั้งค่าอุปกรณ์",
    href: "/landing/device",
    icon: LuSlidersHorizontal,
    permissions: ["devices", "pricing", "theme"],
  },
  {
    label: "ตั้งค่าระบบ",
    href: "/landing/system",
    icon: LuSettings2,
    permissions: ["settings"],
  },
];

/* -------------------- Functions -------------------- */

// Function ดึงข้อมูลผู้ใช้จาก Local Storage
function getStoredUser() {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("user");

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as SidebarUser;
  } catch {
    return null;
  }
}

// Function ตรวจสอบ Permission ของ ID
function hasAnyPermission(
  user: SidebarUser | null,
  permissions: PermissionKey[]
) {
  if (!user) return false;

  if (user.role === "super_admin") return true;

  if (!Array.isArray(user.permissions)) return false;

  return permissions.some((permission) =>
    user.permissions?.includes(permission)
  );
}

/* -------------------- Component -------------------- */
function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [openLogoutPopup, setOpenLogoutPopup] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => hasAnyPermission(user, item.permissions));
  }, [user]);

  /* -------------------- API fetchers -------------------- */

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser(storedUser);
    }

    async function fetchMe() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/landing/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setUser(storedUser);
          return;
        }

        const nextUser = (data?.user ?? data ?? null) as SidebarUser | null;

        setUser(nextUser);

        if (nextUser) {
          localStorage.setItem("user", JSON.stringify(nextUser));
        }
      } catch {
        setUser(storedUser);
      }
    }

    fetchMe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (visibleMenuItems.length === 0) return;

    const canAccessCurrentPath = visibleMenuItems.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );

    if (!canAccessCurrentPath) {
      router.replace(visibleMenuItems[0].href);
    }
  }, [pathname, router, user, visibleMenuItems]);

  const closeLogoutConfirm = () => {
    setOpenLogoutPopup(false);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch { }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    router.push("/landing/login");
  };

  /* -------------------- UI Sidebar -------------------- */

  return (
    <>
      <nav className={`relative flex h-screen flex-col bg-slate-900 text-white transition-[width] duration-300 ease-in-out 
      ${collapsed ? "w-24" : "w-64"}`}
      >
        {/* Collapsed */}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="absolute -right-6 top-10 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-slate-900 shadow-md"
          aria-label={collapsed ? "ขยาย sidebar" : "ย่อ sidebar"}
        >
          <LuChevronLeft
            className={`h-6 w-6 transition-transform duration-300 ${collapsed ? "rotate-180" : "rotate-0"
              }`}
          />
        </button>

        <div className="flex flex-1 flex-col overflow-hidden p-5">
          {/* logo */}
          <div className="mb-10 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-lg bg-blue-300 text-slate-900">
              <p className="text-xl font-bold">P</p>
            </div>

            <div
              className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-in-out ${collapsed
                ? "max-w-0 -translate-x-2 opacity-0"
                : "max-w-full translate-x-0 opacity-100"
                }`}
            >
              <h1 className="text-lg font-extrabold leading-none tracking-normal align-middle">
                Smart Carpark
              </h1>
              <p className="mt-1 text-xs font-bold leading-4 tracking-widest uppercase align-middle">
                SUPPORT
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <ul className="flex flex-col gap-3">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg px-4 py-4 text-sm transition-colors duration-200 ${isActive
                      ? "bg-white text-slate-900"
                      : "text-white hover:bg-white/10"
                      } ${collapsed ? "justify-center" : "justify-start"}`}
                  >
                    <div className="text-2xl flex shrink-0 items-center justify-center">
                      <Icon />
                    </div>

                    <span
                      className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin,transform] duration-300 ease-in-out ${collapsed
                        ? "ml-0 max-w-0 -translate-x-2 opacity-0"
                        : "ml-3 max-w-full translate-x-0 opacity-100"
                        }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto">
            <div
              className={`p-4 flex items-center ${collapsed ? "justify-center" : "justify-start"
                }`}
            >
              <div className="text-2xl">
                <FiUser />
              </div>

              <div className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin,transform] duration-300 ease-in-out ${collapsed
                ? "ml-0 max-w-0 -translate-x-2 opacity-0"
                : "ml-3 max-w-full translate-x-0 opacity-100"
                }`}
              >
                <p className="text-xs font-semibold leading-5 text-white">
                  {user?.name ?? "-"}
                </p>
                <p className="text-xs leading-5 text-white/80">
                  {user?.role ?? "-"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpenLogoutPopup(true)}
              className={`cursor-pointer flex w-full items-center rounded-2xl p-4 text-sm text-white transition-colors duration-200 hover:bg-white/10 ${collapsed ? "justify-center" : "justify-start"
                }`}
            >
              <div className="text-xl flex shrink-0 items-center justify-center">
                <LuLogOut />
              </div>

              <span
                className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin,transform] duration-300 ease-in-out ${collapsed
                  ? "ml-0 max-w-0 -translate-x-2 opacity-0"
                  : "ml-3 max-w-full translate-x-0 opacity-100"
                  }`}
              >
                ออกจากระบบ
              </span>
            </button>
            <div className="flex flex-col text-start border-t border-white/10 pt-5">
              <p className="text-xs font-bold leading-4 tracking-normal align-middle text-zinc-400">ระบบลานจอดรถ Smart Carpark</p>
              <p className="text-xs font-bold leading-4 tracking-normal align-middle text-zinc-400">v1.0.0</p>
            </div>
          </div>
        </div>
      </nav>

      {/* -------------------- Popup Logout -------------------- */}

      {openLogoutPopup ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs"
          onClick={closeLogoutConfirm}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800/15 px-6 py-5 bg-slate-900/10">
              <div>
                <h2 className="text-2xl font-bold leading-8 tracking-normal align-middle">
                  ยืนยันการออกจากระบบ
                </h2>
                <p className="mt-1 text-sm font-normal leading-5 tracking-normal align-middle text-slate-900">ยืนยันการออกจากระบบ</p>
              </div>

              <button
                type="button"
                onClick={closeLogoutConfirm}
                className="cursor-pointer text-slate-900 transition hover:opacity-70"
                aria-label="ปิด"
              >
                <LuX className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="mx-auto flex h-60 w-80 flex-col items-center justify-center rounded-lg bg-slate-100 p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm">
                  <LuUsers className="h-7 w-7" />
                </div>

                <p className="text-xl font-bold leading-7 tracking-normal text-center align-middle">
                  {user?.name ?? "-"}
                </p>
                <p className="mt-2 text-sm font-normal leading-5 tracking-normal text-center align-middle">
                  ตำแหน่ง {user?.role ?? "-"}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/15 bg-slate-900/10">
              <div className="py-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={closeLogoutConfirm}
                  className="cursor-pointer text-sm font-semibold leading-5 tracking-normal text-center align-middle rounded-full bg-slate-900/50 px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="cursor-pointer text-sm font-semibold leading-5 tracking-normal text-center align-middle rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Sidebar;