"use client";

import TransactionRow from "@/src/app/components/check-payment/TransactionRow";
import type {
  TransactionEditDraft,
  TransactionItem,
} from "@/src/app/type/check-payment/transactions";

type Props = {
  items: TransactionItem[];
  editingId: string | null;
  savingEditId: string | null;
  draft: TransactionEditDraft | null;
  onChangeDraft: (field: keyof TransactionEditDraft, value: string) => void;
  onPay: (id: string) => void;
  onStartEdit: (item: TransactionItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
};

function TransactionsTable({
  items,
  editingId,
  savingEditId,
  draft,
  onChangeDraft,
  onPay,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1100px] w-full">
        <thead className="border-b border-[#D9DCE2] bg-[#031C36] text-left text-[14px] font-semibold text-white">
          <tr>
            <th className="px-6 py-5">ID - NUMBER</th>
            <th className="px-6 py-5">ทะเบียน</th>
            <th className="px-6 py-5">เวลาที่ใช้บริการ</th>
            <th className="px-6 py-5">ค่าบริการ</th>
            <th className="px-6 py-5">สถานะ</th>
            <th className="px-6 py-5 text-right">ดำเนินการ</th>
          </tr>
        </thead>

        <tbody className="bg-[#F5F5F5]">
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-10 text-center text-[15px] text-[#6B7280]"
              >
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <TransactionRow
                key={item.id}
                item={item}
                onPay={onPay}
                isEditing={editingId === item.id}
                isSaving={savingEditId === item.id}
                draft={editingId === item.id ? draft : null}
                onChangeDraft={onChangeDraft}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsTable;