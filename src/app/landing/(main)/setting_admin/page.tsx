"use client";

import { useEffect, useState } from "react";
import {
  LuCheck,
  LuDownload,
  LuPencil,
  LuPlus,
  LuSearch,
  LuSettings2,
  LuTrash2,
} from "react-icons/lu";
import type {
  MemberResponse,
  MemberSummaryItem,
  MemberUser,
} from "@/src/app/type/member";

function SummaryCard({ item }: { item: MemberSummaryItem }) {
  return (
    <div className="rounded-2xl bg-[#D9D9D9] px-6 py-5 shadow-sm ring-1 ring-black/5">
      <div className="text-[12px] font-medium text-[#59636E]">{item.title}</div>

      <div className="mt-8 flex items-end gap-2">
        <div className="text-[34px] font-extrabold leading-none text-[#2F3B45]">
          {item.value}
        </div>
        <div className="pb-1 text-[14px] text-[#8A949D]">.</div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex rounded-full border border-[#D5D8DC] bg-[#F4F4F4] px-3 py-1 text-[11px] font-semibold text-[#2B3640]">
      {role}
    </span>
  );
}

function StatusSwitch({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={`relative h-6 w-10 rounded-full transition ${
        isActive ? "bg-[#35C447]" : "bg-[#C6CCD3]"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          isActive ? "left-5" : "left-1"
        }`}
      />
    </div>
  );
}

function ActionButtons({ user }: { user: MemberUser }) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-[#D7DADF] bg-[#F7F7F8] px-3 py-2 text-[12px] font-semibold text-[#1F2933]"
      >
        <LuSettings2 size={14} />
        ตั้งค่าสิทธิ์
      </button>

      <button
        type="button"
        className="text-[#1F2933] transition hover:opacity-70"
        aria-label={`แก้ไข ${user.fullName}`}
      >
        <LuPencil size={18} />
      </button>

      <button
        type="button"
        className="text-[#FF4D3A] transition hover:opacity-70"
        aria-label={`ลบ ${user.fullName}`}
      >
        <LuTrash2 size={18} />
      </button>
    </div>
  );
}

export default function SettingAdminPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [summary, setSummary] = useState<MemberSummaryItem[]>([]);
  const [users, setUsers] = useState<MemberUser[]>([]);
  const [serverTimeText, setServerTimeText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchMembers() {
      try {
        setLoading(true);
        setError("");

        const query = searchValue.trim()
          ? `?q=${encodeURIComponent(searchValue.trim())}`
          : "";

        const response = await fetch(`/api/members${query}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลสมาชิกได้");
        }

        const json: MemberResponse = await response.json();

        if (!json.ok) {
          throw new Error(json.message || "โหลดข้อมูลไม่สำเร็จ");
        }

        if (!ignore) {
          setSummary(json.data.summary);
          setUsers(json.data.users);
          setServerTimeText(json.data.serverTimeText);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchMembers();

    return () => {
      ignore = true;
    };
  }, [searchValue]);

  return (
    <section className="min-h-screen bg-[#EFEFEF] px-6 py-8 text-[#1F2933] md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#49C85B] bg-[#F5FFF6] px-4 py-2 text-[13px] font-semibold text-[#38B449]">
            <span className="h-2 w-2 rounded-full bg-[#38B449]" />
            <span>Real-Time</span>
          </div>

          <div className="text-[14px] text-[#808892]">{serverTimeText}</div>
        </div>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[42px] font-extrabold leading-none text-[#2B3640]">
              การตั้งค่าสมาชิก
            </h1>
            <p className="mt-2 text-[15px] text-[#67727E]">
              จัดการข้อมูลและสิทธิการใช้งานของสมาชิก
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-[#6D7684] bg-[#F5F5F5] px-4 py-3">
              <LuSearch size={16} className="text-[#66707B]" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="ค้นหา..."
                className="ml-3 w-[180px] bg-transparent text-[14px] outline-none placeholder:text-[#8A949D] md:w-[220px]"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#061D36] px-5 py-3 text-[14px] font-semibold text-white"
            >
              <LuDownload size={16} />
              ดาวน์โหลด
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#061D36] px-5 py-3 text-[14px] font-semibold text-white"
            >
              <LuPlus size={16} />
              เพิ่มสมาชิก
            </button>

            <button
              type="button"
              onClick={() => setSearchValue(searchInput)}
              className="hidden"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white px-6 py-5 text-[16px] text-[#47525E] shadow-sm">
            กำลังโหลดข้อมูล...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-[16px] text-red-600">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {summary.map((item) => (
                <SummaryCard key={item.title} item={item} />
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[20px] border border-[#AEB6C0] bg-[#F8F8F8] shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-[1120px] w-full">
                  <thead className="bg-[#031C36] text-left text-[13px] font-semibold text-white">
                    <tr>
                      <th className="px-8 py-6">ชื่อ-นามสกุล</th>
                      <th className="px-8 py-6">E-MAIL</th>
                      <th className="px-8 py-6">โทรศัพท์</th>
                      <th className="px-8 py-6">ตำแหน่ง</th>
                      <th className="px-8 py-6">สถานะ</th>
                      <th className="px-8 py-6 text-right">การจัดการ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-8 py-10 text-center text-[15px] text-[#6B7280]"
                        >
                          ไม่พบข้อมูลสมาชิก
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-[#E2E5EA] text-[14px] text-[#1F2933]"
                        >
                          <td className="px-8 py-7 font-semibold">{user.fullName}</td>
                          <td className="px-8 py-7">{user.email}</td>
                          <td className="px-8 py-7">{user.phone}</td>
                          <td className="px-8 py-7">
                            <RoleBadge role={user.roleText} />
                          </td>
                          <td className="px-8 py-7">
                            <StatusSwitch isActive={user.isActive} />
                          </td>
                          <td className="px-8 py-7">
                            <ActionButtons user={user} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}