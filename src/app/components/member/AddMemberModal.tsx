"use client";

import { LuX } from "react-icons/lu";
import type { CreateMemberPayload } from "@/src/app/type/member/member";

type Props = {
    open: boolean;
    form: CreateMemberPayload;
    submitting: boolean;
    onClose: () => void;
    onChange: React.Dispatch<React.SetStateAction<CreateMemberPayload>>;
    onSubmit: () => void;
};

const ROLE_OPTIONS = [
    { value: "super_admin", label: "ผู้ดูแลระบบ" },
    { value: "staff", label: "แคชเชียร์" },
];

function AddMemberModal({
    open,
    form,
    submitting,
    onClose,
    onChange,
    onSubmit,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#26313C]/75 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-[520px] rounded-[14px] bg-white p-8 shadow-2xl">
                <button type="button" onClick={onClose} className="absolute right-6 top-6 text-[#061D36]">
                    <LuX size={22} />
                </button>

                <h2 className="text-[24px] font-bold text-[#061D36]">เพิ่มสมาชิก</h2>
                <p className="mt-1 text-[14px] text-[#6B7280]">กรอกข้อมูลสมาชิกใหม่</p>

                <div className="mt-7 grid grid-cols-2 gap-4">
                    <input
                        value={form.firstName}
                        onChange={(e) => onChange((p) => ({ ...p, firstName: e.target.value }))}
                        placeholder="ระบุชื่อ"
                        className="h-11 rounded-md border border-[#E5E7EB] px-4 outline-none"
                    />

                    <input
                        value={form.lastName}
                        onChange={(e) => onChange((p) => ({ ...p, lastName: e.target.value }))}
                        placeholder="ระบุนามสกุล"
                        className="h-11 rounded-md border border-[#E5E7EB] px-4 outline-none"
                    />

                    <input
                        value={form.email}
                        onChange={(e) => onChange((p) => ({ ...p, email: e.target.value }))}
                        placeholder="example@gridlock.com"
                        className="col-span-2 h-11 rounded-md border border-[#E5E7EB] px-4 outline-none"
                    />

                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => onChange((p) => ({ ...p, password: e.target.value }))}
                        placeholder="example1234567890"
                        className="col-span-2 h-11 rounded-md border border-[#E5E7EB] px-4 outline-none"
                    />

                    <input
                        value={form.phone}
                        onChange={(e) => onChange((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="08X-XXX-XXXX"
                        className="col-span-2 h-11 rounded-md border border-[#E5E7EB] px-4 outline-none"
                    />

                    <select
                        value={form.role}
                        onChange={(e) => onChange((p) => ({ ...p, role: e.target.value }))}
                        className="col-span-2 h-11 rounded-md border border-[#E5E7EB] px-4 outline-none"
                    >
                        <option value="">เลือกตำแหน่ง</option>
                        {ROLE_OPTIONS.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-9 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="h-11 min-w-[110px] rounded-full bg-[#9CA3AF] px-6 text-[14px] font-bold text-white">
                        ยกเลิก
                    </button>

                    <button type="button" onClick={onSubmit} disabled={submitting} className="h-11 min-w-[110px] rounded-full bg-[#061D36] px-6 text-[14px] font-bold text-white disabled:opacity-60">
                        ตกลง
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddMemberModal;