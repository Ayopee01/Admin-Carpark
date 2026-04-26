"use client";

import type { ReactNode } from "react";
import { LuX } from "react-icons/lu";

export type PermissionItem = {
    key: string;
    label: string;
    icon: ReactNode;
};

type Props = {
    open: boolean;
    permissions: PermissionItem[];
    selectedPermissions: string[];
    submitting: boolean;
    onClose: () => void;
    onToggle: (key: string) => void;
    onSubmit: () => void;
};

function PermissionModal({
    open,
    permissions,
    selectedPermissions,
    submitting,
    onClose,
    onToggle,
    onSubmit,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#111827]/80 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-[460px] overflow-hidden rounded-[14px] bg-white shadow-2xl">
                <div className="bg-[#E9EAEC] px-7 py-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="absolute right-6 top-6 text-[#061D36] disabled:opacity-60"
                    >
                        <LuX size={22} />
                    </button>

                    <h2 className="text-[24px] font-bold text-[#061D36]">
                        ตั้งค่าสิทธิ์
                    </h2>
                    <p className="text-[13px] text-[#6B7280]">การอนุญาตสิทธิ์</p>
                </div>

                <div className="px-8 py-7">
                    <div className="space-y-5">
                        {permissions.map((permission) => (
                            <label
                                key={permission.key}
                                className="flex cursor-pointer items-center justify-between"
                            >
                                <span className="flex items-center gap-4 text-[14px] text-[#111827]">
                                    <span className="text-[18px]">{permission.icon}</span>
                                    {permission.label}
                                </span>

                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permission.key)}
                                    onChange={() => onToggle(permission.key)}
                                    disabled={submitting}
                                    className="h-4 w-4 accent-[#061D36] disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </label>
                        ))}
                    </div>

                    <div className="mt-9 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="h-11 min-w-[110px] rounded-full bg-[#9CA3AF] px-6 text-[14px] font-bold text-white disabled:opacity-60"
                        >
                            ยกเลิก
                        </button>

                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={submitting}
                            className="h-11 min-w-[110px] rounded-full bg-[#061D36] px-6 text-[14px] font-bold text-white disabled:opacity-60"
                        >
                            {submitting ? "กำลังบันทึก..." : "ตกลง"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PermissionModal;
