"use client";

import TransactionStatusBadge from "@/src/app/components/check-payment/TransactionStatusBadge";
import TransactionActions from "@/src/app/components/check-payment/TransactionActions";
import type { TransactionEditDraft, TransactionItem } from "@/src/app/type/check-payment/transactions";

type Props = {
    item: TransactionItem;
    isEditing: boolean;
    draft: TransactionEditDraft | null;
    onChangeDraft: (field: keyof TransactionEditDraft, value: string) => void;
    onPay: (id: string) => void;
    onStartEdit: (item: TransactionItem) => void;
    onCancelEdit: () => void;
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
    return `฿${value}`;
}

function TransactionRow({
    item,
    isEditing,
    draft,
    onChangeDraft,
    onPay,
    onStartEdit,
    onCancelEdit,
}: Props) {
    return (
        <tr className="border-b border-[#E2E5EA] text-[14px] text-[#1F2933]">
            <td className="px-6 py-6">{item.billNo}</td>

            <td className="px-6 py-6">
                {isEditing && draft ? (
                    <input
                        value={draft.plateNo}
                        onChange={(event) => onChangeDraft("plateNo", event.target.value)}
                        className="h-10 w-[120px] rounded-md bg-[#ECECEC] px-3 outline-none"
                    />
                ) : (
                    item.plateNo
                )}
            </td>

            <td className="px-6 py-6">{formatDateTime(item.entryAt)}</td>

            <td className="px-6 py-6">{formatCurrency(item.netAmount)}</td>

            <td className="px-6 py-6">
                <TransactionStatusBadge status={item.payment.status} />
            </td>

            <td className="px-6 py-6">
                <TransactionActions
                    item={item}
                    isEditing={isEditing}
                    onPay={onPay}
                    onStartEdit={onStartEdit}
                    onCancelEdit={onCancelEdit}
                />
            </td>
        </tr>
    );
}

export default TransactionRow;