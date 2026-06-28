"use client";

import { useEffect, useMemo, useState } from "react";
import { LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import PricingRuleModal from "@/src/app/components/device/pricing/PricingRuleModal";
import type {
    PricingRule,
    PricingRulePayload,
    ServicePricingConfig,
} from "@/src/app/type/device/pricing";

const DEFAULT_FORM: PricingRulePayload = {
    name: "Base hour",
    feeType: "base_hour",
    vehicleType: "car",
    baseHours: 1,
    hourStart: 1,
    hourEnd: 1,
    periodUnit: null,
    periodStart: 0,
    periodEnd: null,
    price: 0,
    status: "active",
};

const DEFAULT_SERVICE_PRICING_CONFIG: ServicePricingConfig = {
    configUpdatedAt: null,
    pricingRules: [],
};
const FEE_TYPES = [
    { code: "base_hour", label: "Base hour" },
    { code: "next_hour", label: "Next hour" },
    { code: "overnight_day", label: "Overnight day" },
    { code: "overnight_week", label: "Overnight week" },
    { code: "overnight_month", label: "Overnight month" },
    { code: "overnight_year", label: "Overnight year" },
];
const VEHICLE_TYPES = [
    { code: "car", label: "รถยนต์" },
    { code: "motorcycle", label: "รถจักรยานยนต์" },
];

type ServicePricingApiResponse = {
    success?: boolean;
    data?: Partial<ServicePricingConfig>;
} & Partial<ServicePricingConfig>;

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

function normalizeServicePricingConfig(
    value: ServicePricingApiResponse | null
): ServicePricingConfig {
    const responseData: Partial<ServicePricingConfig> =
        value && typeof value === "object" && "data" in value && value.data
            ? value.data
            : value ?? {};

    return {
        configUpdatedAt: responseData.configUpdatedAt ?? null,
        pricingRules: responseData.pricingRules ?? [],
    };
}

function PricingPage() {
    const [config, setConfig] = useState<ServicePricingConfig>(
        DEFAULT_SERVICE_PRICING_CONFIG
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<PricingRulePayload>(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);

    async function fetchConfig(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError("");

            const token = getToken();

            const response = await fetch("/api/devices/pricing/config", {
                method: "GET",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                cache: "no-store",
            });

            const result = (await response.json().catch(() => null)) as
                | ServicePricingApiResponse
                | null;

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "โหลดข้อมูลค่าบริการไม่สำเร็จ"));
            }

            const normalizedConfig = normalizeServicePricingConfig(result);

            setConfig(normalizedConfig);
            return normalizedConfig;
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
            setConfig(DEFAULT_SERVICE_PRICING_CONFIG);
            return null;
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        fetchConfig();
    }, []);

    const pricingRules = useMemo(() => {
        return [...(config.pricingRules ?? [])]
            .filter((rule) => rule.vehicleType === "car")
            .sort((a, b) => a.hourStart - b.hourStart);
    }, [config.pricingRules]);

    function getServiceLabel(code?: string | null) {
        return (
            FEE_TYPES.find((item) => item.code === code)
                ?.label ??
            code ??
            "-"
        );
    }

    function handleOpenCreate() {
        setModalMode("create");
        setEditingId(null);
        setForm({
            ...DEFAULT_FORM,
            vehicleType: "car",
        });
        setOpenModal(true);
    }

    function handleOpenEdit(rule: PricingRule) {
        setModalMode("edit");
        setEditingId(rule.id);
        setForm({
            name: rule.name,
            feeType: rule.feeType,
            vehicleType: rule.vehicleType,
            baseHours: rule.baseHours,
            hourStart: rule.hourStart,
            hourEnd: rule.hourEnd,
            periodUnit: rule.periodUnit,
            periodStart: rule.periodStart,
            periodEnd: rule.periodEnd,
            price: rule.price,
            status: rule.status,
        });
        setOpenModal(true);
    }

    async function handleSubmitRule() {
        try {
            setSubmitting(true);
            setError("");

            const token = getToken();
            const url =
                modalMode === "edit" && editingId
                    ? `/api/devices/pricing/rules/${editingId}`
                    : "/api/devices/pricing/rules";

            const payload: PricingRulePayload = {
                ...form,
            };

            const response = await fetch(url, {
                method: modalMode === "edit" ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "บันทึกข้อมูลไม่สำเร็จ"));
            }

            setOpenModal(false);
            await fetchConfig(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteRule(id: string) {
        const confirmed = window.confirm("ต้องการลบเงื่อนไขราคานี้หรือไม่?");

        if (!confirmed) return;

        try {
            setError("");

            const token = getToken();
            const response = await fetch(`/api/devices/pricing/rules/${id}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "ลบข้อมูลไม่สำเร็จ"));
            }

            await fetchConfig(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    return (
        <>
            <section>
                <div className="mx-auto max-w-7xl">
                    {error ? (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    ) : null}

                    <div className="mt-12">
                        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                            <h2 className="border-l-[6px] border-[#061D36] pl-3 text-[24px] font-bold text-[#1F2937] sm:border-l-[8px] sm:pl-4 sm:text-[32px]">
                                กำหนดราคาค่าบริการ
                            </h2>

                            <button
                                type="button"
                                onClick={handleOpenCreate}
                                className="inline-flex h-12 items-center gap-3 rounded-full bg-[#061D36] px-7 text-[14px] font-bold text-white"
                            >
                                <LuPlus size={17} />
                                เพิ่มเงื่อนไข
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2].map((item) => (
                                    <div
                                        key={item}
                                        className="h-[96px] animate-pulse rounded-md border border-[#9CA3AF] bg-white"
                                    />
                                ))}
                            </div>
                        ) : pricingRules.length === 0 ? (
                            <div className="rounded-md border border-[#9CA3AF] bg-white px-6 py-8 text-center text-[#6B7280]">
                                ไม่พบข้อมูลค่าบริการ
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {pricingRules.map((rule) => (
                                    <article
                                        key={rule.id}
                                        className="flex min-h-[120px] items-center justify-between rounded-md border border-[#061D36] bg-white px-8 py-6"
                                    >
                                        <div>
                                            <p className="text-[16px] text-[#1F2937]">
                                                ราคาสำหรับ {rule.hourStart} ถึง {rule.hourEnd} ชั่วโมง •{" "}
                                                {getServiceLabel(rule.feeType)}
                                            </p>

                                            <p className="mt-3 text-[30px] font-bold text-[#061D36]">
                                                <span className="text-[#061D36]">
                                                    ช่วงที่ {rule.hourStart} :
                                                </span>{" "}
                                                <span className="text-[#16C75F]">
                                                    {rule.price} บาท
                                                </span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(rule)}
                                                className="inline-flex h-9 items-center gap-2 rounded-full border border-[#FF2F2F] px-5 text-[13px] font-bold text-[#FF2F2F]"
                                            >
                                                <LuPencil size={14} />
                                                แก้ไข
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="inline-flex h-9 items-center gap-2 rounded-full border border-[#FF2F2F] px-5 text-[13px] font-bold text-[#FF2F2F]"
                                            >
                                                <LuTrash2 size={14} />
                                                ลบ
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <PricingRuleModal
                open={openModal}
                mode={modalMode}
                form={form}
                serviceTypes={FEE_TYPES}
                vehicleTypes={VEHICLE_TYPES}
                submitting={submitting}
                onClose={() => setOpenModal(false)}
                onChange={setForm}
                onSubmit={handleSubmitRule}
            />
        </>
    );
}

export default PricingPage;
