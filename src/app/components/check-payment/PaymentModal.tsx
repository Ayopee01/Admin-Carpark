"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { LuBanknote, LuQrCode, LuX } from "react-icons/lu";

type TransactionDetailResponse = {
    id: string;
    billNo: string;
    plateNo: string;
    durationMinute: number;
    netAmount: number;
    payment: {
        status: "paid" | "unpaid";
        method: string | null;
        qrCodeText: string | null;
        qrCodeImageUrl: string | null;
    };
    receiptPreview?: {
        printableText: string | null;
        canPrint: boolean;
    };
};

type PaymentMode = "qr" | "cash";

type Props = {
    open: boolean;
    transactionId: string | null;
    onClose: () => void;
    onSuccess: () => void;
};

function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) return `${hours} ชม. ${mins} นาที`;
    if (hours > 0) return `${hours} ชม.`;
    return `${mins} นาที`;
}

function PaymentModal({ open, transactionId, onClose, onSuccess }: Props) {
    const [detail, setDetail] = useState<TransactionDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<PaymentMode>("qr");
    const [printReceipt, setPrintReceipt] = useState(true);
    const [cashReceived, setCashReceived] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !transactionId) return;

        let ignore = false;

        async function fetchDetail() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                const res = await fetch(`/api/check-payment/transactions/${transactionId}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    cache: "no-store",
                });

                const json = await res.json().catch(() => null);

                if (!res.ok || !json) {
                    throw new Error("ไม่สามารถโหลดรายละเอียดรายการได้");
                }

                if (!ignore) {
                    setDetail(json);
                    setMode(json.payment?.method === "cash" ? "cash" : "qr");
                    setCashReceived(String(json.netAmount ?? 0));
                }
            } catch (err) {
                if (!ignore) {
                    setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchDetail();

        return () => {
            ignore = true;
        };
    }, [open, transactionId]);

    const receivedAmount = Number(cashReceived || 0);
    const changeAmount = useMemo(() => {
        if (!detail) return 0;
        return receivedAmount > detail.netAmount ? receivedAmount - detail.netAmount : 0;
    }, [receivedAmount, detail]);

    async function handleConfirmPayment() {
        if (!detail) return;

        try {
            setSubmitting(true);
            setError("");

            const token = localStorage.getItem("token");

            const headers = {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };

            if (mode === "qr") {
                await fetch(`/api/check-payment/transactions_payment/${detail.id}/payment`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        method: "qr",
                        printReceipt,
                    }),
                });
            } else {
                if (receivedAmount < detail.netAmount) {
                    throw new Error("จำนวนเงินรับน้อยกว่ายอดชำระ");
                }

                await fetch(`/api/check-payment/transactions_payment/${detail.id}/payment`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        method: "cash",
                        receivedAmount,
                        printReceipt,
                    }),
                });
            }

            await fetch(`/api/check-payment/transactions_status/${detail.id}/status`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({
                    status: "completed",
                }),
            });

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "ไม่สามารถยืนยันการชำระเงินได้");
        } finally {
            setSubmitting(false);
        }
    }

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-[#2E3445]/85 px-4 py-6 backdrop-blur-[2px]"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[1100px] rounded-[32px] bg-white p-5 shadow-2xl md:p-8"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-6 top-6 text-[#1F2933] transition hover:opacity-70"
                    aria-label="ปิด"
                >
                    <LuX size={24} />
                </button>

                {loading ? (
                    <div className="py-20 text-center text-[#64748B]">กำลังโหลดข้อมูล...</div>
                ) : error && !detail ? (
                    <div className="py-20 text-center text-red-600">{error}</div>
                ) : detail ? (
                    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                        <div className="rounded-[20px] bg-[#F5F6F7] p-6">
                            <h2 className="text-[34px] font-extrabold leading-none text-[#101C2B]">
                                ทำรายการชำระเงิน
                            </h2>
                            <p className="mt-3 text-[14px] text-[#7A8795]">
                                ตรวจสอบความถูกต้องก่อนชำระ
                            </p>

                            <div className="mt-8 space-y-5">
                                <div className="flex items-center justify-between border-b border-[#E3E7EB] pb-3">
                                    <span className="text-[14px] text-[#8A95A3]">เลขทะเบียน</span>
                                    <span className="text-[18px] font-bold text-[#1F2933]">
                                        {detail.plateNo}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#E3E7EB] pb-3">
                                    <span className="text-[14px] text-[#8A95A3]">เวลาที่จอด</span>
                                    <span className="text-[18px] font-bold text-[#1F2933]">
                                        {formatDuration(detail.durationMinute)}
                                    </span>
                                </div>

                                <div className="pt-3">
                                    <div className="text-[14px] text-[#8A95A3]">ยอดรวมทั้งหมด</div>
                                    <div className="mt-2 flex items-end gap-2">
                                        <span className="text-[54px] font-extrabold leading-none text-[#101C2B]">
                                            {detail.netAmount.toFixed(2)}
                                        </span>
                                        <span className="pb-2 text-[22px] font-bold text-[#101C2B]">฿</span>
                                    </div>
                                </div>
                            </div>

                            <label className="mt-12 inline-flex cursor-pointer items-center gap-3 text-[14px] font-semibold text-[#1F2933]">
                                <input
                                    type="checkbox"
                                    checked={printReceipt}
                                    onChange={() => setPrintReceipt((prev) => !prev)}
                                    className="h-4 w-4 rounded border-[#CBD5E1]"
                                />
                                พิมพ์ใบเสร็จ (PrintReceipt)
                            </label>
                        </div>

                        <div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setMode("qr")}
                                    className={`flex min-h-[92px] flex-col items-center justify-center rounded-2xl border px-4 py-4 transition ${mode === "qr"
                                        ? "border-[#8CC2FF] bg-[#EEF5FD]"
                                        : "border-transparent bg-[#EFF1F3]"
                                        }`}
                                >
                                    <div className="mb-2 flex h-10 w-20 items-center justify-center rounded-lg bg-white text-[#1D2A36]">
                                        <LuQrCode size={22} />
                                    </div>
                                    <span className="text-[14px] font-bold text-[#1F2933]">สแกนจ่าย</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMode("cash")}
                                    className={`flex min-h-[92px] flex-col items-center justify-center rounded-2xl border px-4 py-4 transition ${mode === "cash"
                                        ? "border-[#8CC2FF] bg-[#EEF5FD]"
                                        : "border-transparent bg-[#EFF1F3]"
                                        }`}
                                >
                                    <div className="mb-2 flex h-10 w-20 items-center justify-center rounded-lg bg-white text-[#1D2A36]">
                                        <LuBanknote size={22} />
                                    </div>
                                    <span className="text-[14px] font-bold text-[#1F2933]">เงินสด</span>
                                </button>
                            </div>

                            {mode === "qr" ? (
                                <div className="mt-4 rounded-[22px] bg-[#EEF3F9] px-6 py-8 text-center">
                                    <div className="mx-auto flex min-h-[300px] max-w-[520px] items-center justify-center">
                                        {detail.payment.qrCodeImageUrl ? (
                                            <div>
                                                <Image
                                                    src={detail.payment.qrCodeImageUrl}
                                                    alt="QR Code"
                                                    width={220}
                                                    height={220}
                                                    className="mx-auto h-[220px] w-[220px]"
                                                    unoptimized
                                                />
                                                <p className="mt-6 text-[16px] text-[#374151]">
                                                    สแกน QR Code เพื่อชำระเงิน
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-[#64748B]">ยังไม่มี QR Code สำหรับรายการนี้</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <label className="mb-2 block text-[14px] font-semibold text-[#66707D]">
                                        จำนวนเงินที่ได้รับ
                                    </label>

                                    <div className="flex min-h-[72px] items-center rounded-2xl bg-[#F3F5F7] px-6">
                                        <input
                                            type="number"
                                            min={0}
                                            value={cashReceived}
                                            onChange={(event) => setCashReceived(event.target.value)}
                                            className="w-full bg-transparent text-right text-[40px] font-extrabold text-[#1F2933] outline-none"
                                        />
                                        <span className="ml-3 text-[22px] font-bold text-[#94A3B8]">฿</span>
                                    </div>

                                    <div className="mt-5 rounded-[22px] bg-[#EEF3F9] px-6 py-8">
                                        <div className="text-[14px] font-semibold text-[#66707D]">
                                            จำนวนเงินที่ต้องทอน
                                        </div>
                                        <div className="mt-4 flex items-end justify-end gap-2">
                                            <span className="text-[48px] font-extrabold leading-none text-[#101C2B]">
                                                {changeAmount.toFixed(2)}
                                            </span>
                                            <span className="pb-2 text-[22px] font-bold text-[#101C2B]">฿</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error ? (
                                <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
                            ) : null}

                            <button
                                type="button"
                                onClick={handleConfirmPayment}
                                disabled={submitting}
                                className="mt-6 inline-flex min-h-[72px] w-full items-center justify-center rounded-[18px] bg-[#061D36] px-6 text-[22px] font-bold text-white shadow-[0_12px_30px_rgba(6,29,54,0.18)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน"}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-5 w-full text-center text-[15px] font-semibold text-[#A3AFBC]"
                            >
                                ยกเลิกรายการ
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default PaymentModal;