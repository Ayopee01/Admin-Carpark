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
    serviceType: "parking",
    vehicleType: "car",
    hourStart: 1,
    hourEnd: 1,
    price: 0,
    status: "active",
};

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

function PricingPage() {
    const [config, setConfig] = useState<ServicePricingConfig | null>(null);
    const [activeTab, setActiveTab] = useState("pricing");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<PricingRulePayload>(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);

    async function fetchConfig() {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            const response = await fetch("/api/devices/pricing/config", {
                method: "GET",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                cache: "no-store",
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "โหลดข้อมูลค่าบริการไม่สำเร็จ"));
            }

            setConfig(result as ServicePricingConfig);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchConfig();
    }, []);

    const pricingRules = useMemo(() => {
        if (!config) return [];
        return [...config.pricingRules]
            .filter((rule) => rule.vehicleType === "car")
            .sort((a, b) => a.hourStart - b.hourStart);
    }, [config]);

    function getServiceLabel(code: string) {
        return (
            config?.masterData.serviceTypes.find((item) => item.code === code)?.label ??
            code
        );
    }

    function handleOpenCreate() {
        setModalMode("create");
        setEditingId(null);
        setForm({
            ...DEFAULT_FORM,
            serviceType: config?.masterData.serviceTypes[0]?.code ?? "parking",
            vehicleType: "car",
        });
        setOpenModal(true);
    }

    function handleOpenEdit(rule: PricingRule) {
        setModalMode("edit");
        setEditingId(rule.id);
        setForm({
            serviceType: rule.serviceType,
            vehicleType: "car",
            hourStart: rule.hourStart,
            hourEnd: rule.hourEnd,
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
                vehicleType: "car",
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
            await fetchConfig();
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

            await fetchConfig();
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
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="border-l-[8px] border-[#061D36] pl-4 text-[32px] font-bold tracking-[-0.6px] text-[#1F2937]">
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
                                                {getServiceLabel(rule.serviceType)}
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
                serviceTypes={config?.masterData.serviceTypes ?? []}
                vehicleTypes={config?.masterData.vehicleTypes ?? []}
                submitting={submitting}
                onClose={() => setOpenModal(false)}
                onChange={setForm}
                onSubmit={handleSubmitRule}
            />
        </>
    );
}

export default PricingPage;