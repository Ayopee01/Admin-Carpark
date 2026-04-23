"use client";

import type { TransactionPaymentStatus } from "@/src/app/type/check-payment/transactions";

type Props = {
    status: TransactionPaymentStatus;
};

function TransactionStatusBadge({ status }: Props) {
    const isPaid = status === "paid";

    return (
        <span
            className={`inline-flex min-w-[92px] items-center justify-center rounded-full border px-4 py-1 text-[13px] font-semibold ${isPaid
                    ? "border-[#59D46B] bg-[#EDFFF0] text-[#34B44C]"
                    : "border-[#F1C44A] bg-[#FFF8E3] text-[#E2B126]"
                }`}
        >
            {isPaid ? "เสร็จสิ้น" : "รอชำระ"}
        </span>
    );
}

export default TransactionStatusBadge;