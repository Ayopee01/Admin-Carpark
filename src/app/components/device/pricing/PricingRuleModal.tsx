"use client";

import { LuX } from "react-icons/lu";
import type {
    MasterDataItem,
    PricingRulePayload,
} from "@/src/app/type/device/pricing";

type Props = {
    open: boolean;
    mode: "create" | "edit";
    form: PricingRulePayload;
    serviceTypes: MasterDataItem[];
    vehicleTypes: MasterDataItem[];
    submitting: boolean;
    onClose: () => void;
    onChange: React.Dispatch<React.SetStateAction<PricingRulePayload>>;
    onSubmit: () => void;
};

function PricingRuleModal({
    open,
    mode,
    form,
    serviceTypes,
    vehicleTypes,
    submitting,
    onClose,
    onChange,
    onSubmit,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#26313C]/75 px-4 py-6 backdrop-blur-sm">
            <div className="relative max-h-[calc(100dvh-48px)] w-full max-w-[520px] overflow-y-auto rounded-[14px] bg-white p-5 shadow-2xl sm:p-8">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-6 top-6 text-[#061D36]"
                >
                    <LuX size={22} />
                </button>

                <h2 className="text-[24px] font-bold text-[#061D36]">
                    {mode === "create" ? "เพิ่มเงื่อนไขราคา" : "แก้ไขเงื่อนไขราคา"}
                </h2>
                <p className="mt-1 text-[14px] text-[#6B7280]">
                    กำหนดเงื่อนไขราคาแยกตามจำนวนชั่วโมง
                </p>

                <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="text-[13px] font-semibold text-[#1F2937] sm:col-span-2">
                        เลือกประเภท
                    </label>

                    <select
                        value={form.feeType}
                        onChange={(event) =>
                            onChange((prev) => ({
                                ...prev,
                                feeType: event.target.value as PricingRulePayload["feeType"],
                            }))
                        }
                        className="h-11 rounded-md border border-[#E5E7EB] px-4 text-[14px] outline-none sm:col-span-2"
                    >
                        {serviceTypes.map((item) => (
                            <option key={item.code} value={item.code}>
                                {item.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={form.vehicleType ?? "car"}
                        onChange={(event) =>
                            onChange((prev) => ({
                                ...prev,
                                vehicleType: event.target.value as PricingRulePayload["vehicleType"],
                            }))
                        }
                        className="h-11 rounded-md border border-[#E5E7EB] px-4 text-[14px] outline-none sm:col-span-2"
                    >
                        {vehicleTypes.map((item) => (
                            <option key={item.code} value={item.code}>
                                {item.label}
                            </option>
                        ))}
                    </select>

                    <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            ชั่วโมงเริ่มต้น
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={form.hourStart ?? 1}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    hourStart: Number(event.target.value),
                                }))
                            }
                            className="h-11 w-full rounded-md border border-[#E5E7EB] px-4 outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            ถึงชั่วโมง
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={form.hourEnd ?? ""}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    hourEnd: Number(event.target.value),
                                }))
                            }
                            className="h-11 w-full rounded-md border border-[#E5E7EB] px-4 outline-none"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            ราคา (บาท)
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={form.price}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    price: Number(event.target.value),
                                }))
                            }
                            className="h-11 w-full rounded-md border border-[#E5E7EB] px-4 outline-none"
                        />
                    </div>
                </div>

                <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
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

export default PricingRuleModal;
