"use client";

import { useEffect, useMemo, useState } from "react";
import {
    LuBell,
    LuCamera,
    LuPencil,
    LuPlus,
    LuPrinter,
    LuTrash2,
    LuWarehouse,
} from "react-icons/lu";
import DeviceModal from "@/src/app/components/device/device/DeviceModal";
import type {
    DeviceItem,
    DevicePayload,
    DevicesConfigResponse,
} from "@/src/app/type/device/device";

const DEFAULT_FORM: DevicePayload = {
    deviceCode: "",
    deviceName: "",
    deviceType: "",
    connectionType: "",
    ipAddress: null,
    status: "active",
    note: "",
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

function getDeviceIcon(type: string) {
    if (type === "lpr") {
        return <LuCamera className="text-[20px]" />;
    }

    if (type === "barrier") {
        return <LuWarehouse className="text-[20px]" />;
    }

    return <LuPrinter className="text-[20px]" />;
}

function DevicesPage() {
    const [config, setConfig] = useState<DevicesConfigResponse | null>(null);
    const [activeTab, setActiveTab] = useState("device");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<DevicePayload>(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);

    async function fetchConfig() {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            const response = await fetch("/api/devices/devices/config", {
                method: "GET",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                cache: "no-store",
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "โหลดข้อมูลอุปกรณ์ไม่สำเร็จ"));
            }

            setConfig(result as DevicesConfigResponse);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchConfig();
    }, []);

    const devices = useMemo(() => config?.devices ?? [], [config]);

    function getDeviceTypeLabel(code: string) {
        return (
            config?.masterData.deviceTypes.find((item) => item.code === code)
                ?.label ?? code
        );
    }

    function getConnectionLabel(code: string) {
        return (
            config?.masterData.connectionTypes.find((item) => item.code === code)
                ?.label ?? code
        );
    }

    function handleOpenCreate() {
        setModalMode("create");
        setEditingId(null);
        setForm({
            ...DEFAULT_FORM,
            deviceType: config?.masterData.deviceTypes[0]?.code ?? "",
            connectionType: config?.masterData.connectionTypes[0]?.code ?? "",
        });
        setOpenModal(true);
    }

    function handleOpenEdit(device: DeviceItem) {
        setModalMode("edit");
        setEditingId(device.id);
        setForm({
            deviceCode: device.deviceCode,
            deviceName: device.deviceName,
            deviceType: device.deviceType,
            connectionType: device.connectionType,
            ipAddress: device.ipAddress,
            status: device.status,
            note: device.note,
        });
        setOpenModal(true);
    }

    async function handleSubmitDevice() {
        try {
            setSubmitting(true);
            setError("");

            const token = getToken();

            const url =
                modalMode === "edit" && editingId
                    ? `/api/devices/devices/${editingId}`
                    : "/api/devices/devices/";

            const response = await fetch(url, {
                method: modalMode === "edit" ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(form),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "บันทึกข้อมูลอุปกรณ์ไม่สำเร็จ"));
            }

            setOpenModal(false);
            await fetchConfig();
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteDevice(id: string) {
        const confirmed = window.confirm("ต้องการลบอุปกรณ์นี้หรือไม่?");
        if (!confirmed) return;

        try {
            setError("");

            const token = getToken();

            const response = await fetch(`/api/devices/devices/${id}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "ลบอุปกรณ์ไม่สำเร็จ"));
            }

            await fetchConfig();
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    return (
        <>
            <section className="">
                <div className="mx-auto max-w-7xl">

                    {error ? (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    ) : null}

                    <div className="mb-8 flex items-center justify-between">

                        <h2 className="border-l-[8px] border-[#061D36] pl-4 text-[32px] font-bold tracking-[-0.6px] text-[#1F2937]">
                            การตั้งค่าอุปกรณ์
                        </h2>

                        <div className="flex items-center gap-8">
                            <div className="h-16 w-px bg-[#061D36]" />

                            <button
                                type="button"
                                className="flex h-12 w-12 items-center justify-center rounded-full text-[#061D36] transition hover:bg-[#E5E7EB]"
                            >
                                <LuBell size={30} />
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenCreate}
                                className="inline-flex h-12 items-center gap-3 rounded-full bg-[#061D36] px-7 text-[14px] font-bold text-white transition hover:bg-[#0B2A4A] active:scale-[0.98]"
                            >
                                <LuPlus size={22} />
                                เพิ่มอุปกรณ์
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <article className="min-h-[138px] rounded-[14px] bg-[#D9D9D9] px-7 py-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <p className="text-[16px] text-[#475467]">อุปกรณ์ทั้งหมด</p>
                            <p className="mt-8 text-[48px] font-bold leading-none text-[#061D36]">
                                {loading ? "-" : config?.summary.totalDevices ?? 0}
                            </p>
                        </article>

                        <article className="min-h-[138px] rounded-[14px] bg-[#D9D9D9] px-7 py-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <p className="text-[16px] text-[#475467]">เชื่อมต่อปกติ</p>
                            <p className="mt-8 text-[48px] font-bold leading-none text-[#061D36]">
                                {loading ? "-" : config?.summary.online ?? 0}
                            </p>
                        </article>

                        <article className="min-h-[138px] rounded-[14px] bg-[#D9D9D9] px-7 py-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <p className="text-[16px] text-[#475467]">ขาดการเชื่อมต่อ</p>
                            <p className="mt-8 text-[48px] font-bold leading-none text-[#061D36]">
                                {loading
                                    ? "-"
                                    : String(config?.summary.offline ?? 0).padStart(2, "0")}
                            </p>
                        </article>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <article className="overflow-hidden rounded-[18px] border border-[#D0D5DD] bg-white shadow-sm">
                            <div className="bg-[#061D36] px-8 py-6">
                                <h3 className="text-[26px] font-bold text-white">
                                    อุปกรณ์ที่มีอยู่ในระบบ
                                </h3>
                            </div>

                            <div className="px-8 py-7">
                                {loading ? (
                                    <div className="space-y-5">
                                        {[1, 2, 3].map((item) => (
                                            <div
                                                key={item}
                                                className="h-14 animate-pulse rounded-xl bg-[#E5E7EB]"
                                            />
                                        ))}
                                    </div>
                                ) : devices.length === 0 ? (
                                    <div className="py-12 text-center text-[#6B7280]">
                                        ไม่พบอุปกรณ์
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {devices.map((device) => (
                                            <div
                                                key={device.id}
                                                className="flex items-center justify-between gap-5 rounded-2xl px-3 py-3 transition hover:bg-[#F8FAFC]"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#061D36] transition group-hover:bg-[#E5E7EB]">
                                                        {getDeviceIcon(device.deviceType)}
                                                    </div>

                                                    <div>
                                                        <p className="text-[20px] font-bold text-[#061D36]">
                                                            {device.deviceName}
                                                        </p>
                                                        <p className="mt-1 text-[15px] text-[#64748B]">
                                                            {device.ipAddress ?? device.deviceCode} •{" "}
                                                            {getConnectionLabel(device.connectionType)} •{" "}
                                                            <span
                                                                className={
                                                                    device.isOnline
                                                                        ? "text-[#16A34A]"
                                                                        : "text-[#EF4444]"
                                                                }
                                                            >
                                                                {device.isOnline
                                                                    ? "เชื่อมต่อปกติ"
                                                                    : "ขาดการเชื่อมต่อ"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-full border border-[#D0D5DD] bg-white px-3 py-1 text-[12px] font-bold text-[#475467]">
                                                        {getDeviceTypeLabel(device.deviceType)}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(device)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#061D36] transition hover:bg-[#E5E7EB]"
                                                    >
                                                        <LuPencil size={18} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteDevice(device.id)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#FF2F2F] transition hover:bg-[#FFF1F1]"
                                                    >
                                                        <LuTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </article>

                        <article className="rounded-[18px] bg-[#D9D9D9] p-6 shadow-sm">
                            <h3 className="text-[26px] font-bold text-[#061D36]">
                                กิจกรรมล่าสุด
                            </h3>

                            <div className="mt-6 space-y-4">
                                <div className="rounded-[18px] bg-white px-5 py-5 transition hover:-translate-y-0.5 hover:shadow-md">
                                    <p className="text-[20px] font-bold text-[#061D36]">
                                        Member login
                                    </p>
                                    <p className="mt-3 text-[15px] text-[#64748B]">
                                        จากครู A, ผู้ใช้ ประสบการณ์ลูกค้าพิเศษ ...
                                    </p>
                                </div>

                                <div className="rounded-[18px] bg-white px-5 py-5 transition hover:-translate-y-0.5 hover:shadow-md">
                                    <p className="text-[20px] font-bold text-[#061D36]">
                                        Backup completed
                                    </p>
                                    <p className="mt-3 text-[15px] text-[#64748B]">
                                        สำรองข้อมูล LPR-04 เสร็จเรียบร้อย
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="mt-6 h-12 w-full rounded-xl border border-[#061D36] text-[16px] font-bold text-[#061D36] transition hover:bg-[#061D36] hover:text-white"
                            >
                                ดูทั้งหมด
                            </button>
                        </article>
                    </div>
                </div>
            </section>

            <DeviceModal
                open={openModal}
                mode={modalMode}
                form={form}
                deviceTypes={config?.masterData.deviceTypes ?? []}
                connectionTypes={config?.masterData.connectionTypes ?? []}
                submitting={submitting}
                onClose={() => setOpenModal(false)}
                onChange={setForm}
                onSubmit={handleSubmitDevice}
            />
        </>
    );
}

export default DevicesPage;