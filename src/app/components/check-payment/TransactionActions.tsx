"use client";

import { LuCheck, LuPencil, LuWalletCards } from "react-icons/lu";
import type { TransactionItem } from "@/src/app/type/check-payment/transactions";

type Props = {
    item: TransactionItem;
    isEditing: boolean;
    onPay: (id: string) => void;
    onStartEdit: (item: TransactionItem) => void;
    onCancelEdit: () => void;
};

function TransactionActions({
    item,
    isEditing,
    onPay,
    onStartEdit,
    onCancelEdit,
}: Props) {
    if (isEditing) {
        return (
            <div className="flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancelEdit}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#59D46B] text-[#34B44C] transition hover:bg-[#EDFFF0]"
                    aria-label="ยกเลิกการแก้ไข"
                >
                    <LuCheck size={18} />
                </button>
            </div>
        );
    }

    if (item.payment.status === "unpaid") {
        return (
            <div className="flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={() => onPay(item.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#1D2A36] px-4 py-2 text-[13px] font-semibold text-[#1D2A36] transition hover:bg-[#1D2A36] hover:text-white"
                >
                    <LuWalletCards size={16} />
                    ชำระค่าบริการ
                </button>

                <button
                    type="button"
                    onClick={() => onStartEdit(item)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#F04A3A] px-4 py-2 text-[13px] font-semibold text-[#F04A3A] transition hover:bg-[#FFF1EF]"
                >
                    <LuPencil size={16} />
                    แก้ไข
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-end gap-3">
            <button
                type="button"
                onClick={() => onStartEdit(item)}
                className="inline-flex items-center gap-2 rounded-full border border-[#F04A3A] px-4 py-2 text-[13px] font-semibold text-[#F04A3A] transition hover:bg-[#FFF1EF]"
            >
                <LuPencil size={16} />
                แก้ไข
            </button>
        </div>
    );
}

export default TransactionActions;