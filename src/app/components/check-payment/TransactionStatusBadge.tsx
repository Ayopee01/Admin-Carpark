"use client";

import type { TransactionStatus } from "@/src/app/type/check-payment/transactions";

type Props = {
  status: TransactionStatus;
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "ยังไม่จ่าย",
    className: "border-[#F1C44A] bg-[#FFF8E3] text-[#E2B126]",
  },
  partially_paid: {
    label: "จ่ายบางส่วน",
    className: "border-[#F59E0B] bg-[#FFF7ED] text-[#D97706]",
  },
  paid_waiting_exit: {
    label: "จ่ายครบ รอรถออก",
    className: "border-[#38BDF8] bg-[#EFF6FF] text-[#0284C7]",
  },
  completed: {
    label: "รถออกแล้ว",
    className: "border-[#59D46B] bg-[#EDFFF0] text-[#34B44C]",
  },
  cancelled: {
    label: "ยกเลิก",
    className: "border-[#F87171] bg-[#FEF2F2] text-[#DC2626]",
  },
};

function TransactionStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "border-[#D0D5DD] bg-[#F8F9FA] text-[#667085]",
  };

  return (
    <span
      className={`inline-flex min-w-[92px] items-center justify-center rounded-full border px-4 py-1 text-[13px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default TransactionStatusBadge;
