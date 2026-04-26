"use client";

import { LuX } from "react-icons/lu";
import type {
    DeviceMasterItem,
    DevicePayload,
} from "@/src/app/type/device/device";

type Props = {
    open: boolean;
    mode: "create" | "edit";
    form: DevicePayload;
    deviceTypes: DeviceMasterItem[];
    connectionTypes: DeviceMasterItem[];
    submitting: boolean;
    onClose: () => void;
    onChange: React.Dispatch<React.SetStateAction<DevicePayload>>;
    onSubmit: () => void;
};

function DeviceModal({
    open,
    mode,
    form,
    deviceTypes,
    connectionTypes,
    submitting,
    onClose,
    onChange,
    onSubmit,
}: Props) {
    if (!open) return null;

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
                    กรอกข้อมูลเพื่อตั้งค่าอุปกรณ์ใหม่เข้าสู่ระบบ
                </p>

                <div className="mt-7 grid grid-cols-2 gap-4">
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

                    <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            ประเภทอุปกรณ์
                        </label>
                        <select
                            value={form.deviceType}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    deviceType: event.target.value,
                                }))
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

                    <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            IP ADDRESS
                        </label>
                        <input
                            value={form.ipAddress ?? ""}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    ipAddress: event.target.value || null,
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
                                    connectionType: event.target.value,
                                }))
                            }
                            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        >
                            <option value="">เลือกรูปแบบ</option>
                            {connectionTypes.map((item) => (
                                <option key={item.code} value={item.code}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-9 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 min-w-[110px] rounded-full bg-[#9CA3AF] px-6 text-[14px] font-bold text-white"
                    >
                        ยกเลิก
                    </button>

                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitting}
                        className="h-11 min-w-[110px] rounded-full bg-[#061D36] px-6 text-[14px] font-bold text-white disabled:opacity-60"
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeviceModal;