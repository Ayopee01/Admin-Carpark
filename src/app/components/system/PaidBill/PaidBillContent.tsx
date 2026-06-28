"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
    LuCalendarDays,
    LuClock3,
    LuQrCode,
    LuReceiptText,
    LuTimerReset,
} from "react-icons/lu";
import type {
    PaymentBillSettings,
    ReceiptSettings,
    UpdateReceiptSettingsResponse,
} from "@/src/app/type/system/system";
import { DEFAULT_RECEIPT_SETTINGS } from "@/src/app/type/system/system";

function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function getErrorMessage(value: unknown, fallback: string) {
    if (
        value &&
        typeof value === "object" &&
        "message" in value &&
        typeof value.message === "string"
    ) {
        return value.message;
    }

    return fallback;
}

function RowItem({
    icon,
    label,
    subLabel,
    checked,
    onChange,
}: {
    icon: ReactNode;
    label: string;
    subLabel?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#E8EBEF] px-5 py-4 transition hover:bg-[#DDE2E8]">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#1F2933]">
                    {icon}
                </div>

                <div>
                    <div className="text-[16px] text-[#1F2933]">{label}</div>
                    {subLabel ? (
                        <div className="text-[12px] text-[#667085]">{subLabel}</div>
                    ) : null}
                </div>
            </div>

            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-5 w-5 accent-[#061D36]"
            />
        </label>
    );
}

function PaidBillContent() {
    const [receipt, setReceipt] = useState<ReceiptSettings>(DEFAULT_RECEIPT_SETTINGS);
    const [draft, setDraft] = useState<ReceiptSettings>(DEFAULT_RECEIPT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function fetchReceiptSettings(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await fetch("/api/system/receipt", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                cache: "no-store",
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "โหลดข้อมูลใบหลังชำระไม่สำเร็จ"));
            }

            const nextReceipt: ReceiptSettings = {
                ...DEFAULT_RECEIPT_SETTINGS,
                ...(result || {}),
                entryBill: {
                    ...DEFAULT_RECEIPT_SETTINGS.entryBill,
                    ...(result?.entryBill || {}),
                },
                paymentBill: {
                    ...DEFAULT_RECEIPT_SETTINGS.paymentBill,
                    ...(result?.paymentBill || {}),
                },
            };

            setReceipt(nextReceipt);
            setDraft(nextReceipt);
            return nextReceipt;
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
            return null;
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        fetchReceiptSettings();
    }, []);

    function updatePaymentBill<K extends keyof PaymentBillSettings>(
        key: K,
        value: PaymentBillSettings[K]
    ) {
        setDraft((prev) => ({
            ...prev,
            paymentBill: {
                ...prev.paymentBill,
                [key]: value,
            },
        }));
    }

    function handleCancel() {
        setDraft(receipt);
        setError("");
        setSuccess("");
    }

    async function handleSubmit() {
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await fetch("/api/system/receipt", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    paymentBill: draft.paymentBill,
                    paperWidth: draft.paperWidth,
                    footerText: draft.footerText,
                }),
            });

            const result: UpdateReceiptSettingsResponse | null = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "บันทึกข้อมูลใบหลังชำระไม่สำเร็จ"));
            }

            await fetchReceiptSettings(false);
            setSuccess("บันทึกข้อมูลใบหลังชำระเรียบร้อยแล้ว");
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="grid min-w-0 max-w-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
                <div className="h-[580px] animate-pulse rounded-2xl bg-[#D9DDE4]" />
            </div>
        );
    }

    return (
        <div className="grid min-w-0 max-w-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 rounded-2xl border-t-4 border-[#0D1B2A] bg-white p-4 shadow-sm sm:p-6">
                <h2 className="flex items-center gap-3 text-[22px] font-extrabold text-[#1F2933]">
                    <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                    กำหนดข้อมูลในใบหลังชำระ
                </h2>

                {error ? (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                        {error}
                    </div>
                ) : null}

                {success ? (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700">
                        {success}
                    </div>
                ) : null}

                <div className="mt-8 space-y-4">
                    <RowItem
                        icon={<LuCalendarDays size={18} />}
                        label="วัน เดือน ปี"
                        checked={draft.paymentBill.showDate}
                        onChange={(checked) => updatePaymentBill("showDate", checked)}
                    />
                    <RowItem
                        icon={<LuClock3 size={18} />}
                        label="เวลาเข้า"
                        checked={draft.paymentBill.showEntryTime}
                        onChange={(checked) => updatePaymentBill("showEntryTime", checked)}
                    />
                    <RowItem
                        icon={<LuQrCode size={18} />}
                        label="QR Code"
                        checked={draft.paymentBill.showQrCode}
                        onChange={(checked) => updatePaymentBill("showQrCode", checked)}
                    />
                    <RowItem
                        icon={<LuReceiptText size={18} />}
                        label="รหัสบิล"
                        checked={draft.paymentBill.showBillNo}
                        onChange={(checked) => updatePaymentBill("showBillNo", checked)}
                    />
                    <RowItem
                        icon={<LuTimerReset size={18} />}
                        label="เวลาหมดอายุ"
                        subLabel={`(${draft.paymentBill.expiryDuration} นาที)`}
                        checked={draft.paymentBill.showExpiryTime}
                        onChange={(checked) => updatePaymentBill("showExpiryTime", checked)}
                    />

                    <div>
                        <label className="mb-2 block text-[14px] text-[#667085]">
                            ระยะเวลาหมดอายุ QR Code (นาที)
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={draft.paymentBill.expiryDuration}
                            onChange={(event) =>
                                updatePaymentBill(
                                    "expiryDuration",
                                    Number(event.target.value || 1)
                                )
                            }
                            className="w-full rounded-xl bg-[#E8EBEF] px-5 py-4 text-[18px] font-bold text-[#1F2933] outline-none"
                        />
                    </div>
                </div>

                <div className="mt-10 flex justify-center gap-4 border-t border-[#E5E7EB] pt-6">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="rounded-full bg-[#061D36] px-8 py-3 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={submitting}
                        className="rounded-full bg-[#E5E7EB] px-8 py-3 text-[14px] font-semibold text-[#1F2933] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        ยกเลิก
                    </button>
                </div>
            </div>

            <div className="rounded-2xl bg-[#D9DDE4] p-5 shadow-sm">
                <div className="mb-4 text-[18px] font-bold text-[#1F2933]">ตัวอย่าง</div>

                <div className="mx-auto w-full max-w-[260px] rounded-xl bg-white p-6 shadow-md">
                    <div className="text-center text-[28px] font-extrabold text-[#1F2933]">
                        Smart Carpark
                    </div>
                    <div className="mt-1 text-center text-[10px] text-[#6B7280]">
                        ระบบจอดรถอัจฉริยะ | อาคาร A-12
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-y-2 text-[13px]">
                        {draft.paymentBill.showDate ? (
                            <>
                                <div>วันที่ :</div>
                                <div className="text-right">24 Oct 2023</div>
                            </>
                        ) : null}

                        {draft.paymentBill.showEntryTime ? (
                            <>
                                <div>เวลาเข้า :</div>
                                <div className="text-right">14:23:45</div>
                            </>
                        ) : null}

                        {draft.paymentBill.showBillNo ? (
                            <>
                                <div>รหัสบิล :</div>
                                <div className="text-right">#GP-984421</div>
                            </>
                        ) : null}
                    </div>

                    {draft.paymentBill.showQrCode ? (
                        <div className="mx-auto mt-8 flex h-24 w-24 items-center justify-center bg-[#F3F4F6]">
                            QR
                        </div>
                    ) : null}

                    {draft.paymentBill.showExpiryTime ? (
                        <div className="mt-6 text-center">
                            <div className="text-[12px] text-[#6B7280]">หมดอายุใน</div>
                            <div className="text-[34px] font-extrabold leading-none text-[#1F2933]">
                                {String(draft.paymentBill.expiryDuration).padStart(2, "0")}:00 นาที
                            </div>
                            <div className="mt-2 text-[10px] text-[#6B7280]">
                                กรุณาสแกนภายในเวลาที่กำหนด มิฉะนั้นจะต้องเริ่มกระบวนการใหม่
                            </div>
                        </div>
                    ) : null}

                    <div className="mt-8 border-t border-dashed border-[#D1D5DB] pt-4 text-center text-[10px] text-[#6B7280]">
                        {draft.footerText}
                    </div>
                </div>

                <div className="mt-5 text-[12px] text-[#667085]">
                    * ตัวอย่างนี้จะแสดงตามค่าที่เปิดใช้งานจาก API
                </div>
            </div>
        </div>
    );
}

export default PaidBillContent;
