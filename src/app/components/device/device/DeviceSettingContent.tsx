"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    LuCamera,
    LuMonitor,
    LuPencil,
    LuPlus,
    LuPrinter,
    LuRefreshCw,
    LuTrash2,
    LuWarehouse,
} from "react-icons/lu";
import DeviceModal from "@/src/app/components/device/device/DeviceModal";
import type {
    DeviceItem,
    DeviceActivationCodeCreateResponse,
    DeviceMasterItem,
    DevicePayload,
    DevicesConfigResponse,
} from "@/src/app/type/device/device";

const KIOSK_DEVICE_TYPE = "kiosk";
const BARRIER_GATE_DEVICE_TYPE = "barrier_gate";
const DEVICE_TYPES: DeviceMasterItem[] = [
    { code: "kiosk", label: "ตู้ Kiosk" },
    { code: "barrier_gate", label: "Barrier Gate" },
    { code: "camera", label: "Camera" },
    { code: "printer", label: "Printer" },
    { code: "lpr", label: "LPR" },
];
const CONNECTION_TYPES: DeviceMasterItem[] = [
    { code: "network", label: "Network" },
    { code: "usb", label: "USB" },
    { code: "serial", label: "Serial" },
];

const DEFAULT_FORM: DevicePayload = {
    deviceCode: "",
    deviceName: "",
    deviceType: "",
    connectionType: "",
    ipAddress: null,
    status: "active",
    isOnline: true,
    note: "",
    location: "",
};

type DeviceActivationResult = Partial<DeviceActivationCodeCreateResponse> & {
    message?: string;
    deviceId?: string | null;
};

type DeviceEventPayload = {
    type?: string;
    id?: string;
    deviceId?: string | null;
    activationCode?: string | null;
    code?: string | null;
    deviceName?: string | null;
    deviceType?: string;
    status?: string;
    isOnline?: boolean;
};

function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function getAuthHeaders(token: string | null): Record<string, string> {
    if (!token) return {};

    return {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };
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

function isKioskType(type: string) {
    return type.toLowerCase() === KIOSK_DEVICE_TYPE;
}

function isBarrierGateType(type: string) {
    const normalizedType = type.toLowerCase();

    return (
        normalizedType === BARRIER_GATE_DEVICE_TYPE ||
        normalizedType === "barrier"
    );
}

function isActivationDeviceType(type: string) {
    return isKioskType(type) || isBarrierGateType(type);
}

function getDeviceIcon(type: string) {
    if (isKioskType(type)) {
        return <LuMonitor className="text-[20px]" />;
    }

    if (type === "lpr") {
        return <LuCamera className="text-[20px]" />;
    }

    if (isBarrierGateType(type)) {
        return <LuWarehouse className="text-[20px]" />;
    }

    return <LuPrinter className="text-[20px]" />;
}

function toDevicePayload(form: DevicePayload): DevicePayload {
    const payload: DevicePayload = {
        deviceCode: form.deviceCode,
        deviceName: form.deviceName,
        deviceType: form.deviceType,
        connectionType: form.connectionType,
        ipAddress: form.ipAddress,
        status: form.status,
        isOnline: form.isOnline,
        note: form.note,
    };

    if (isActivationDeviceType(form.deviceType)) {
        payload.location = form.location?.trim() || null;
    }

    return payload;
}

function getActivationCode(result: DeviceActivationResult | null) {
    return result?.CodeActivate ?? "";
}

function formatDateTime(value?: string | null) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function DevicesPage() {
    const [config, setConfig] = useState<DevicesConfigResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<DevicePayload>(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [activationResult, setActivationResult] =
        useState<DeviceActivationResult | null>(null);
    const openModalRef = useRef(openModal);
    const modalModeRef = useRef(modalMode);
    const formRef = useRef(form);
    const activationResultRef = useRef(activationResult);

    useEffect(() => {
        openModalRef.current = openModal;
        modalModeRef.current = modalMode;
        formRef.current = form;
        activationResultRef.current = activationResult;
    }, [activationResult, form, modalMode, openModal]);

    async function fetchConfig(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError("");

            const token = getToken();

            const response = await fetch("/api/devices/devices", {
                method: "GET",
                headers: {
                    ...getAuthHeaders(token),
                },
                cache: "no-store",
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "โหลดข้อมูลอุปกรณ์ไม่สำเร็จ"));
            }

            const normalizedConfig = result as DevicesConfigResponse;

            setConfig(normalizedConfig);
            return normalizedConfig;
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
        fetchConfig();

        const intervalId = window.setInterval(() => {
            fetchConfig(false);
        }, 60000);

        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const token = getToken();
        const controller = new AbortController();
        let reconnectTimer: number | undefined;

        const handleDeviceEvent = async (event: MessageEvent<string>) => {
            try {
                const data = JSON.parse(event.data) as DeviceEventPayload;
                const eventType = data.type ?? event.type;

                if (
                    eventType === "device_status_changed" ||
                    eventType === "device_activation_expired" ||
                    eventType === "device_activated" ||
                    eventType === "device_activation_success" ||
                    eventType === "device_activation_completed"
                ) {
                    const latestConfig = await fetchConfig(false);

                    if (eventType === "device_activation_expired") {
                        setMessage("Activation Code หมดอายุ ระบบลบรายการรอ Activate แล้ว");
                        return;
                    }

                    const activeCode = getActivationCode(activationResultRef.current);
                    const currentForm = formRef.current;
                    const activatedDevice = latestConfig?.devices.find((device) => {
                        const sameEventDevice =
                            Boolean(data.deviceId) && device.deviceId === data.deviceId;
                        const sameEventCode =
                            Boolean(activeCode) &&
                            (data.activationCode === activeCode ||
                                data.code === activeCode ||
                                device.activationCode === activeCode);
                        const samePendingName =
                            Boolean(activeCode) &&
                            !data.deviceId &&
                            device.deviceName === currentForm.deviceName &&
                            device.location === currentForm.location &&
                            device.status !== "pending_activation";

                        return sameEventDevice || sameEventCode || samePendingName;
                    });

                    const activationSucceeded =
                        eventType === "device_activated" ||
                        eventType === "device_activation_success" ||
                        eventType === "device_activation_completed" ||
                        data.status === "active" ||
                        Boolean(activatedDevice?.deviceId);

                    if (
                        openModalRef.current &&
                        modalModeRef.current === "create" &&
                        activeCode &&
                        activationSucceeded &&
                        (activatedDevice ||
                            data.deviceId ||
                            data.activationCode === activeCode ||
                            data.code === activeCode)
                    ) {
                        setOpenModal(false);
                        setActivationResult(null);
                        setMessage(
                            `${activatedDevice?.deviceName ?? currentForm.deviceName} Activate สำเร็จแล้ว`
                        );
                    }

                    if (data.type === "device_activation_expired") {
                        setMessage("Activation Code หมดอายุ ระบบลบรายการรอ Activate แล้ว");
                    }
                }
            } catch {
                fetchConfig(false);
            }
        };

        async function connect() {
            try {
                const response = await fetch("/api/devices/devices/events", {
                    headers: {
                        Accept: "text/event-stream",
                        ...getAuthHeaders(token),
                    },
                    signal: controller.signal,
                });
                if (!response.ok || !response.body) throw new Error("SSE unavailable");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (!controller.signal.aborted) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const chunks = buffer.split(/\r?\n\r?\n/);
                    buffer = chunks.pop() ?? "";
                    for (const chunk of chunks) {
                        const dataText = chunk
                            .split(/\r?\n/)
                            .filter((line) => line.startsWith("data:"))
                            .map((line) => line.slice(5).trim())
                            .join("\n");
                        if (dataText) {
                            await handleDeviceEvent(new MessageEvent("message", { data: dataText }));
                        }
                    }
                }
            } catch {
                if (controller.signal.aborted) return;
                await fetchConfig(false);
                reconnectTimer = window.setTimeout(connect, 5000);
            }
        }

        void connect();

        return () => {
            controller.abort();
            if (reconnectTimer) window.clearTimeout(reconnectTimer);
        };
    }, []);

    const devices = useMemo(() => config?.devices ?? [], [config]);

    const deviceTypes = useMemo(() => {
        return DEVICE_TYPES;
    }, []);

    const connectionTypes = useMemo(() => {
        return CONNECTION_TYPES;
    }, []);

    function getDeviceTypeLabel(code: string) {
        const masterLabel =
            DEVICE_TYPES.find((item) => item.code === code)
                ?.label ?? null;

        if (masterLabel) {
            return masterLabel;
        }

        if (isKioskType(code)) {
            return "ตู้ Kiosk";
        }

        if (isBarrierGateType(code)) {
            return "Barrier Gate";
        }

        return code;
    }

    function getConnectionLabel(code: string) {
        return (
            CONNECTION_TYPES.find((item) => item.code === code)
                ?.label ?? code
        );
    }

    function handleCloseModal() {
        setOpenModal(false);
        setActivationResult(null);
    }

    function handleOpenCreate() {
        setMessage("");
        setModalMode("create");
        setEditingId(null);
        setActivationResult(null);

        setForm({
            ...DEFAULT_FORM,
            deviceType: deviceTypes[0]?.code ?? "",
            connectionType: connectionTypes[0]?.code ?? "",
        });

        setOpenModal(true);
    }

    async function handleOpenEdit(device: DeviceItem) {
        setMessage("");
        setModalMode("edit");
        setActivationResult(null);

        const latestConfig = await fetchConfig(false);
        const latestDevice =
            latestConfig?.devices.find((item) =>
                item.deviceId === device.deviceId || item.id === device.id
            ) ??
            device;

        setEditingId(latestDevice.deviceId ?? latestDevice.id ?? null);
        setForm({
            deviceId: latestDevice.deviceId ?? null,
            activationCode: latestDevice.activationCode ?? null,
            expiresAt:
                latestDevice.activationExpiresAt ?? null,
            activationExpiresAt: latestDevice.activationExpiresAt ?? null,
            deviceCode: latestDevice.deviceCode ?? "",
            deviceName: latestDevice.deviceName,
            deviceType: latestDevice.deviceType,
            connectionType: latestDevice.connectionType ?? "",
            ipAddress: latestDevice.ipAddress ?? null,
            status: latestDevice.status,
            isOnline: latestDevice.isOnline,
            note: latestDevice.note ?? "",
            location: latestDevice.location ?? "",
        });

        setOpenModal(true);
    }

    async function handleSubmitDevice() {
        try {
            setSubmitting(true);
            setError("");
            setMessage("");

            const token = getToken();

            if (
                modalMode === "create" &&
                isActivationDeviceType(form.deviceType)
            ) {
                const name = form.deviceName.trim();
                const location = form.location?.trim() ?? "";

                if (!name || !location) {
                    throw new Error("กรุณากรอกชื่ออุปกรณ์และตำแหน่งให้ครบถ้วน");
                }

                const response = await fetch(
                    "/api/devices/devices",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...getAuthHeaders(token),
                        },
                        body: JSON.stringify({
                            name,
                            deviceName: name,
                            deviceType: form.deviceType,
                            deviceCode: form.deviceCode || undefined,
                            location,
                            connectionType: form.connectionType || undefined,
                            note: form.note || undefined,
                        }),
                        cache: "no-store",
                    }
                );

                const result = (await response.json().catch(() => null)) as
                    | DeviceActivationResult
                    | null;

                if (!response.ok || !result) {
                    throw new Error(
                        getErrorMessage(result, "สร้าง Activation Code ไม่สำเร็จ")
                    );
                }

                setActivationResult(result);
                await fetchConfig();
                return;
            }

            const url =
                modalMode === "edit" && editingId
                    ? `/api/devices/devices/${editingId}`
                    : "/api/devices/devices";

            const response = await fetch(url, {
                method: modalMode === "edit" ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(token),
                },
                body: JSON.stringify({
                    ...toDevicePayload(form),
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "บันทึกข้อมูลอุปกรณ์ไม่สำเร็จ"));
            }

            setOpenModal(false);
            setForm(DEFAULT_FORM);
            setActivationResult(null);
            await fetchConfig();
            setMessage("บันทึกข้อมูลอุปกรณ์เรียบร้อยแล้ว");
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteDevice(id: string) {
        try {
            setError("");
            setMessage("");

            const token = getToken();

            const response = await fetch(
                `/api/devices/devices/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        ...getAuthHeaders(token),
                    },
                }
            );

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "ลบอุปกรณ์ไม่สำเร็จ"));
            }

            await fetchConfig();
            setMessage("ลบอุปกรณ์เรียบร้อยแล้ว");
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        }
    }

    async function handleRefreshConfig() {
        setMessage("");
        await fetchConfig();
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

                    {message ? (
                        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-700">
                            {message}
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
                                onClick={handleRefreshConfig}
                                disabled={loading}
                                className="flex h-12 w-12 items-center justify-center rounded-full text-[#061D36] transition hover:bg-[#E5E7EB] disabled:opacity-50"
                                title="Refresh"
                            >
                                <LuRefreshCw
                                    size={26}
                                    className={loading ? "animate-spin" : ""}
                                />
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
                                {loading ? "-" : config?.total ?? 0}
                            </p>
                        </article>

                        <article className="min-h-[138px] rounded-[14px] bg-[#D9D9D9] px-7 py-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <p className="text-[16px] text-[#475467]">เชื่อมต่อปกติ</p>
                            <p className="mt-8 text-[48px] font-bold leading-none text-[#061D36]">
                                {loading ? "-" : config?.online ?? 0}
                            </p>
                        </article>

                        <article className="min-h-[138px] rounded-[14px] bg-[#D9D9D9] px-7 py-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <p className="text-[16px] text-[#475467]">ขาดการเชื่อมต่อ</p>
                            <p className="mt-8 text-[48px] font-bold leading-none text-[#061D36]">
                                {loading
                                    ? "-"
                                    : String(config?.offline ?? 0).padStart(2, "0")}
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
                                        {devices.map((device) => {
                                            const deviceDetail =
                                                device.deviceId ??
                                                device.ipAddress ??
                                                device.activationCode ??
                                                device.deviceCode ??
                                                "-";

                                            const connectionLabel =
                                                isActivationDeviceType(device.deviceType)
                                                    ? device.location ?? "Activation Code"
                                                    : getConnectionLabel(device.connectionType ?? "");
                                            const isPendingActivation =
                                                device.status ===
                                                "pending_activation";

                                            return (
                                                <div
                                                    key={device.id ?? device.deviceId ?? device.deviceName}
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
                                                                {deviceDetail} • {connectionLabel} •{" "}
                                                                <span
                                                                    className={
                                                                        isPendingActivation
                                                                            ? "text-[#D97706]"
                                                                            : device.isOnline
                                                                                ? "text-[#16A34A]"
                                                                                : "text-[#EF4444]"
                                                                    }
                                                                >
                                                                    {isPendingActivation
                                                                        ? "รอ Activate"
                                                                        : device.isOnline
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
                                                            onClick={() =>
                                                                handleDeleteDevice(device.deviceId ?? device.id ?? "")
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#FF2F2F] transition hover:bg-[#FFF1F1]"
                                                        >
                                                            <LuTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </article>

                        <article className="rounded-[18px] bg-[#D9D9D9] p-6 shadow-sm">
                            <h3 className="text-[26px] font-bold text-[#061D36]">
                                กิจกรรมล่าสุด
                            </h3>

                            <div className="mt-6 rounded-[18px] bg-white px-5 py-8 text-center text-[15px] text-[#64748B]">
                                ยังไม่มีกิจกรรมล่าสุด
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
                deviceTypes={deviceTypes}
                connectionTypes={connectionTypes}
                submitting={submitting}
                activationResult={activationResult}
                onClose={handleCloseModal}
                onChange={setForm}
                onSubmit={handleSubmitDevice}
                getActivationCode={getActivationCode}
                formatDateTime={formatDateTime}
            />
        </>
    );
}

export default DevicesPage;
