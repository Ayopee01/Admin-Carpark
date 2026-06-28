"use client";

import { useEffect, useMemo, useState } from "react";
import {
    LuBuilding2,
    LuCreditCard,
    LuLandmark,
    LuQrCode,
    LuUser,
    LuWallet,
} from "react-icons/lu";

import ChannelMappingModal from "@/src/app/components/device/payment/ChannelMappingModal";
import type {
    PaymentMethod,
    PaymentMethodsResponse,
    ServiceChannel,
    ServiceChannelsResponse,
} from "@/src/app/type/device/payment";

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

function getPaymentMethodIcon(icon?: string) {
    switch (icon) {
        case "cash":
            return <LuUser size={18} />;
        case "bank":
            return <LuLandmark size={18} />;
        case "qr":
            return <LuQrCode size={18} />;
        case "wallet":
            return <LuWallet size={18} />;
        default:
            return <LuCreditCard size={18} />;
    }
}

function getChannelIcon(icon?: string) {
    switch (icon) {
        case "user":
            return <LuUser size={18} />;
        case "vending":
            return <LuBuilding2 size={18} />;
        case "qr":
            return <LuQrCode size={18} />;
        case "gate":
            return <LuCreditCard size={18} />;
        default:
            return <LuCreditCard size={18} />;
    }
}

function getMethods(value: unknown) {
    if (Array.isArray(value)) return value as PaymentMethod[];

    const response = value as PaymentMethodsResponse | null;

    return response?.data ?? [];
}

function getChannels(value: unknown) {
    if (Array.isArray(value)) return value as ServiceChannel[];

    const response = value as ServiceChannelsResponse | null;

    return response?.data ?? [];
}

function ChannelSettingContent() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [channels, setChannels] = useState<ServiceChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [openMapping, setOpenMapping] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<ServiceChannel | null>(null);
    const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    async function fetchPaymentSettings(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError("");

            const token = getToken();

            const [methodsResponse, channelsResponse] = await Promise.all([
                fetch("/api/devices/payment/methods", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    cache: "no-store",
                }),
                fetch("/api/devices/payment/channels", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    cache: "no-store",
                }),
            ]);

            const methodsJson = await methodsResponse.json().catch(() => null);
            const channelsJson = await channelsResponse.json().catch(() => null);

            if (!methodsResponse.ok) {
                throw new Error(getErrorMessage(methodsJson, "โหลดวิธีชำระเงินไม่สำเร็จ"));
            }

            if (!channelsResponse.ok) {
                throw new Error(getErrorMessage(channelsJson, "โหลดช่องทางบริการไม่สำเร็จ"));
            }

            setMethods(getMethods(methodsJson));
            setChannels(getChannels(channelsJson));
            return true;
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
        fetchPaymentSettings();
    }, []);

    const activeMethods = useMemo(
        () => methods.filter((method) => method.isActive),
        [methods]
    );

    async function handleToggleMethod(method: PaymentMethod) {
        try {
            setError("");

            const token = getToken();

            const response = await fetch(`/api/devices/payment/methods/${method.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    isActive: !method.isActive,
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "อัปเดตวิธีชำระเงินไม่สำเร็จ"));
            }

            await fetchPaymentSettings();
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    function handleOpenMapping(channel: ServiceChannel) {
        setSelectedChannel(channel);
        setSelectedMethods(
            (channel.allowedMethods ?? []).filter((methodId) =>
                activeMethods.some((method) => method.id === methodId)
            )
        );
        setOpenMapping(true);
    }

    function handleCloseMapping() {
        setOpenMapping(false);
        setSelectedChannel(null);
        setSelectedMethods([]);
        setSubmitting(false);
    }

    function handleToggleMapping(methodId: string) {
        setSelectedMethods((prev) =>
            prev.includes(methodId)
                ? prev.filter((item) => item !== methodId)
                : [...prev, methodId]
        );
    }

    async function handleSaveMapping() {
        if (!selectedChannel) return;

        try {
            setSubmitting(true);
            setError("");

            const token = getToken();

            const response = await fetch(
                `/api/devices/payment/channels/${selectedChannel.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        allowedMethods: selectedMethods,
                    }),
                }
            );

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "ตั้งค่าช่องทางบริการไม่สำเร็จ"));
            }

            handleCloseMapping();
            await fetchPaymentSettings();
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:mb-6">
                <h2 className="flex min-w-0 items-center gap-3 text-[18px] font-extrabold text-[#2B3640] sm:text-[20px]">
                    <span className="h-5 w-1 shrink-0 rounded-full bg-[#1F2933] sm:h-6" />
                    <span className="min-w-0 break-words">
                        การกำหนดช่องทางการชำระค่าบริการ
                    </span>
                </h2>
            </div>

            {error ? (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            ) : null}

            <div className="min-w-0 rounded-2xl bg-[#D9D9D9] p-4 sm:p-6">
                <div className="text-[16px] font-extrabold text-[#2B3640] sm:text-[18px]">
                    วิธีการชำระเงิน
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
                    {loading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[86px] animate-pulse rounded-xl bg-[#ECECEC] sm:h-[104px]"
                            />
                        ))
                        : methods.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => handleToggleMethod(method)}
                                className={`rounded-xl p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${
                                    method.isActive
                                        ? "bg-[#ECECEC] text-[#1F2937]"
                                        : "bg-[#C6CBD1] text-[#667085] opacity-70"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#061D36] sm:h-9 sm:w-9">
                                        {getPaymentMethodIcon(method.icon)}
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={method.isActive}
                                        readOnly
                                        className="h-4 w-4 accent-[#061D36]"
                                    />
                                </div>

                                <div className="mt-3 truncate text-[14px] font-bold sm:text-[15px]">
                                    {method.label}
                                </div>
                                <div className="mt-1 text-[11px] text-[#667085] sm:text-[12px]">
                                    {method.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                                </div>
                            </button>
                        ))}
                </div>

                <div className="mt-6 min-w-0 rounded-2xl bg-[#EFEFEF] p-4 sm:mt-8 sm:p-5">
                    <div className="mb-4 text-[16px] font-extrabold text-[#2B3640] sm:text-[18px]">
                        การตั้งค่าช่องทางบริการ
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        {loading
                            ? Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-[86px] animate-pulse rounded-xl bg-white sm:h-[72px]"
                                />
                            ))
                            : channels.map((channel) => {
                                const channelMethods = channel.allowedMethods
                                    .map(
                                        (id) =>
                                            methods.find((method) => method.id === id)?.label
                                    )
                                    .filter(Boolean)
                                    .join(", ");

                                return (
                                    <div
                                        key={channel.id}
                                        className="flex min-w-0 flex-col gap-4 rounded-xl border border-[#E0E2E6] bg-white px-4 py-4 transition hover:bg-[#F8FAFC] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                                    >
                                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF1F4] text-[#061D36] sm:h-10 sm:w-10">
                                                {getChannelIcon(channel.icon)}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="truncate text-[14px] font-bold text-[#1F2937] sm:text-base">
                                                    {channel.name}
                                                </div>
                                                <div className="mt-1 truncate text-[12px] text-[#667085] sm:max-w-[560px]">
                                                    {channelMethods || "ยังไม่ได้กำหนดวิธีชำระเงิน"}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenMapping(channel)}
                                            className="h-10 shrink-0 rounded-full border border-[#FF4D3A] px-5 text-[13px] font-semibold text-[#FF4D3A] transition hover:bg-[#FFF1EF] sm:h-auto sm:py-2"
                                        >
                                            แก้ไข
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            <ChannelMappingModal
                open={openMapping}
                channel={selectedChannel}
                methods={activeMethods}
                selectedMethods={selectedMethods}
                submitting={submitting}
                onClose={handleCloseMapping}
                onToggle={handleToggleMapping}
                onSubmit={handleSaveMapping}
            />
        </>
    );
}

export default ChannelSettingContent;
