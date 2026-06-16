"use client";

import { LuCheck, LuPencil, LuWalletCards, LuX } from "react-icons/lu";
import type { TransactionItem } from "@/src/app/type/check-payment/transactions";

type Props = {
  item: TransactionItem;
  isEditing: boolean;
  isSaving: boolean;
  onPay: (id: string) => void;
  onStartEdit: (item: TransactionItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
};

function TransactionActions({
  item,
  isEditing,
  isSaving,
  onPay,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: Props) {
  const canPay = item.status === "pending" || item.status === "partially_paid";

  if (isEditing) {
    return (
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onSaveEdit(item.id)}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full border border-[#59D46B] px-4 py-2 text-[13px] font-semibold text-[#34B44C] transition hover:bg-[#EDFFF0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LuCheck size={16} />
          {isSaving ? "กำลังบันทึก..." : "บันทึก"}
        </button>

        <button
          type="button"
          onClick={onCancelEdit}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full border border-[#D0D5DD] px-4 py-2 text-[13px] font-semibold text-[#667085] transition hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LuX size={16} />
          ยกเลิก
        </button>
      </div>
    );
  }

  if (canPay) {
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
