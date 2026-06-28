"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { LuBanknote, LuQrCode, LuX } from "react-icons/lu";
import type {
  AdminPaymentResponse,
  PaymentRequest,
  TransactionDetail,
} from "@/src/app/type/check-payment/transactions";
import type {
  PaymentMethodsResponse,
  ServiceChannelsResponse,
} from "@/src/app/type/device/payment";

type TransactionDetailResponse = {
  id: string;
  billNo: string;
  plateNo: string;
  durationDisplay: string;
  baseAmount: number;
  netAmount: number;
  paidAmount: number;
  remainingAmount: number;
  discountAmount: number;
  payment: {
    method: string | null;
    qrCodeText: string | null;
    qrCodeImageUrl: string | null;
  };
  receiptPreview?: {
    printableText: string | null;
    canPrint: boolean;
  };
};

type RawTransactionDetailResponse = TransactionDetail;

type PaymentMode = "qr" | "cash";

type Props = {
  open: boolean;
  transactionId: string | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

function formatCurrency(value: number) {
  return value.toFixed(2);
}

function resolvePaymentMode(value?: string | null): PaymentMode | null {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) return null;
  if (normalized === "cash" || normalized.includes("เงินสด")) return "cash";
  if (normalized === "qr" || normalized.includes("qr") || normalized.includes("คิวอาร์")) return "qr";

  return null;
}

function getMethodMode(method: { id: string; label: string; icon?: string; method?: string; action?: string }) {
  return (
    resolvePaymentMode(method.method) ??
    resolvePaymentMode(method.action) ??
    resolvePaymentMode(method.icon) ??
    resolvePaymentMode(method.id) ??
    resolvePaymentMode(method.label)
  );
}

function getAvailablePaymentModes(
  methods: PaymentMethodsResponse | null,
  channels: ServiceChannelsResponse | null
) {
  const activeMethods = methods?.data?.filter((method) => method.isActive) ?? [];
  const activeMethodModes = new Set<PaymentMode>();
  const activeMethodKeys = new Map<string, PaymentMode>();

  if ((methods?.data?.length ?? 0) === 0) {
    return ["qr", "cash"] satisfies PaymentMode[];
  }

  activeMethods.forEach((method) => {
    const mode = getMethodMode(method);

    if (!mode) return;

    activeMethodModes.add(mode);
    [method.id, method.method, method.action, method.icon, method.label].forEach((key) => {
      if (key) activeMethodKeys.set(key.toLowerCase(), mode);
    });
  });

  const cashierChannel = (channels?.data ?? []).find(
    (item) => item.id === "cashier" || item.name.toLowerCase().includes("cashier")
  );

  if (!cashierChannel) {
    return Array.from(activeMethodModes);
  }

  const allowedModes = new Set<PaymentMode>();

  cashierChannel.allowedMethods.forEach((methodKey) => {
    const mode =
      resolvePaymentMode(methodKey) ??
      activeMethodKeys.get(methodKey.toLowerCase()) ??
      null;

    if (mode && activeMethodModes.has(mode)) {
      allowedModes.add(mode);
    }
  });

  return allowedModes.size > 0
    ? Array.from(allowedModes)
    : Array.from(activeMethodModes);
}

function sumPaidAmount(raw: RawTransactionDetailResponse) {
  return raw.payments.reduce((sum, payment) => {
    return sum + (payment.paidAmount ?? payment.amount ?? 0);
  }, 0);
}

function addUnit(date: Date, unit: "year" | "month" | "day" | "hour" | "minute") {
  const next = new Date(date);

  if (unit === "year") next.setFullYear(next.getFullYear() + 1);
  if (unit === "month") next.setMonth(next.getMonth() + 1);
  if (unit === "day") next.setDate(next.getDate() + 1);
  if (unit === "hour") next.setHours(next.getHours() + 1);
  if (unit === "minute") next.setMinutes(next.getMinutes() + 1);

  return next;
}

function countCalendarUnit(
  cursor: Date,
  end: Date,
  unit: "year" | "month" | "day" | "hour" | "minute"
) {
  let count = 0;
  let next = addUnit(cursor, unit);

  while (next <= end) {
    count += 1;
    cursor = next;
    next = addUnit(cursor, unit);
  }

  return { count, cursor };
}

function formatDurationFromMinutes(totalMinutes: number) {
  let remaining = Math.max(0, Math.floor(totalMinutes));
  const years = Math.floor(remaining / (365 * 24 * 60));
  remaining -= years * 365 * 24 * 60;
  const months = Math.floor(remaining / (30 * 24 * 60));
  remaining -= months * 30 * 24 * 60;
  const days = Math.floor(remaining / (24 * 60));
  remaining -= days * 24 * 60;
  const hours = Math.floor(remaining / 60);
  const minutes = remaining % 60;

  return formatDurationParts({ years, months, days, hours, minutes });
}

function formatDurationParts(parts: {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
}) {
  const labels = [
    parts.years ? `${parts.years} ปี` : "",
    parts.months ? `${parts.months} เดือน` : "",
    parts.days ? `${parts.days} วัน` : "",
    parts.hours ? `${parts.hours} ชั่วโมง` : "",
    parts.minutes ? `${parts.minutes} นาที` : "",
  ].filter(Boolean);

  return labels.length > 0 ? labels.join(" ") : "0 นาที";
}

function formatParkingDuration(raw: RawTransactionDetailResponse) {
  const start = raw.entryAt ? new Date(raw.entryAt) : null;
  const endSource = raw.exitAt ?? raw.calculatedAt;
  const end = endSource ? new Date(endSource) : new Date();

  if (
    !start ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return formatDurationFromMinutes(raw.totalMinutes);
  }

  let cursor = new Date(start);
  const yearsResult = countCalendarUnit(cursor, end, "year");
  cursor = yearsResult.cursor;
  const monthsResult = countCalendarUnit(cursor, end, "month");
  cursor = monthsResult.cursor;
  const daysResult = countCalendarUnit(cursor, end, "day");
  cursor = daysResult.cursor;
  const hoursResult = countCalendarUnit(cursor, end, "hour");
  cursor = hoursResult.cursor;
  const minutesResult = countCalendarUnit(cursor, end, "minute");

  return formatDurationParts({
    years: yearsResult.count,
    months: monthsResult.count,
    days: daysResult.count,
    hours: hoursResult.count,
    minutes: minutesResult.count,
  });
}

function normalizeDetail(raw: RawTransactionDetailResponse): TransactionDetailResponse {
  const latestPayment = raw.payments.at(-1);
  const paidAmount = raw.totalPaid ?? sumPaidAmount(raw);
  const discountAmount = Math.max(raw.baseAmount - raw.netAmount, 0);

  return {
    id: raw.id,
    billNo: raw.billNo,
    plateNo: raw.plateNo,
    durationDisplay: formatParkingDuration(raw),
    baseAmount: raw.baseAmount,
    netAmount: raw.netAmount,
    paidAmount,
    remainingAmount: raw.remainingAmount,
    discountAmount,

    payment: {
      method: latestPayment?.method ?? null,
      qrCodeText: raw.qrData || null,
      qrCodeImageUrl: null,
    },

    receiptPreview: {
      printableText: null,
      canPrint: false,
    },
  };
}

function PaymentModal({ open, transactionId, onClose, onSuccess }: Props) {
  const [detail, setDetail] = useState<TransactionDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<PaymentMode>("qr");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [cashReceived, setCashReceived] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availableMethods, setAvailableMethods] = useState<PaymentMode[]>([]);

  useEffect(() => {
    if (!open || !transactionId) return;

    let ignore = false;

    async function fetchDetail() {
      try {
        setLoading(true);
        setError("");
        setDetail(null);
        setCashReceived("0");

        const token = localStorage.getItem("token");

        const settingsPromise = Promise.all([
          fetch("/api/devices/payment/methods", {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
          fetch("/api/devices/payment/channels", {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
        ]);

        const res = await fetch(`/api/check-payment/transactions/${transactionId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        const json = (await res.json().catch(() => null)) as
          | RawTransactionDetailResponse
          | null;

        if (!res.ok || !json) {
          throw new Error(
            (json as { message?: string } | null)?.message ||
            "ไม่สามารถโหลดรายละเอียดรายการได้"
          );
        }

        const normalized = normalizeDetail(json);
        const [methodsResponse, channelsResponse] = await settingsPromise;
        const methodsJson = (await methodsResponse.json().catch(() => null)) as PaymentMethodsResponse | null;
        const channelsJson = (await channelsResponse.json().catch(() => null)) as ServiceChannelsResponse | null;
        const allowed = getAvailablePaymentModes(methodsJson, channelsJson);

        if (!ignore) {
          setDetail(normalized);
          setAvailableMethods(allowed);
          setMode(
            allowed.includes(normalized.payment.method === "cash" ? "cash" : "qr")
              ? normalized.payment.method === "cash" ? "cash" : "qr"
              : allowed[0] ?? "qr"
          );
          setCashReceived("0");
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
    return receivedAmount > detail.remainingAmount ? receivedAmount - detail.remainingAmount : 0;
  }, [receivedAmount, detail]);

  async function handleConfirmPayment() {
    if (!detail) return;

    try {
      setSubmitting(true);
      setError("");

      if (!availableMethods.includes(mode)) {
        throw new Error("ช่องทางชำระเงินนี้ไม่ได้เปิดใช้งาน");
      }

      const token = localStorage.getItem("token");

      if (mode === "cash" && receivedAmount < detail.remainingAmount) {
        throw new Error("จำนวนเงินรับน้อยกว่ายอดชำระ");
      }

      const payload: PaymentRequest = {
        method: mode,
        channel: "cashier",
        amount: detail.remainingAmount,
      };

      const response = await fetch(
        `/api/check-payment/transactions/${detail.id}/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const result = (await response.json().catch(() => null)) as AdminPaymentResponse | null;

      if (!response.ok) {
        throw new Error(result?.message || "ไม่สามารถยืนยันการชำระเงินได้");
      }

      await onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ไม่สามารถยืนยันการชำระเงินได้"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#2E3445]/85 px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative max-h-[calc(100dvh-48px)] w-full max-w-[1100px] overflow-y-auto rounded-[24px] bg-white p-4 shadow-2xl sm:rounded-[32px] md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-900 transition hover:opacity-70"
          aria-label="ปิด"
        >
          <LuX />
        </button>

        {loading ? (
          <div className="py-20 text-center text-[#64748B]">
            กำลังโหลดข้อมูล...
          </div>
        ) : error && !detail ? (
          <div className="py-20 text-center text-red-600">{error}</div>
        ) : detail ? (
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[20px] bg-[#F5F6F7] p-5 md:p-6">
              <h2 className="text-[26px] font-extrabold leading-none text-[#101C2B] sm:text-[34px]">
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

                <div className="flex items-center justify-between gap-4 border-b border-[#E3E7EB] pb-3">
                  <span className="text-[14px] text-[#8A95A3]">เวลาที่จอด</span>
                  <span className="text-right text-[18px] font-bold text-[#1F2933]">
                    {detail.durationDisplay}
                  </span>
                </div>

                <div className="space-y-2 border-b border-[#E3E7EB] pb-4 text-[14px]">
                  <div className="flex items-center justify-between text-[#66707D]">
                    <span>ยอดรวม</span>
                    <span className="font-semibold text-[#1F2933]">
                      {formatCurrency(detail.netAmount)} ฿
                    </span>
                  </div>

                  {detail.discountAmount > 0 ? (
                    <div className="flex items-center justify-between text-[#34B44C]">
                      <span>ส่วนลด</span>
                      <span className="font-semibold">
                        -{formatCurrency(detail.discountAmount)} ฿
                      </span>
                    </div>
                  ) : null}

                  {detail.paidAmount > 0 ? (
                    <div className="flex items-center justify-between text-[#66707D]">
                      <span>ชำระแล้ว</span>
                      <span className="font-semibold text-[#1F2933]">
                        {formatCurrency(detail.paidAmount)} ฿
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="pt-3">
                  <div className="text-[14px] text-[#8A95A3]">ยอดที่ต้องชำระ</div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-[40px] font-extrabold leading-none text-[#101C2B] sm:text-[54px]">
                      {formatCurrency(detail.remainingAmount)}
                    </span>
                    <span className="pb-2 text-[22px] font-bold text-[#101C2B]">
                      ฿
                    </span>
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
                  disabled={!availableMethods.includes("qr")}
                  className={`flex min-h-[92px] flex-col items-center justify-center rounded-2xl border px-4 py-4 transition ${mode === "qr"
                      ? "border-[#8CC2FF] bg-[#EEF5FD]"
                      : "border-transparent bg-[#EFF1F3]"
                    }`}
                >
                  <div className="mb-2 flex h-10 w-20 items-center justify-center rounded-lg bg-white text-[#1D2A36]">
                    <LuQrCode size={22} />
                  </div>
                  <span className="text-[14px] font-bold text-[#1F2933]">
                    สแกนจ่าย
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("cash")}
                  disabled={!availableMethods.includes("cash")}
                  className={`flex min-h-[92px] flex-col items-center justify-center rounded-2xl border px-4 py-4 transition ${mode === "cash"
                      ? "border-[#8CC2FF] bg-[#EEF5FD]"
                      : "border-transparent bg-[#EFF1F3]"
                    }`}
                >
                  <div className="mb-2 flex h-10 w-20 items-center justify-center rounded-lg bg-white text-[#1D2A36]">
                    <LuBanknote size={22} />
                  </div>
                  <span className="text-[14px] font-bold text-[#1F2933]">
                    เงินสด
                  </span>
                </button>
              </div>

              {mode === "qr" ? (
                <div className="mt-4 rounded-[22px] bg-[#EEF3F9] px-6 py-8 text-center">
                  <div className="mx-auto flex min-h-[220px] max-w-[520px] items-center justify-center sm:min-h-[300px]">
                    {detail.payment?.qrCodeImageUrl ? (
                      <div>
                        <Image
                          src={detail.payment.qrCodeImageUrl}
                          alt="QR Code"
                          width={220}
                          height={220}
                          className="mx-auto h-[180px] w-[180px] sm:h-[220px] sm:w-[220px]"
                          unoptimized
                        />
                        <p className="mt-6 text-[16px] text-[#374151]">
                          สแกน QR Code เพื่อชำระเงิน
                        </p>
                      </div>
                    ) : (
                      <div className="text-[#64748B]">
                        ยังไม่มี QR Code สำหรับรายการนี้
                      </div>
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
                      className="w-full bg-transparent text-right text-[30px] font-extrabold text-[#1F2933] outline-none sm:text-[40px]"
                    />
                    <span className="ml-3 text-[22px] font-bold text-[#94A3B8]">
                      ฿
                    </span>
                  </div>

                  <div className="mt-5 rounded-[22px] bg-[#EEF3F9] px-6 py-8">
                    <div className="text-[14px] font-semibold text-[#66707D]">
                      จำนวนเงินที่ต้องทอน
                    </div>
                    <div className="mt-4 flex items-end justify-end gap-2">
                      <span className="text-[34px] font-extrabold leading-none text-[#101C2B] sm:text-[48px]">
                        {formatCurrency(changeAmount)}
                      </span>
                      <span className="pb-2 text-[22px] font-bold text-[#101C2B]">
                        ฿
                      </span>
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
                disabled={submitting || detail.remainingAmount <= 0}
                className="mt-6 inline-flex min-h-[60px] w-full items-center justify-center rounded-[18px] bg-[#061D36] px-5 text-[17px] font-bold text-white shadow-[0_12px_30px_rgba(6,29,54,0.18)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[72px] sm:text-[22px]"
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
