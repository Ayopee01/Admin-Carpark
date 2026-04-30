"use client";

import type { Dispatch, SetStateAction } from "react";
import { LuCheck, LuCopy, LuX } from "react-icons/lu";
import type {
    DeviceMasterItem,
    DevicePayload,
} from "@/src/app/type/device/device";

const KIOSK_DEVICE_TYPE = "kiosk";

export type KioskActivationResult = {
    message: string;
    code: string;
    deviceId: string;
    expiresIn: string;
};

type Props = {
    open: boolean;
    mode: "create" | "edit";
    form: DevicePayload;
    deviceTypes: DeviceMasterItem[];
    connectionTypes: DeviceMasterItem[];
    submitting: boolean;
    kioskActivationResult?: KioskActivationResult | null;
    onClose: () => void;
    onChange: Dispatch<SetStateAction<DevicePayload>>;
    onSubmit: () => void;
};

function DeviceModal({
    open,
    mode,
    form,
    deviceTypes,
    connectionTypes,
    submitting,
    kioskActivationResult,
    onClose,
    onChange,
    onSubmit,
}: Props) {
    if (!open) return null;

    const isKiosk = form.deviceType?.toLowerCase() === KIOSK_DEVICE_TYPE;
    const hasKioskResult = isKiosk && kioskActivationResult;

    const hasKioskType = deviceTypes.some(
        (item) => item.code.toLowerCase() === KIOSK_DEVICE_TYPE
    );

    const displayDeviceTypes = hasKioskType
        ? deviceTypes
        : [
            {
                code: KIOSK_DEVICE_TYPE,
                label: "ตู้ Kiosk",
            },
            ...deviceTypes,
        ];

    const handleDeviceTypeChange = (value: string) => {
        const nextIsKiosk = value.toLowerCase() === KIOSK_DEVICE_TYPE;

        onChange((prev) => ({
            ...prev,
            deviceType: value,
            ipAddress: nextIsKiosk ? null : prev.ipAddress,
            connectionType: nextIsKiosk ? "" : prev.connectionType,
            location: nextIsKiosk ? prev.location ?? "" : prev.location,
        }));
    };

    const handleCopyCode = async () => {
        if (!kioskActivationResult?.code) return;

        await navigator.clipboard.writeText(kioskActivationResult.code);
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
                    {isKiosk
                        ? "กรอกข้อมูลตู้ Kiosk เพื่อสร้าง Activation Code"
                        : "กรอกข้อมูลเพื่อตั้งค่าอุปกรณ์ใหม่เข้าสู่ระบบ"}
                </p>

                {hasKioskResult ? (
                    <div className="mt-7 rounded-[14px] border border-[#BBF7D0] bg-[#F0FDF4] p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                                <LuCheck size={22} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-[18px] font-bold text-[#166534]">
                                    สร้าง Activation Code สำเร็จ
                                </p>

                                <p className="mt-1 text-[13px] text-[#15803D]">
                                    {kioskActivationResult.message}
                                </p>

                                <div className="mt-5 rounded-[12px] bg-white p-4">
                                    <p className="text-[12px] font-medium text-[#64748B]">
                                        Activation Code
                                    </p>

                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <p className="text-[36px] font-black leading-none tracking-[6px] text-[#061D36]">
                                            {kioskActivationResult.code}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#061D36] text-white transition hover:bg-[#0B2A4A]"
                                            title="คัดลอก Code"
                                        >
                                            <LuCopy size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-[10px] bg-white p-3">
                                        <p className="text-[12px] text-[#64748B]">
                                            Device ID
                                        </p>
                                        <p className="mt-1 text-[14px] font-bold text-[#061D36]">
                                            {kioskActivationResult.deviceId}
                                        </p>
                                    </div>

                                    <div className="rounded-[10px] bg-white p-3">
                                        <p className="text-[12px] text-[#64748B]">
                                            หมดอายุใน
                                        </p>
                                        <p className="mt-1 text-[14px] font-bold text-[#061D36]">
                                            {kioskActivationResult.expiresIn}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {!hasKioskResult ? (
                    <div className="mt-7 grid grid-cols-2 gap-4">
                        {!isKiosk ? (
                            <div className="col-span-2">
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
                                    placeholder="ระบุชื่ออุปกรณ์ เช่น Printer A"
                                    className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                                />
                            </div>
                        ) : null}

                        <div className={isKiosk ? "col-span-2" : ""}>
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

                                {displayDeviceTypes.map((item) => (
                                    <option key={item.code} value={item.code}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isKiosk ? (
                            <>
                                <div className="col-span-2">
                                    <label className="mb-2 block text-[13px] text-[#6B7280]">
                                        Name
                                    </label>
                                    <input
                                        value={form.deviceName}
                                        onChange={(event) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                deviceName: event.target.value,
                                            }))
                                        }
                                        placeholder="ระบุชื่อ เช่น Kiosk ทางเข้าอาคาร"
                                        className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                                    />
                                </div>

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
                                        placeholder="ระบุตำแหน่ง เช่น ชั้น 1 หน้า Lobby"
                                        className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
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

                                <div className="col-span-2">
                                    <label className="mb-2 block text-[13px] text-[#6B7280]">
                                        รูปแบบการเชื่อมต่อ
                                    </label>
                                    <select
                                        value={form.connectionType}
                                        onChange={(event) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                connectionType:
                                                    event.target.value,
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
                            </>
                        )}
                    </div>
                ) : null}

                <div className="mt-9 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 min-w-[110px] rounded-full bg-[#9CA3AF] px-6 text-[14px] font-bold text-white"
                    >
                        {hasKioskResult ? "ปิด" : "ยกเลิก"}
                    </button>

                    {!hasKioskResult ? (
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={submitting}
                            className="h-11 min-w-[110px] rounded-full bg-[#061D36] px-6 text-[14px] font-bold text-white disabled:opacity-60"
                        >
                            {submitting
                                ? "กำลังบันทึก..."
                                : isKiosk
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