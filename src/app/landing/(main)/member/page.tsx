"use client";

import { useEffect, useMemo, useState } from "react";
//Icons
import { LuCheck, LuCreditCard, LuDownload, LuLayoutDashboard, LuPalette, LuPencil, LuPlus, LuReceipt, LuSearch, LuSettings, LuSlidersHorizontal, LuTrash2, LuX } from "react-icons/lu";
//Components
import AddMemberModal from "@/src/app/components/member/AddMemberModal";
import PermissionModal, { type PermissionItem } from "@/src/app/components/member/PermissionModal";
//Types
import type { CreateMemberPayload, Member, MemberRole, MemberStats, MemberStatus } from "@/src/app/type/member/member";

const PERMISSIONS: PermissionItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LuLayoutDashboard />,
  },
  {
    key: "transactions",
    label: "รายการจอดรถทั้งหมด",
    icon: <LuReceipt />,
  },
  {
    key: "overview",
    label: "ยอดรวมทั้งหมด",
    icon: <LuCreditCard />,
  },
  {
    key: "pricing",
    label: "กำหนดราคา",
    icon: <LuPencil />,
  },
  {
    key: "devices",
    label: "อุปกรณ์",
    icon: <LuSlidersHorizontal />,
  },
  {
    key: "theme",
    label: "ธีมสี",
    icon: <LuPalette />,
  },
  {
    key: "settings",
    label: "ตั้งค่า",
    icon: <LuSettings />,
  },
];

const PERMISSION_KEYS = new Set(PERMISSIONS.map((permission) => permission.key));

const ROLE_OPTIONS = [
  { value: "super_admin", label: "ผู้ดูแลระบบ" },
  { value: "admin", label: "แอดมิน" },
  { value: "manager", label: "ผู้จัดการ" },
  { value: "staff", label: "แคชเชียร์" },
];

const ROLE_RANK: Record<string, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  staff: 1,
};

function getRoleRank(role?: string) {
  if (!role) return 0;

  return ROLE_RANK[role] ?? 0;
}

function splitFullName(fullName: string) {
  const names = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = names.shift() ?? "";
  const lastName = names.join(" ");

  return { firstName, lastName };
}

function getMemberFullName(member: Partial<Member>) {
  const firstName = member.firstName?.trim() ?? "";
  const lastName = member.lastName?.trim() ?? "";
  const fullName = member.fullName?.trim() ?? "";

  return `${firstName} ${lastName}`.trim() || fullName;
}

function normalizePermissions(permissions?: string[]) {
  const selectedKeys = new Set(permissions ?? []);

  return PERMISSIONS.filter((permission) =>
    selectedKeys.has(permission.key)
  ).map((permission) => permission.key);
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function getErrorMessage(value: unknown, fallback: string) {
  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
  ) {
    return value.message;
  }

  return fallback;
}

function formatRole(role: MemberRole) {
  return ROLE_OPTIONS.find((item) => item.value === role)?.label ?? role;
}

function formatThaiDateTime(date: Date) {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  })
    .format(date)
    .replace(",", "");
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <article className="relative min-h-[138px] rounded-[8px] bg-[#E4E6E8] px-8 pb-5 pt-7">
      <div className="absolute inset-x-0 top-0 h-[4px] rounded-t-[8px] bg-[#1F2937]" />
      <p className="text-[13px] font-bold text-[#1F2937]">{title}</p>
      <p className="mt-5 text-[48px] font-bold leading-none tracking-[-0.6px] text-[#26313C]">
        {value}
      </p>
    </article>
  );
}

function StatusToggle({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-[24px] w-[48px] rounded-full transition ${
        checked ? "bg-[#21B947]" : "bg-[#D0D5DD]"
      }`}
    >
      <span
        className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-white transition ${
          checked ? "right-[3px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function MemberPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<MemberStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalAdmins: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Member>>({});

  const [currentDateTime, setCurrentDateTime] = useState("");

  const [form, setForm] = useState<CreateMemberPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "staff",
    permissions: ["dashboard"],
  });

  const [permissionDraft, setPermissionDraft] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function updateDateTime() {
      setCurrentDateTime(formatThaiDateTime(new Date()));
    }

    updateDateTime();

    const intervalId = window.setInterval(updateDateTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const [statsResponse, membersResponse] = await Promise.all([
        fetch("/api/members/stats", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }),
        fetch("/api/members", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }),
      ]);

      const statsJson = await statsResponse.json().catch(() => null);
      const membersJson = await membersResponse.json().catch(() => null);

      if (!statsResponse.ok) {
        throw new Error(getErrorMessage(statsJson, "โหลดสถิติสมาชิกไม่สำเร็จ"));
      }

      if (!membersResponse.ok) {
        throw new Error(
          getErrorMessage(membersJson, "โหลดรายการสมาชิกไม่สำเร็จ")
        );
      }

      setStats(statsJson as MemberStats);
      setMembers(Array.isArray(membersJson) ? membersJson : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const searchedMembers = !keyword
      ? members
      : members.filter((member) => {
          const fullName = getMemberFullName(member).toLowerCase();
          const email = (member.email ?? "").toLowerCase();
          const phone = (member.phone ?? "").toLowerCase();

          return (
            fullName.includes(keyword) ||
            email.includes(keyword) ||
            phone.includes(keyword)
          );
        });

    return [...searchedMembers].sort((a, b) => {
      const roleOrder = getRoleRank(b.role) - getRoleRank(a.role);

      if (roleOrder !== 0) return roleOrder;

      return getMemberFullName(a).localeCompare(getMemberFullName(b), "th");
    });
  }, [members, search]);

  function handleStartEdit(member: Member) {
    const fallbackName = splitFullName(member.fullName ?? "");

    setEditingId(member.id);
    setEditDraft({
      firstName: member.firstName || fallbackName.firstName,
      lastName: member.lastName || fallbackName.lastName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      status: member.status,
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditDraft({});
  }

  async function handleSaveEdit(memberId: string) {
    try {
      setSubmitting(true);
      setError("");

      const token = getToken();

      const response = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          firstName: String(editDraft.firstName ?? "").trim(),
          lastName: String(editDraft.lastName ?? "").trim(),
          email: String(editDraft.email ?? "").trim(),
          phone: String(editDraft.phone ?? "").trim(),
          role: editDraft.role,
          status: editDraft.status,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "แก้ไขสมาชิกไม่สำเร็จ"));
      }

      handleCancelEdit();
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(member: Member) {
    const nextStatus: MemberStatus =
      member.status === "active" ? "inactive" : "active";

    try {
      const token = getToken();

      const response = await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "เปลี่ยนสถานะไม่สำเร็จ"));
      }

      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  async function handleDelete(memberId: string) {
    const confirmDelete = window.confirm("ต้องการลบสมาชิกนี้หรือไม่?");

    if (!confirmDelete) return;

    try {
      const token = getToken();

      const response = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "ลบสมาชิกไม่สำเร็จ"));
      }

      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  async function handleCreateMember() {
    try {
      setSubmitting(true);
      setError("");

      const token = getToken();
      const payload: CreateMemberPayload = {
        ...form,
        permissions: normalizePermissions(form.permissions),
      };

      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "เพิ่มสมาชิกไม่สำเร็จ"));
      }

      setOpenAdd(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "staff",
        permissions: ["dashboard"],
      });

      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenPermission(member: Member) {
    setSelectedMember(member);
    setPermissionDraft(normalizePermissions(member.permissions));
    setOpenPermission(true);
  }

  function handleTogglePermission(key: string) {
    if (!PERMISSION_KEYS.has(key)) return;

    setPermissionDraft((prev) => {
      const nextPermissions = new Set(prev);

      if (nextPermissions.has(key)) {
        nextPermissions.delete(key);
      } else {
        nextPermissions.add(key);
      }

      return PERMISSIONS.filter((permission) =>
        nextPermissions.has(permission.key)
      ).map((permission) => permission.key);
    });
  }

  function handleClosePermission() {
    setOpenPermission(false);
    setSelectedMember(null);
    setPermissionDraft([]);
  }

  async function handleSavePermission() {
    if (!selectedMember) return;

    try {
      setSubmitting(true);
      setError("");

      const token = getToken();
      const payload = {
        permissions: normalizePermissions(permissionDraft),
      };

      const response = await fetch(
        `/api/members/${selectedMember.id}/permissions`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(result, "ตั้งค่าสิทธิ์ไม่สำเร็จ"));
      }

      handleClosePermission();
      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDownload() {
    const blob = new Blob([JSON.stringify(members, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "members.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <section className="min-h-screen bg-[#F3F4F6] px-6 py-8 text-[#1F2937] md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-7 flex items-start justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#49C85B] bg-[#F5FFF6] px-4 py-2 text-[13px] font-semibold text-[#38B449]">
              <span className="h-2 w-2 rounded-full bg-[#38B449]" />
              <span>Real-Time</span>
            </div>

            <p className="text-[13px] text-[#9CA3AF]">
              {currentDateTime || "-"}
            </p>
          </div>

          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-[42px] font-bold leading-8 tracking-[-0.6px] text-[#1F2937]">
                การตั้งค่าสมาชิก
              </h1>
              <p className="mt-4 text-[15px] text-[#6B7280]">
                จัดการข้อมูลและสิทธิ์การใช้งานของสมาชิก
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-[320px] items-center rounded-full border border-[#1F2937] bg-white px-5">
                <LuSearch size={18} className="text-[#6B7280]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหา..."
                  className="ml-3 w-full bg-transparent text-[14px] outline-none placeholder:text-[#8A94A6]"
                />
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex h-12 items-center gap-3 rounded-full bg-[#061D36] px-7 text-[14px] font-bold text-white"
              >
                <LuDownload size={17} />
                ดาวน์โหลด
              </button>

              <button
                type="button"
                onClick={() => setOpenAdd(true)}
                className="inline-flex h-12 items-center gap-3 rounded-full bg-[#061D36] px-7 text-[14px] font-bold text-white"
              >
                <LuPlus size={17} />
                เพิ่มสมาชิก
              </button>
            </div>
          </div>

          {error ? (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <StatCard title="สมาชิกทั้งหมด" value={stats.totalMembers} />
            <StatCard title="กำลังใช้งาน" value={stats.activeMembers} />
            <StatCard title="ADMINS" value={stats.totalAdmins} />
          </div>

          <div className="mt-8 overflow-hidden rounded-[18px] border border-[#061D36] bg-white">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-[#061D36] text-left text-[13px] font-bold text-white">
                <tr>
                  <th className="px-10 py-8">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-8">E-MAIL</th>
                  <th className="px-6 py-8">โทรศัพท์</th>
                  <th className="px-6 py-8">ตำแหน่ง</th>
                  <th className="px-6 py-8">สถานะ</th>
                  <th className="px-6 py-8 text-center">การจัดการ</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-10 py-10 text-[#6B7280]">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-10 py-10 text-center text-[#6B7280]"
                    >
                      ไม่พบข้อมูลสมาชิก
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const isEditing = editingId === member.id;

                    return (
                      <tr key={member.id} className="border-b border-[#EEF0F3]">
                        <td className="px-10 py-8">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input
                                value={editDraft.firstName ?? ""}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    firstName: event.target.value,
                                  }))
                                }
                                placeholder="ชื่อ"
                                className="h-9 w-[120px] border border-[#1F2937] px-3 text-[14px] outline-none"
                              />

                              <input
                                value={editDraft.lastName ?? ""}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    lastName: event.target.value,
                                  }))
                                }
                                placeholder="นามสกุล"
                                className="h-9 w-[140px] border border-[#1F2937] px-3 text-[14px] outline-none"
                              />
                            </div>
                          ) : (
                            <span className="text-[16px] font-bold text-[#111827]">
                              {getMemberFullName(member) || "-"}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-8">
                          {isEditing ? (
                            <input
                              value={editDraft.email ?? ""}
                              onChange={(event) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  email: event.target.value,
                                }))
                              }
                              className="h-9 w-[210px] border border-[#1F2937] px-3 text-[14px] outline-none"
                            />
                          ) : (
                            member.email || "-"
                          )}
                        </td>

                        <td className="px-6 py-8">
                          {isEditing ? (
                            <input
                              value={editDraft.phone ?? ""}
                              onChange={(event) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  phone: event.target.value,
                                }))
                              }
                              className="h-9 w-[160px] border border-[#1F2937] px-3 text-[14px] outline-none"
                            />
                          ) : (
                            member.phone || "-"
                          )}
                        </td>

                        <td className="px-6 py-8">
                          {isEditing ? (
                            <select
                              value={editDraft.role ?? member.role}
                              onChange={(event) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  role: event.target.value as MemberRole,
                                }))
                              }
                              className="h-9 rounded-md border border-[#1F2937] bg-white px-3 text-[14px] outline-none"
                            >
                              {ROLE_OPTIONS.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="rounded-full border border-[#D5DAE1] bg-white px-3 py-1 text-[12px] font-bold">
                              {formatRole(member.role)}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-8">
                          <StatusToggle
                            checked={member.status === "active"}
                            onClick={() => handleToggleStatus(member)}
                          />
                        </td>

                        <td className="px-6 py-8">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              type="button"
                              onClick={() => handleOpenPermission(member)}
                              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-bold"
                            >
                              <LuSettings size={15} />
                              ตั้งค่าสิทธิ์
                            </button>

                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(member.id)}
                                  disabled={submitting}
                                  className="text-[#16A34A] disabled:opacity-60"
                                >
                                  <LuCheck size={22} />
                                </button>

                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  disabled={submitting}
                                  className="text-[#6B7280] disabled:opacity-60"
                                >
                                  <LuX size={22} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(member)}
                                  className="text-[#061D36]"
                                >
                                  <LuPencil size={22} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(member.id)}
                                  className="text-[#FF2F2F]"
                                >
                                  <LuTrash2 size={22} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <AddMemberModal
        open={openAdd}
        form={form}
        submitting={submitting}
        onClose={() => setOpenAdd(false)}
        onChange={setForm}
        onSubmit={handleCreateMember}
      />

      <PermissionModal
        open={openPermission}
        permissions={PERMISSIONS}
        selectedPermissions={permissionDraft}
        submitting={submitting}
        onClose={handleClosePermission}
        onToggle={handleTogglePermission}
        onSubmit={handleSavePermission}
      />
    </>
  );
}

export default MemberPage;