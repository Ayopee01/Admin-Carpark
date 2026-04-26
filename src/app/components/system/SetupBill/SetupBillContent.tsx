"use client";

import { useEffect, useState } from "react";
import type {
    SystemSettings,
    UpdateSystemSettingsPayload,
    UpdateSystemSettingsResponse,
} from "@/src/app/type/system/system";
import { DEFAULT_SYSTEM_SETTINGS } from "@/src/app/type/system/system";

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

function SetupBillContent() {
    const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
    const [draft, setDraft] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function fetchSystemSettings() {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await fetch("/api/system", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                cache: "no-store",
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "โหลดข้อมูลตั้งค่าระบบไม่สำเร็จ"));
            }

            const nextSettings = {
                ...DEFAULT_SYSTEM_SETTINGS,
                ...result,
                general: {
                    ...DEFAULT_SYSTEM_SETTINGS.general,
                    ...(result?.general || {}),
                },
                receipt: {
                    ...DEFAULT_SYSTEM_SETTINGS.receipt,
                    ...(result?.receipt || {}),
                    entryBill: {
                        ...DEFAULT_SYSTEM_SETTINGS.receipt.entryBill,
                        ...(result?.receipt?.entryBill || {}),
                    },
                    paymentBill: {
                        ...DEFAULT_SYSTEM_SETTINGS.receipt.paymentBill,
                        ...(result?.receipt?.paymentBill || {}),
                    },
                },
                billing: {
                    ...DEFAULT_SYSTEM_SETTINGS.billing,
                    ...(result?.billing || {}),
                },
            };

            setSettings(nextSettings);
            setDraft(nextSettings);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSystemSettings();
    }, []);

    function handleCancel() {
        setDraft(settings);
        setError("");
        setSuccess("");
    }

    async function handleSubmit() {
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const payload: UpdateSystemSettingsPayload = {
                general: draft.general,
                billing: draft.billing,
                receipt: {
                    paperWidth: draft.receipt.paperWidth,
                    footerText: draft.receipt.footerText,
                },
            };

            const response = await fetch("/api/system", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const result: UpdateSystemSettingsResponse | null = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "บันทึกข้อมูลตั้งค่าระบบไม่สำเร็จ"));
            }

            const saved = result?.settings ?? draft;

            setSettings(saved);
            setDraft(saved);
            setSuccess("บันทึกข้อมูลตั้งค่าระบบเรียบร้อยแล้ว");
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="h-[520px] animate-pulse rounded-2xl bg-white" />
                <div className="h-[420px] animate-pulse rounded-2xl bg-[#D9DDE4]" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border-t-4 border-[#0D1B2A] bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-3 text-[22px] font-extrabold text-[#1F2933]">
                    <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                    ตั้งค่าระบบทั่วไป
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

                <div className="mt-8 space-y-6">
                    <div>
                        <label className="mb-2 block text-[14px] text-[#667085]">
                            ชื่อระบบ
                        </label>
                        <input
                            value={draft.general.systemName}
                            onChange={(event) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    general: {
                                        ...prev.general,
                                        systemName: event.target.value,
                                    },
                                }))
                            }
                            className="w-full rounded-xl bg-[#E5E7EB] px-4 py-4 text-[18px] font-bold text-[#1F2933] outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[14px] text-[#667085]">
                            สถานที่
                        </label>
                        <input
                            value={draft.general.location}
                            onChange={(event) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    general: {
                                        ...prev.general,
                                        location: event.target.value,
                                    },
                                }))
                            }
                            className="w-full rounded-xl bg-[#E5E7EB] px-4 py-4 text-[18px] font-bold text-[#1F2933] outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-[14px] text-[#667085]">
                                ภาษา
                            </label>
                            <select
                                value={draft.general.language}
                                onChange={(event) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        general: {
                                            ...prev.general,
                                            language: event.target.value,
                                        },
                                    }))
                                }
                                className="w-full rounded-xl bg-[#E5E7EB] px-4 py-4 text-[16px] font-bold text-[#1F2933] outline-none"
                            >
                                <option value="th">ไทย</option>
                                <option value="en">English</option>
                                <option value="zh">中文</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-[14px] text-[#667085]">
                                Timezone
                            </label>
                            <input
                                value={draft.general.timezone}
                                onChange={(event) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        general: {
                                            ...prev.general,
                                            timezone: event.target.value,
                                        },
                                    }))
                                }
                                className="w-full rounded-xl bg-[#E5E7EB] px-4 py-4 text-[16px] font-bold text-[#1F2933] outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-[14px] text-[#667085]">
                                ขนาดกระดาษ
                            </label>
                            <select
                                value={draft.receipt.paperWidth}
                                onChange={(event) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        receipt: {
                                            ...prev.receipt,
                                            paperWidth: event.target.value,
                                        },
                                    }))
                                }
                                className="w-full rounded-xl bg-[#E5E7EB] px-4 py-4 text-[16px] font-bold text-[#1F2933] outline-none"
                            >
                                <option value="58mm">58mm</option>
                                <option value="80mm">80mm</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-[14px] text-[#667085]">
                                สกุลเงิน
                            </label>
                            <input
                                value={draft.billing.currency}
                                onChange={(event) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        billing: {
                                            ...prev.billing,
                                            currency: event.target.value,
                                        },
                                    }))
                                }
                                className="w-full rounded-xl bg-[#E5E7EB] px-4 py-4 text-[16px] font-bold text-[#1F2933] outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-[14px] text-[#667085]">
                            ข้อความท้ายใบเสร็จ
                        </label>
                        <textarea
                            value={draft.receipt.footerText}
                            onChange={(event) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    receipt: {
                                        ...prev.receipt,
                                        footerText: event.target.value,
                                    },
                                }))
                            }
                            rows={3}
                            className="w-full resize-none rounded-xl bg-[#E5E7EB] px-4 py-4 text-[16px] font-bold text-[#1F2933] outline-none"
                        />
                    </div>

                    <label className="flex items-center justify-between rounded-xl bg-[#E8EBEF] px-5 py-4">
                        <span className="text-[15px] font-semibold text-[#1F2933]">
                            เปิดใช้งานภาษี
                        </span>
                        <input
                            type="checkbox"
                            checked={draft.billing.taxEnabled}
                            onChange={(event) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    billing: {
                                        ...prev.billing,
                                        taxEnabled: event.target.checked,
                                    },
                                }))
                            }
                            className="h-5 w-5 accent-[#061D36]"
                        />
                    </label>
                </div>

                <div className="mt-10 flex justify-end gap-4 border-t border-[#E5E7EB] pt-6">
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

            <div className="space-y-4">
                <div className="rounded-2xl bg-[#D9DDE4] p-5 shadow-sm">
                    <div className="text-[18px] font-bold text-[#1F2933]">
                        ข้อมูลปัจจุบัน
                    </div>

                    <div className="mt-4 space-y-3 text-[14px] text-[#667085]">
                        <div>
                            <span className="font-bold text-[#1F2933]">ระบบ:</span>{" "}
                            {draft.general.systemName}
                        </div>
                        <div>
                            <span className="font-bold text-[#1F2933]">สถานที่:</span>{" "}
                            {draft.general.location}
                        </div>
                        <div>
                            <span className="font-bold text-[#1F2933]">ภาษา:</span>{" "}
                            {draft.general.language}
                        </div>
                        <div>
                            <span className="font-bold text-[#1F2933]">Timezone:</span>{" "}
                            {draft.general.timezone}
                        </div>
                        <div>
                            <span className="font-bold text-[#1F2933]">กระดาษ:</span>{" "}
                            {draft.receipt.paperWidth}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl bg-[#D9DDE4] p-5 shadow-sm">
                    <div className="mb-4 text-[18px] font-bold text-[#1F2933]">
                        Live Preview
                    </div>

                    <div className="mx-auto max-w-[220px] rounded-xl bg-white p-5 shadow-sm">
                        <div className="text-center text-[18px] font-extrabold text-[#1F2933]">
                            {draft.general.systemName}
                        </div>
                        <div className="mt-1 text-center text-[10px] text-[#667085]">
                            {draft.general.location}
                        </div>

                        <div className="mt-6 space-y-2 text-[11px] text-[#374151]">
                            <div>วันที่ : 25/10/2023</div>
                            <div>เวลาเข้า : 14:30:22</div>
                            <div>รหัสบิล : #A8902</div>
                        </div>

                        <div className="mx-auto mt-8 h-20 w-20 rounded bg-[#F3F4F6]" />

                        <div className="mt-6 border-t border-dashed border-[#D1D5DB] pt-4 text-center text-[10px] text-[#6B7280]">
                            {draft.receipt.footerText}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SetupBillContent;