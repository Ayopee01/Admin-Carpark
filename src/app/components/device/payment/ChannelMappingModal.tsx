"use client";

import type { ReactNode } from "react";
import { LuBuilding2, LuCreditCard, LuQrCode, LuUser, LuWallet, LuX, LuPlus } from "react-icons/lu";
import type { PaymentMethod, ServiceChannel } from "@/src/app/type/device/payment";

type Props = {
    open: boolean;
    channel: ServiceChannel | null;
    methods: PaymentMethod[];
    selectedMethods: string[];
    submitting: boolean;
    onClose: () => void;
    onToggle: (methodId: string) => void;
    onSubmit: () => void;
};

function getMethodIcon(icon: string): ReactNode {
    switch (icon) {
        case "cash":
            return <LuUser size={15} />;
        case "bank":
            return <LuBuilding2 size={15} />;
        case "qr":
            return <LuQrCode size={15} />;
        case "wallet":
            return <LuWallet size={15} />;
        default:
            return <LuCreditCard size={15} />;
    }
}

function ChannelMappingModal({
    open,
    channel,
    methods,
    selectedMethods,
    submitting,
    onClose,
    onToggle,
    onSubmit,
}: Props) {
    if (!open || !channel) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#111827]/80 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-[410px] overflow-hidden rounded-[14px] bg-white shadow-2xl">
                <div className="px-7 py-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 text-[#061D36]"
                    >
                        <LuX size={20} />
                    </button>

                    <h2 className="text-[18px] font-extrabold leading-tight text-[#061D36]">
                        ช่องทางบริการ ({channel.name})
                    </h2>
                    <p className="mt-1 text-[12px] text-[#667085]">
                        กำหนดช่องทางบริการ
                    </p>
                </div>

                <div className="px-7 pb-7">
                    <p className="mb-3 text-[12px] font-semibold text-[#475467]">
                        การชำระเงินทั้งหมด
                    </p>

                    <div className="space-y-2">
                        {methods.map((method) => (
                            <label
                                key={method.id}
                                className="flex min-h-[40px] cursor-pointer items-center justify-between rounded-md bg-[#D9DDE1] px-3 text-[13px] font-semibold text-[#1F2937]"
                            >
                                <span className="flex items-center gap-3">
                                    {getMethodIcon(method.icon)}
                                    {method.label}
                                </span>

                                <input
                                    type="checkbox"
                                    checked={selectedMethods.includes(method.id)}
                                    onChange={() => onToggle(method.id)}
                                    className="h-4 w-4 accent-[#061D36]"
                                />
                            </label>
                        ))}

                        <button
                            type="button"
                            className="flex min-h-[40px] w-full items-center gap-3 rounded-md bg-[#D9DDE1] px-3 text-left text-[13px] font-semibold text-[#1F2937] transition hover:bg-[#CDD2D8]"
                        >
                            <LuPlus size={15} />
                            เพิ่มวิธีการชำระเงิน
                        </button>
                    </div>

                    <div className="mt-7 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 min-w-[104px] rounded-full bg-[#9CA3AF] px-6 text-[13px] font-bold text-white"
                        >
                            ยกเลิก
                        </button>

                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={submitting}
                            className="h-10 min-w-[104px] rounded-full bg-[#061D36] px-6 text-[13px] font-bold text-white disabled:opacity-60"
                        >
                            ตกลง
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChannelMappingModal;