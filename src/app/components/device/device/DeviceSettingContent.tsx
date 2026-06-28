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
    CameraProvisionResponse,
    PrinterProvisionResponse,
    DeviceMasterItem,
    DevicePayload,
    DevicesConfigResponse,
} from "@/src/app/type/device/device";

const KIOSK_DEVICE_TYPE = "kiosk";
const BARRIER_GATE_DEVICE_TYPE = "barrier_gate";
const CAMERA_DEVICE_TYPE = "camera";
const PRINTER_DEVICE_TYPE = "printer";
const DEVICE_TYPES: DeviceMasterItem[] = [
    { code: "kiosk", label: "ตู้ Kiosk" },
    { code: "barrier_gate", label: "Barrier Gate" },
    { code: "camera", label: "LPR Camera" },
    { code: "printer", label: "Printer" },
];
const ACTIVATION_DEVICE_TYPES = DEVICE_TYPES.filter(
    (item) =>
        item.code === KIOSK_DEVICE_TYPE ||
        item.code === BARRIER_GATE_DEVICE_TYPE
);
const CAMERA_PROVISION_DEVICE_TYPES = DEVICE_TYPES.filter(
    (item) => item.code === CAMERA_DEVICE_TYPE
);
const PRINTER_PROVISION_DEVICE_TYPES = DEVICE_TYPES.filter(
    (item) => item.code === PRINTER_DEVICE_TYPE
);
const CONNECTION_TYPES: DeviceMasterItem[] = [
    { code: "lan", label: "LAN" },
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
    success?: boolean;
    device?: CameraProvisionResponse["device"] | PrinterProvisionResponse["device"];
    deviceToken?: string;
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

function isCameraType(type: string) {
    return type.toLowerCase() === CAMERA_DEVICE_TYPE;
}

function isPrinterType(type: string) {
    return type.toLowerCase() === PRINTER_DEVICE_TYPE;
}

function isActivationDeviceType(type: string) {
    return isKioskType(type) || isBarrierGateType(type);
}

function getDeviceIcon(type: string) {
    if (isKioskType(type)) {
        return <LuMonitor className="text-[20px]" />;
    }

    if (type === "lpr" || isCameraType(type)) {
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

    if (isActivationDeviceType(form.deviceType) || isCameraType(form.deviceType)) {
        payload.location = form.location?.trim() || null;
    }

    if (isCameraType(form.deviceType) || isBarrierGateType(form.deviceType)) {
        payload.gateId = form.gateId?.trim() || null;
        payload.direction = form.direction || null;
    }

    if (isCameraType(form.deviceType)) {
        payload.cameraRole = form.cameraRole?.trim() || null;
    }

    if (isPrinterType(form.deviceType)) {
        payload.printerRole = form.printerRole?.trim() || null;
    }

    if (isBarrierGateType(form.deviceType)) {
        payload.cameraIds = form.cameraIds ?? [];
    }

    if (isKioskType(form.deviceType) || isBarrierGateType(form.deviceType)) {
        payload.printerIds = form.printerIds ?? [];
    }

    return payload;
}

function getDeviceIdentity(device: DeviceItem) {
    return device.deviceId ?? device.deviceCode ?? device.id ?? "";
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
    const [cameraDevices, setCameraDevices] = useState<DeviceItem[]>([]);
    const [printerDevices, setPrinterDevices] = useState<DeviceItem[]>([]);
    const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "provision">("create");
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

            const requestOptions: RequestInit = {
                method: "GET",
                headers: {
                    ...getAuthHeaders(token),
                },
                cache: "no-store",
            };

            const [response, cameraResponse, printerResponse] = await Promise.all([
                fetch("/api/devices/devices", requestOptions),
                fetch("/api/devices/devices?deviceType=camera", requestOptions),
                fetch("/api/devices/devices?deviceType=printer", requestOptions),
            ]);

            const result = await response.json().catch(() => null);
            const cameraResult = await cameraResponse.json().catch(() => null);
            const printerResult = await printerResponse.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "โหลดข้อมูลอุปกรณ์ไม่สำเร็จ"));
            }

            const normalizedConfig = result as DevicesConfigResponse;

            setConfig(normalizedConfig);
            if (cameraResponse.ok && cameraResult) {
                setCameraDevices((cameraResult as DevicesConfigResponse).devices ?? []);
            } else {
                setCameraDevices(
                    normalizedConfig.devices.filter((device) =>
                        isCameraType(device.deviceType)
                    )
                );
            }
            if (printerResponse.ok && printerResult) {
                setPrinterDevices((printerResult as DevicesConfigResponse).devices ?? []);
            } else {
                setPrinterDevices(
                    normalizedConfig.devices.filter((device) =>
                        isPrinterType(device.deviceType)
                    )
                );
            }
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
                    eventType === "device_activation_completed" ||
                    eventType === "device_provisioned" ||
                    eventType === "device_deleted" ||
                    eventType === "devices_config_updated"
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
    const displayedDevices = useMemo(() => {
        if (deviceTypeFilter === "all") {
            return devices;
        }

        return devices.filter((device) => {
            if (deviceTypeFilter === BARRIER_GATE_DEVICE_TYPE) {
                return isBarrierGateType(device.deviceType);
            }

            return device.deviceType === deviceTypeFilter;
        });
    }, [deviceTypeFilter, devices]);

    const deviceFilterOptions = useMemo(() => {
        return [
            { code: "all", label: "All" },
            ...DEVICE_TYPES.filter((item) =>
                item.code === CAMERA_DEVICE_TYPE
                    ? devices.some((device) => isCameraType(device.deviceType)) ||
                      cameraDevices.length > 0
                    : true
            ),
        ];
    }, [cameraDevices.length, devices]);

    const deviceTypes = useMemo(() => {
        return DEVICE_TYPES;
    }, []);

    const modalDeviceTypes = useMemo(() => {
        if (modalMode === "provision") {
            if (form.deviceType === PRINTER_DEVICE_TYPE) {
                return PRINTER_PROVISION_DEVICE_TYPES;
            }

            return CAMERA_PROVISION_DEVICE_TYPES;
        }

        if (modalMode === "create") {
            return ACTIVATION_DEVICE_TYPES;
        }

        return DEVICE_TYPES;
    }, [form.deviceType, modalMode]);

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

    function getDeviceTypeCount(code: string) {
        if (code === "all") {
            return devices.length;
        }

        return devices.filter((device) =>
            code === BARRIER_GATE_DEVICE_TYPE
                ? isBarrierGateType(device.deviceType)
                : device.deviceType === code
        ).length;
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
            deviceType: ACTIVATION_DEVICE_TYPES[0]?.code ?? "",
            connectionType: "",
            direction: "IN",
            cameraIds: [],
            printerIds: [],
        });

        setOpenModal(true);
    }

    function handleOpenProvisionCamera() {
        setMessage("");
        setModalMode("provision");
        setEditingId(null);
        setActivationResult(null);

        setForm({
            ...DEFAULT_FORM,
            deviceType: CAMERA_DEVICE_TYPE,
            connectionType: "lan",
            ipAddress: "",
            status: "active",
            isOnline: true,
            direction: "OUT",
            cameraRole: "lpr",
            cameraIds: [],
        });

        setOpenModal(true);
    }

    function handleOpenProvisionPrinter() {
        setMessage("");
        setModalMode("provision");
        setEditingId(null);
        setActivationResult(null);

        setForm({
            ...DEFAULT_FORM,
            deviceType: PRINTER_DEVICE_TYPE,
            connectionType: "lan",
            ipAddress: "",
            status: "active",
            isOnline: true,
            printerRole: "receipt",
            cameraIds: [],
            printerIds: [],
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
            gateId: latestDevice.gateId ?? "",
            direction: latestDevice.direction ?? "IN",
            cameraRole: latestDevice.cameraRole ?? "lpr",
            printerRole: latestDevice.printerRole ?? "receipt",
            cameraIds: latestDevice.cameraIds ?? [],
            printerIds: latestDevice.printerIds ?? [],
        });

        setOpenModal(true);
    }

    async function handleSubmitDevice() {
        try {
            setSubmitting(true);
            setError("");
            setMessage("");

            const token = getToken();
            const needsGateMapping =
                isCameraType(form.deviceType) || isBarrierGateType(form.deviceType);

            if (needsGateMapping && (!form.gateId?.trim() || !form.direction)) {
                throw new Error("Gate ID and direction are required for Camera and Barrier Gate");
            }

            if (isBarrierGateType(form.deviceType)) {
                const selectedCameraIds = (form.cameraIds ?? []).filter(Boolean);
                if (selectedCameraIds.length === 0) {
                    throw new Error("Barrier Gate must be mapped with at least one camera");
                }

                const mismatchedCamera = cameraDevices.find((camera) => {
                    const cameraId = getDeviceIdentity(camera);
                    return (
                        selectedCameraIds.includes(cameraId) &&
                        Boolean(camera.direction) &&
                        Boolean(form.direction) &&
                        camera.direction !== form.direction
                    );
                });

                if (mismatchedCamera) {
                    throw new Error(
                        `Camera ${getDeviceIdentity(mismatchedCamera)} direction does not match Barrier Gate`
                    );
                }
            }

            if (isKioskType(form.deviceType) || isBarrierGateType(form.deviceType)) {
                const selectedPrinterIds = (form.printerIds ?? []).filter(Boolean);
                if (selectedPrinterIds.length === 0) {
                    throw new Error("Select at least one printer for this device");
                }
            }

            if (modalMode === "provision") {
                const name = form.deviceName.trim();
                const location = form.location?.trim() ?? "";
                const deviceCode = form.deviceCode.trim();
                const ipAddress = form.ipAddress?.trim() ?? "";
                const connectionType = form.connectionType.trim();
                const isPrinterProvision = isPrinterType(form.deviceType);

                if (!name || !deviceCode || !location) {
                    throw new Error("Device name, code and location are required");
                }

                if (!isPrinterProvision && (!form.gateId?.trim() || !form.direction)) {
                    throw new Error("Camera name, code, location, Gate ID and direction are required");
                }

                if (!connectionType || !ipAddress) {
                    throw new Error("Camera connection type and IP address are required");
                }

                const response = await fetch(
                    isPrinterProvision
                        ? "/api/devices/devices/printers/provision"
                        : "/api/devices/devices/cameras/provision",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeaders(token),
                    },
                    body: JSON.stringify(
                        isPrinterProvision
                            ? {
                                  deviceName: name,
                                  deviceCode,
                                  location,
                                  connectionType,
                                  ipAddress,
                                  printerRole: form.printerRole?.trim() || "receipt",
                                  note: form.note.trim() || undefined,
                              }
                            : {
                                  deviceName: name,
                                  deviceCode,
                                  location,
                                  gateId: form.gateId?.trim(),
                                  direction: form.direction,
                                  cameraRole: form.cameraRole?.trim() || "lpr",
                                  connectionType,
                                  ipAddress,
                                  note: form.note.trim() || undefined,
                              }
                    ),
                    cache: "no-store",
                });

                const result = (await response.json().catch(() => null)) as
                    | DeviceActivationResult
                    | null;

                if (!response.ok || !result) {
                    throw new Error(
                        getErrorMessage(result, isPrinterProvision ? "Provision Printer failed" : "Provision LPR Camera failed")
                    );
                }

                setActivationResult(result);
                await fetchConfig();
                return;
            }

            if (
                modalMode === "create" &&
                isActivationDeviceType(form.deviceType)
            ) {
                const name = form.deviceName.trim();
                const location = form.location?.trim() ?? "";
                const activationPayload = isBarrierGateType(form.deviceType)
                      ? {
                            deviceName: name,
                            deviceType: BARRIER_GATE_DEVICE_TYPE,
                            deviceCode: form.deviceCode || undefined,
                            location,
                            gateId: form.gateId?.trim(),
                            direction: form.direction,
                            cameraIds: (form.cameraIds ?? []).filter(Boolean),
                            printerIds: (form.printerIds ?? []).filter(Boolean),
                        }
                      : {
                            name,
                            deviceName: name,
                            deviceType: form.deviceType,
                            deviceCode: form.deviceCode || undefined,
                            location,
                            printerIds: (form.printerIds ?? []).filter(Boolean),
                            connectionType: form.connectionType || undefined,
                            note: form.note || undefined,
                        };

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
                        body: JSON.stringify(activationPayload),
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

                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <h2 className="border-l-[6px] border-[#061D36] pl-3 text-[24px] font-bold text-[#1F2937] sm:border-l-[8px] sm:pl-4 sm:text-[32px]">
                            การตั้งค่าอุปกรณ์
                        </h2>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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
                                onClick={handleOpenProvisionCamera}
                                className="inline-flex h-12 items-center gap-3 rounded-full border border-[#061D36] bg-white px-6 text-[14px] font-bold text-[#061D36] transition hover:bg-[#F3F4F6] active:scale-[0.98]"
                            >
                                <LuCamera size={21} />
                                Provision LPR Camera
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenProvisionPrinter}
                                className="inline-flex h-12 items-center gap-3 rounded-full border border-[#061D36] bg-white px-6 text-[14px] font-bold text-[#061D36] transition hover:bg-[#F3F4F6] active:scale-[0.98]"
                            >
                                <LuPrinter size={21} />
                                Provision Printer
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

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-8 md:grid-cols-3 md:gap-6">
                        <article className="min-h-[112px] rounded-[14px] bg-[#D9D9D9] px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:py-5 md:min-h-[138px] md:px-7 md:py-7">
                            <p className="text-[14px] text-[#475467] sm:text-[15px] md:text-[16px]">อุปกรณ์ทั้งหมด</p>
                            <p className="mt-5 text-[36px] font-bold leading-none text-[#061D36] sm:text-[42px] md:mt-8 md:text-[48px]">
                                {loading ? "-" : config?.total ?? 0}
                            </p>
                        </article>

                        <article className="min-h-[112px] rounded-[14px] bg-[#D9D9D9] px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:py-5 md:min-h-[138px] md:px-7 md:py-7">
                            <p className="text-[14px] text-[#475467] sm:text-[15px] md:text-[16px]">เชื่อมต่อปกติ</p>
                            <p className="mt-5 text-[36px] font-bold leading-none text-[#061D36] sm:text-[42px] md:mt-8 md:text-[48px]">
                                {loading ? "-" : config?.online ?? 0}
                            </p>
                        </article>

                        <article className="min-h-[112px] rounded-[14px] bg-[#D9D9D9] px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 sm:px-5 sm:py-5 md:col-span-1 md:min-h-[138px] md:px-7 md:py-7">
                            <p className="text-[14px] text-[#475467] sm:text-[15px] md:text-[16px]">ขาดการเชื่อมต่อ</p>
                            <p className="mt-5 text-[36px] font-bold leading-none text-[#061D36] sm:text-[42px] md:mt-8 md:text-[48px]">
                                {loading
                                    ? "-"
                                    : String(config?.offline ?? 0).padStart(2, "0")}
                            </p>
                        </article>
                    </div>

                    <div className="mt-10 grid min-w-0 max-w-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <article className="min-w-0 overflow-hidden rounded-[18px] border border-[#D0D5DD] bg-white shadow-sm">
                            <div className="bg-[#061D36] px-4 py-5 sm:px-8 sm:py-6">
                                <h3 className="text-[22px] font-bold text-white sm:text-[26px]">
                                    อุปกรณ์ที่มีอยู่ในระบบ
                                </h3>
                            </div>

                            <div className="flex gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4 py-3 sm:px-8">
                                {deviceFilterOptions.map((item) => (
                                    <button
                                        key={item.code}
                                        type="button"
                                        onClick={() => setDeviceTypeFilter(item.code)}
                                        className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
                                            deviceTypeFilter === item.code
                                                ? "border-[#061D36] bg-[#061D36] text-white"
                                                : "border-[#D0D5DD] bg-white text-[#475467] hover:border-[#061D36]"
                                        }`}
                                    >
                                        {item.label} ({getDeviceTypeCount(item.code)})
                                    </button>
                                ))}
                            </div>

                            <div className="px-4 py-5 sm:px-8 sm:py-7">
                                {loading ? (
                                    <div className="space-y-5">
                                        {[1, 2, 3].map((item) => (
                                            <div
                                                key={item}
                                                className="h-14 animate-pulse rounded-xl bg-[#E5E7EB]"
                                            />
                                        ))}
                                    </div>
                                ) : displayedDevices.length === 0 ? (
                                    <div className="py-12 text-center text-[#6B7280]">
                                        ไม่พบอุปกรณ์
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {displayedDevices.map((device) => {
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
                                            const gateDetails = [
                                                device.gateId ? `Gate: ${device.gateId}` : null,
                                                device.direction ? `Direction: ${device.direction}` : null,
                                                isCameraType(device.deviceType) && device.cameraRole
                                                    ? `Role: ${device.cameraRole}`
                                                    : null,
                                                isPrinterType(device.deviceType) && device.printerRole
                                                    ? `Role: ${device.printerRole}`
                                                    : null,
                                                isBarrierGateType(device.deviceType) &&
                                                device.cameraIds?.length
                                                    ? `Cameras: ${device.cameraIds.join(", ")}`
                                                    : null,
                                                (isKioskType(device.deviceType) ||
                                                    isBarrierGateType(device.deviceType)) &&
                                                device.printerIds?.length
                                                    ? `Printers: ${device.printerIds.join(", ")}`
                                                    : null,
                                            ].filter(Boolean);

                                            return (
                                                <div
                                                    key={device.id ?? device.deviceId ?? device.deviceName}
                                                    className="flex min-w-0 flex-col gap-4 rounded-2xl px-3 py-3 transition hover:bg-[#F8FAFC] sm:flex-row sm:items-center sm:justify-between sm:gap-5"
                                                >
                                                    <div className="flex min-w-0 items-center gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#061D36] transition group-hover:bg-[#E5E7EB]">
                                                            {getDeviceIcon(device.deviceType)}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-[18px] font-bold text-[#061D36] sm:text-[20px]">
                                                                {device.deviceName}
                                                            </p>
                                                            <p className="mt-1 break-words text-[14px] text-[#64748B] sm:text-[15px]">
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
                                                            {gateDetails.length > 0 ? (
                                                            <p className="mt-1 break-words text-[13px] font-medium text-[#475467]">
                                                                {gateDetails.join(" / ")}
                                                            </p>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 flex-wrap items-center gap-3">
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

                        <article className="min-w-0 rounded-[18px] bg-[#D9D9D9] p-4 shadow-sm sm:p-6">
                            <h3 className="text-[22px] font-bold text-[#061D36] sm:text-[26px]">
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
                cameraDevices={cameraDevices}
                printerDevices={printerDevices}
                deviceTypes={modalDeviceTypes}
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
