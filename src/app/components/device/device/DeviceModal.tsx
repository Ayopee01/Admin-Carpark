"use client";

import type { Dispatch, SetStateAction } from "react";
import { LuX } from "react-icons/lu";
import type {
    DeviceMasterItem,
    DevicePayload,
} from "@/src/app/type/device/device";

type DeviceActivationResult = {
    message?: string;
    CodeActivate?: string;
    code?: string;
    activationCode?: string;
    deviceId?: string | null;
    expiresAt?: string | null;
    expiresIn?: string;
};

type Props = {
    open: boolean;
    mode: "create" | "edit";
    form: DevicePayload;
    deviceTypes: DeviceMasterItem[];
    connectionTypes: DeviceMasterItem[];
    submitting: boolean;
    activationResult?: DeviceActivationResult | null;
    onClose: () => void;
    onChange: Dispatch<SetStateAction<DevicePayload>>;
    onSubmit: () => void;
    getActivationCode: (result: DeviceActivationResult | null) => string;
    formatDateTime: (value?: string | null) => string;
};

function DeviceModal({
    open,
    mode,
    form,
    deviceTypes,
    connectionTypes,
    submitting,
    activationResult,
    onClose,
    onChange,
    onSubmit,
    getActivationCode,
    formatDateTime,
}: Props) {
    if (!open) return null;

    const normalizedDeviceType = form.deviceType.toLowerCase();
    const isKiosk = normalizedDeviceType === "kiosk";
    const isBarrierGate =
        normalizedDeviceType === "barrier_gate" || normalizedDeviceType === "barrier";
    const isActivationDeviceType = isKiosk || isBarrierGate;
    const isActivationCreateFlow = mode === "create" && isActivationDeviceType;
    const activationCode = getActivationCode(activationResult ?? null);
    const activationExpiresAt =
        activationResult?.expiresAt ?? form.expiresAt ?? null;
    const statusLabel =
        form.status === "pending_activation"
            ? "รอ Activate"
            : form.status === "active"
              ? "Active"
              : form.status === "offline"
                ? "Offline"
              : "Inactive";
    const statusClassName =
        form.status === "pending_activation"
            ? "text-[#D97706]"
            : form.isOnline
              ? "text-[#16A34A]"
              : "text-[#EF4444]";

    const handleDeviceTypeChange = (value: string) => {
        onChange((prev) => ({
            ...prev,
            deviceType: value,
            connectionType:
                value === "kiosk" ||
                value === "barrier_gate" ||
                value === "barrier"
                    ? ""
                    : prev.connectionType,
            ipAddress:
                value === "kiosk" ||
                value === "barrier_gate" ||
                value === "barrier"
                    ? null
                    : prev.ipAddress,
            status:
                value === "kiosk" ||
                value === "barrier_gate" ||
                value === "barrier"
                    ? "pending_activation"
                    : prev.status,
            isOnline:
                value === "kiosk" ||
                value === "barrier_gate" ||
                value === "barrier"
                    ? false
                    : prev.isOnline,
        }));
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#26313C]/75 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-[520px] rounded-[14px] bg-white p-8 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-6 top-6 text-[#061D36]"
                >
                    <LuX size={22} />
                </button>

                <h2 className="text-[24px] font-bold text-[#061D36]">
                    {mode === "create" ? "เพิ่มอุปกรณ์" : "แก้ไขอุปกรณ์"}
                </h2>

                <p className="mt-1 text-[14px] text-[#6B7280]">
                    {isActivationCreateFlow
                        ? "กรอกชื่อและตำแหน่งเพื่อสร้าง Activation Code"
                        : isActivationDeviceType
                          ? "ตรวจสอบข้อมูล Activation และสถานะล่าสุดของอุปกรณ์"
                        : "กรอกข้อมูลเพื่อตั้งค่าอุปกรณ์เข้าสู่ระบบ"}
                </p>

                {activationCode ? (
                    <div className="mt-7 rounded-[14px] border border-[#BBF7D0] bg-[#F0FDF4] p-5">
                        <p className="text-[18px] font-bold text-[#166534]">
                            สร้าง Activation Code สำเร็จ
                        </p>
                        {activationResult?.message ? (
                            <p className="mt-1 text-[13px] text-[#15803D]">
                                {activationResult.message}
                            </p>
                        ) : null}

                        <div className="mt-5 rounded-[12px] bg-white p-4">
                            <p className="text-[12px] font-medium text-[#64748B]">
                                Activation Code
                            </p>
                            <p className="mt-2 text-[36px] font-black leading-none tracking-[6px] text-[#061D36]">
                                {activationCode}
                            </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-[10px] bg-white p-3">
                                <p className="text-[12px] text-[#64748B]">
                                    Device ID
                                </p>
                                <p className="mt-1 text-[14px] font-bold text-[#061D36]">
                                    {activationResult?.deviceId ?? "รอ Activate"}
                                </p>
                            </div>

                            <div className="rounded-[10px] bg-white p-3">
                                <p className="text-[12px] text-[#64748B]">
                                    Expires At
                                </p>
                                <p className="mt-1 text-[14px] font-bold text-[#061D36]">
                                    {formatDateTime(activationExpiresAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-7 grid grid-cols-2 gap-4">
                    {!isActivationDeviceType ? (
                        <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            รหัสอุปกรณ์
                        </label>
                        <input
                            value={form.deviceCode}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    deviceCode: event.target.value,
                                }))
                            }
                            placeholder="PRN001"
                            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        />
                    </div>
                    ) : null}

                    <div className={isActivationDeviceType ? "col-span-2" : ""}>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            ชื่ออุปกรณ์
                        </label>
                        <input
                            value={form.deviceName}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    deviceName: event.target.value,
                                }))
                            }
                            placeholder="Printer Counter 1"
                            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        />
                    </div>

                    <div className={isActivationDeviceType ? "col-span-2" : ""}>
                            <label className="mb-2 block text-[13px] text-[#6B7280]">
                                ประเภทอุปกรณ์
                            </label>
                            <select
                                value={form.deviceType}
                                onChange={(event) =>
                                    handleDeviceTypeChange(event.target.value)
                                }
                                className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                            >
                                <option value="">เลือกประเภท</option>

                                {deviceTypes.map((item) => (
                                    <option key={item.code} value={item.code}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                    {isActivationDeviceType ? (
                    <>
                        <div className="col-span-2">
                            <label className="mb-2 block text-[13px] text-[#6B7280]">
                                Location
                            </label>
                            <input
                                value={form.location ?? ""}
                                onChange={(event) =>
                                    onChange((prev) => ({
                                        ...prev,
                                        location: event.target.value,
                                    }))
                                }
                                placeholder="Zone A"
                                className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                            />
                        </div>

                        {mode === "edit" ? (
                        <div className="col-span-2 grid grid-cols-2 gap-3">
                            <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                                <p className="text-[12px] text-[#64748B]">
                                    Device ID
                                </p>
                                <p className="mt-1 text-[14px] font-bold text-[#061D36]">
                                    {form.deviceId ?? "รอ Activate"}
                                </p>
                            </div>

                            <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                                <p className="text-[12px] text-[#64748B]">
                                    สถานะ
                                </p>
                                <p className={`mt-1 text-[14px] font-bold ${statusClassName}`}>
                                    {statusLabel}
                                </p>
                            </div>

                            {form.activationCode ? (
                            <div className="col-span-2 rounded-[10px] border border-[#FEF3C7] bg-[#FFFBEB] p-3">
                                <p className="text-[12px] text-[#92400E]">
                                    Activation Code
                                </p>
                                <p className="mt-1 text-[24px] font-black tracking-[4px] text-[#061D36]">
                                    {form.activationCode}
                                </p>
                                {form.expiresAt ? (
                                <p className="mt-2 text-[13px] font-bold text-[#92400E]">
                                    Expires At: {formatDateTime(form.expiresAt)}
                                </p>
                                ) : null}
                            </div>
                            ) : null}
                        </div>
                        ) : null}
                    </>
                    ) : (
                    <>
                        <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            รูปแบบการเชื่อมต่อ
                        </label>
                        <select
                            value={form.connectionType}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    connectionType: event.target.value,
                                }))
                            }
                            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        >
                            <option value="">เลือกรูปแบบ</option>
                            {connectionTypes.map((item) => (
                                <option
                                    key={item.code}
                                    value={item.code}
                                >
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                                    <label className="mb-2 block text-[13px] text-[#6B7280]">
                                        IP ADDRESS
                                    </label>
                                    <input
                                        value={form.ipAddress ?? ""}
                                        onChange={(event) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                ipAddress:
                                                    event.target.value || null,
                                            }))
                                        }
                                        placeholder="192.168.x.x"
                                        className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            สถานะ
                        </label>
                        <select
                            value={form.status}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    status: event.target.value as DevicePayload["status"],
                                }))
                            }
                            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <label className="col-span-2 flex h-11 items-center gap-3 rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] text-[#061D36]">
                        <input
                            type="checkbox"
                            checked={form.isOnline}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    isOnline: event.target.checked,
                                }))
                            }
                            className="h-4 w-4"
                        />
                        เชื่อมต่อปกติ
                    </label>

                    <div className="col-span-2">
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            หมายเหตุ
                        </label>
                        <textarea
                            value={form.note}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    note: event.target.value,
                                }))
                            }
                            placeholder="Counter receipt printer"
                            className="min-h-[84px] w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 py-3 text-[14px] outline-none"
                        />
                    </div>
                    </>
                    )}
                </div>
                )}

                <div className="mt-9 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 min-w-[110px] rounded-full bg-[#9CA3AF] px-6 text-[14px] font-bold text-white"
                    >
                        {activationCode ? "ปิด" : "ยกเลิก"}
                    </button>

                    {!activationCode ? (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitting}
                        className="h-11 min-w-[110px] rounded-full bg-[#061D36] px-6 text-[14px] font-bold text-white disabled:opacity-60"
                    >
                        {submitting
                            ? "กำลังบันทึก..."
                            : isActivationCreateFlow
                                ? "สร้าง Code"
                                : "ตกลง"}
                    </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default DeviceModal;
