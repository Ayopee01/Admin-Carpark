"use client";

import TransactionStatusBadge from "@/src/app/components/check-payment/TransactionStatusBadge";
import TransactionActions from "@/src/app/components/check-payment/TransactionActions";
import type {
  TransactionEditDraft,
  TransactionItem,
} from "@/src/app/type/check-payment/transactions";

type Props = {
  item: TransactionItem;
  isEditing: boolean;
  isSaving: boolean;
  draft: TransactionEditDraft | null;
  onChangeDraft: (field: keyof TransactionEditDraft, value: string) => void;
  onPay: (id: string) => void;
  onStartEdit: (item: TransactionItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value: number) {
  return `฿${new Intl.NumberFormat("en-US").format(value)}`;
}

function TransactionRow({
  item,
  isEditing,
  isSaving,
  draft,
  onChangeDraft,
  onPay,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: Props) {
  const paymentStatus = item.payment?.status ?? "unpaid";

  return (
    <tr className="border-b border-[#E2E5EA] text-[14px] text-[#1F2933]">
      <td className="px-6 py-6">{item.billNo}</td>

      <td className="px-6 py-6">
        {isEditing && draft ? (
          <input
            value={draft.plateNo}
            onChange={(event) => onChangeDraft("plateNo", event.target.value)}
            className="h-10 w-[140px] rounded-md bg-[#ECECEC] px-3 outline-none"
          />
        ) : (
          item.plateNo
        )}
      </td>

      <td className="px-6 py-6">{formatDateTime(item.entryAt)}</td>
      <td className="px-6 py-6">{formatCurrency(item.netAmount)}</td>

      <td className="px-6 py-6">
        <TransactionStatusBadge status={paymentStatus} />
      </td>

      <td className="px-6 py-6">
        <TransactionActions
          item={item}
          isEditing={isEditing}
          isSaving={isSaving}
          onPay={onPay}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
        />
      </td>
    </tr>
  );
}

export default TransactionRow;