"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuLayoutDashboard,
  LuSearch,
  LuWalletCards,
  LuUsers,
  LuSlidersHorizontal,
  LuSettings2,
  LuChevronLeft,
  LuLogOut,
  LuX,
} from "react-icons/lu";
import { FaParking } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import type {MeResponse} from "@/src/app/type/auth/me"

const menuItems = [
  { label: "Dashboard", href: "/landing/dashboard", icon: LuLayoutDashboard },
  { label: "ตรวจสอบ", href: "/landing/check-payment", icon: LuSearch },
  { label: "ยอดรวมทั้งหมด", href: "/landing/summary", icon: LuWalletCards },
  { label: "การตั้งค่าสมาชิก", href: "/landing/setting_admin", icon: LuUsers },
  { label: "ตั้งค่าอุปกรณ์", href: "/landing/setting_device", icon: LuSlidersHorizontal },
  { label: "ตั้งค่าระบบ", href: "/landing/setting_system", icon: LuSettings2 },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [openLogoutPopup, setOpenLogoutPopup] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
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
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setUser(null);
          return;
        }

        // ถ้า API me คืน { user: {...} } ให้ใช้ data.user
        // ถ้าคืน object user ตรงๆ ให้ใช้ data
        setUser(data?.user ?? data ?? null);
      } catch {
        setUser(null);
      }
    }

    fetchMe();
  }, [router]);

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
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    router.push("/landing/login");
  };

  return (
    <>
      <nav
        className={`relative flex h-screen flex-col bg-[#031C36] text-white transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-[120px]" : "w-[300px]"
        }`}
      >
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="absolute -right-5 top-10 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-[#031C36] shadow-md"
          aria-label={collapsed ? "ขยาย sidebar" : "ย่อ sidebar"}
        >
          <LuChevronLeft
            size={20}
            className={`transition-transform duration-300 ${
              collapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        <div className="flex flex-1 flex-col overflow-hidden px-5 py-6">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#9DCCFF] text-[#031C36]">
              <FaParking size={30} />
            </div>

            <div
              className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-in-out ${
                collapsed
                  ? "max-w-0 -translate-x-2 opacity-0"
                  : "max-w-[180px] translate-x-0 opacity-100"
              }`}
            >
              <h1 className="text-[18px] font-extrabold leading-[18px]">
                Smart Carpark
              </h1>
              <p className="mt-1 text-[12px] font-semibold tracking-[0.25em] text-white/90">
                SUPPORT
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-2xl px-4 py-4 text-[16px] transition-colors duration-200 ${
                      isActive
                        ? "bg-white text-[#1C2530]"
                        : "text-white hover:bg-white/10"
                    } ${collapsed ? "justify-center" : "justify-start"}`}
                  >
                    <div className="flex w-6 shrink-0 items-center justify-center">
                      <Icon size={24} />
                    </div>

                    <span
                      className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin,transform] duration-300 ease-in-out ${
                        collapsed
                          ? "ml-0 max-w-0 -translate-x-2 opacity-0"
                          : "ml-3 max-w-[220px] translate-x-0 opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto border-t border-white/10 pt-5">
            <div
              className={`flex items-center ${
                collapsed ? "justify-center" : "justify-start"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white">
                <FiUser size={22} />
              </div>

              <div
                className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin,transform] duration-300 ease-in-out ${
                  collapsed
                    ? "ml-0 max-w-0 -translate-x-2 opacity-0"
                    : "ml-3 max-w-[180px] translate-x-0 opacity-100"
                }`}
              >
                <p className="text-[16px] font-semibold leading-5 text-white">
                  {user?.name ?? "-"}
                </p>
                <p className="text-[13px] leading-5 text-white/80">
                  {user?.role ?? "-"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpenLogoutPopup(true)}
              className={`mt-5 flex w-full items-center rounded-2xl px-4 py-3 text-[16px] text-white transition-colors duration-200 hover:bg-white/10 ${
                collapsed ? "justify-center" : "justify-start"
              }`}
            >
              <div className="flex w-6 shrink-0 items-center justify-center">
                <LuLogOut size={24} />
              </div>

              <span
                className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin,transform] duration-300 ease-in-out ${
                  collapsed
                    ? "ml-0 max-w-0 -translate-x-2 opacity-0"
                    : "ml-3 max-w-[180px] translate-x-0 opacity-100"
                }`}
              >
                ออกจากระบบ
              </span>
            </button>
          </div>
        </div>
      </nav>

      {openLogoutPopup ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#031C36]/55 px-4 backdrop-blur-[2px]"
          onClick={closeLogoutConfirm}
        >
          <div
            className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-zinc-200 px-6 py-5">
              <div>
                <h2 className="text-[30px] font-extrabold leading-tight text-[#1C2530]">
                  ยืนยันการออกจากระบบ
                </h2>
                <p className="mt-1 text-sm text-zinc-500">ยืนยันการออกจากระบบ</p>
              </div>

              <button
                type="button"
                onClick={closeLogoutConfirm}
                className="text-[#1C2530] transition hover:opacity-70"
                aria-label="ปิด"
              >
                <LuX className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="mx-auto flex min-h-[190px] max-w-[260px] flex-col items-center justify-center rounded-2xl bg-[#F4F7FA] px-6 py-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#1C2530] shadow-sm">
                  <FiUser className="h-7 w-7" />
                </div>

                <p className="text-[28px] font-bold leading-tight text-[#1C2530]">
                  {user?.name ?? "-"}
                </p>
                <p className="mt-2 text-base text-zinc-500">
                  ตำแหน่ง {user?.role ?? "-"}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={closeLogoutConfirm}
                  className="min-w-[110px] rounded-full bg-[#031C36] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-w-[110px] rounded-full bg-[#031C36] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
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