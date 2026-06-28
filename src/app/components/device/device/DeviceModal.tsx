"use client";

import type { Dispatch, SetStateAction } from "react";
import { LuX } from "react-icons/lu";
import type {
    DeviceItem,
    DeviceMasterItem,
    DevicePayload,
} from "@/src/app/type/device/device";

type DeviceActivationResult = {
    success?: boolean;
    message?: string;
    CodeActivate?: string;
    code?: string;
    activationCode?: string;
    deviceId?: string | null;
    device?: DeviceItem;
    deviceToken?: string;
    expiresAt?: string | null;
    expiresIn?: string;
};

type Props = {
    open: boolean;
    mode: "create" | "edit" | "provision";
    form: DevicePayload;
    cameraDevices: DeviceItem[];
    printerDevices: DeviceItem[];
    deviceTypes: DeviceMasterItem[];
    connectionTypes: DeviceMasterItem[];
    submitting: boolean;
    activationResult?: DeviceActivationResult | null;
    onClose: () => void;
    onChange: Dispatch<SetStateAction<DevicePayload>>;
    onSubmit: () => void;
    getActivationCode: (result: DeviceActivationResult | null) => string;
    formatDateTime: (value?: string | null) => string;
};

function DeviceModal({
    open,
    mode,
    form,
    cameraDevices,
    printerDevices,
    deviceTypes,
    connectionTypes,
    submitting,
    activationResult,
    onClose,
    onChange,
    onSubmit,
    getActivationCode,
    formatDateTime,
}: Props) {
    if (!open) return null;

    const normalizedDeviceType = form.deviceType.toLowerCase();
    const isKiosk = normalizedDeviceType === "kiosk";
    const isCamera = normalizedDeviceType === "camera";
    const isPrinter = normalizedDeviceType === "printer";
    const isBarrierGate =
        normalizedDeviceType === "barrier_gate" || normalizedDeviceType === "barrier";
    const isActivationDeviceType = isKiosk || isBarrierGate;
    const isProvisionMode = mode === "provision";
    const usesSetupFields = isActivationDeviceType || isCamera || isPrinter;
    const isActivationCreateFlow = mode === "create" && isActivationDeviceType;
    const selectedCameraIds = form.cameraIds ?? [];
    const selectedPrinterIds = form.printerIds ?? [];
    const directionMatchedCameras = cameraDevices.filter((camera) => {
        if (!getCameraId(camera) || camera.status === "pending_activation") {
            return false;
        }

        if (!form.direction || !camera.direction) return true;

        return camera.direction === form.direction;
    });
    const hiddenCameraCount = cameraDevices.length - directionMatchedCameras.length;
    const offlineCameraCount = directionMatchedCameras.filter(
        (camera) => !camera.isOnline
    ).length;
    const activationCode = getActivationCode(activationResult ?? null);
    const deviceToken = activationResult?.deviceToken ?? "";
    const provisionedDeviceId =
        activationResult?.device?.deviceId ??
        activationResult?.deviceId ??
        form.deviceCode;
    const activationExpiresAt =
        activationResult?.expiresAt ?? form.expiresAt ?? null;
    const statusLabel =
        form.status === "pending_activation"
            ? "รอ Activate"
            : form.status === "active"
              ? "Active"
              : form.status === "offline"
                ? "Offline"
              : "Inactive";
    const statusClassName =
        form.status === "pending_activation"
            ? "text-[#D97706]"
            : form.isOnline
              ? "text-[#16A34A]"
              : "text-[#EF4444]";

    function getCameraId(camera: DeviceItem) {
        return camera.deviceId ?? camera.deviceCode ?? camera.id ?? "";
    }

    const getCameraLabel = (camera: DeviceItem) => {
        const cameraId = getCameraId(camera);
        const direction = camera.direction ? ` / ${camera.direction}` : "";
        const gate = camera.gateId ? ` / ${camera.gateId}` : "";

        return `${camera.deviceName} (${cameraId}${direction}${gate})`;
    };

    function getPrinterId(printer: DeviceItem) {
        return printer.deviceId ?? printer.deviceCode ?? printer.id ?? "";
    }

    const getPrinterLabel = (printer: DeviceItem) => {
        const printerId = getPrinterId(printer);
        const role = printer.printerRole ? ` / ${printer.printerRole}` : "";
        const location = printer.location ? ` / ${printer.location}` : "";

        return `${printer.deviceName} (${printerId}${role}${location})`;
    };

    const handleDeviceTypeChange = (value: string) => {
        const nextIsActivation =
            value === "kiosk" ||
            value === "barrier_gate" ||
            value === "barrier";
        const nextNeedsGate = value === "barrier_gate" || value === "barrier" || value === "camera";
        const nextIsProvisionedDevice = value === "camera" || value === "printer";

        onChange((prev) => ({
            ...prev,
            deviceType: value,
            connectionType:
                nextIsActivation
                    ? ""
                    : nextIsProvisionedDevice
                      ? prev.connectionType || "lan"
                      : prev.connectionType,
            ipAddress:
                nextIsActivation
                    ? null
                    : nextIsProvisionedDevice
                      ? prev.ipAddress ?? ""
                      : prev.ipAddress,
            status:
                nextIsProvisionedDevice
                    ? "active"
                    : nextIsActivation
                      ? "pending_activation"
                      : prev.status,
            isOnline:
                value === "camera"
                    ? true
                    : nextIsActivation
                      ? false
                      : prev.isOnline,
            gateId: nextNeedsGate ? prev.gateId ?? "" : null,
            direction: nextNeedsGate ? prev.direction ?? "IN" : null,
            cameraRole: value === "camera" ? prev.cameraRole ?? "lpr" : null,
            printerRole: value === "printer" ? prev.printerRole ?? "receipt" : null,
            cameraIds:
                value === "barrier_gate" || value === "barrier"
                    ? prev.cameraIds ?? []
                    : [],
            printerIds:
                value === "kiosk" || value === "barrier_gate" || value === "barrier"
                    ? prev.printerIds ?? []
                    : [],
        }));
    };

    const toggleCameraId = (cameraId: string) => {
        onChange((prev) => {
            const currentCameraIds = prev.cameraIds ?? [];
            const nextCameraIds = currentCameraIds.includes(cameraId)
                ? currentCameraIds.filter((item) => item !== cameraId)
                : [...currentCameraIds, cameraId];

            return {
                ...prev,
                cameraIds: nextCameraIds,
            };
        });
    };

    const togglePrinterId = (printerId: string) => {
        onChange((prev) => {
            const currentPrinterIds = prev.printerIds ?? [];
            const nextPrinterIds = currentPrinterIds.includes(printerId)
                ? currentPrinterIds.filter((item) => item !== printerId)
                : [...currentPrinterIds, printerId];

            return {
                ...prev,
                printerIds: nextPrinterIds,
            };
        });
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#26313C]/75 px-4 py-6 backdrop-blur-sm">
            <div className="relative max-h-[calc(100dvh-48px)] w-full max-w-[520px] overflow-y-auto rounded-[14px] bg-white p-5 shadow-2xl sm:p-8">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-6 top-6 text-[#061D36]"
                >
                    <LuX size={22} />
                </button>

                <h2 className="text-[24px] font-bold text-[#061D36]">
                    {mode === "create" ? "เพิ่มอุปกรณ์" : "แก้ไขอุปกรณ์"}
                </h2>

                <p className="mt-1 text-[14px] text-[#6B7280]">
                    {isActivationCreateFlow
                        ? "กรอกชื่อและตำแหน่งเพื่อสร้าง Activation Code"
                        : isActivationDeviceType
                          ? "ตรวจสอบข้อมูล Activation และสถานะล่าสุดของอุปกรณ์"
                        : "กรอกข้อมูลเพื่อตั้งค่าอุปกรณ์เข้าสู่ระบบ"}
                </p>

                {isProvisionMode ? (
                <div className="mt-4 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[13px] font-medium leading-relaxed text-[#1D4ED8]">
                    Provisioning returns a one-time deviceToken for device services or Postman.
                </div>
                ) : null}

                {activationCode || deviceToken ? (
                    <div className="mt-7 rounded-[14px] border border-[#BBF7D0] bg-[#F0FDF4] p-5">
                        <p className="text-[18px] font-bold text-[#166534]">
                            สร้าง Activation Code สำเร็จ
                        </p>
                        {activationResult?.message ? (
                            <p className="mt-1 text-[13px] text-[#15803D]">
                                {activationResult.message}
                            </p>
                        ) : null}

                        <div className="mt-5 rounded-[12px] bg-white p-4">
                            <p className="text-[12px] font-medium text-[#64748B]">
                                {deviceToken ? "Device Token" : "Activation Code"}
                            </p>
                            <p className={`mt-2 break-all font-black text-[#061D36] ${
                                deviceToken
                                    ? "text-[16px] leading-relaxed tracking-normal sm:text-[18px]"
                                    : "text-[28px] leading-none tracking-[4px] sm:text-[36px] sm:tracking-[6px]"
                            }`}>
                                {deviceToken || activationCode}
                            </p>
                            {deviceToken ? (
                            <>
                            <p className="mt-3 text-[12px] font-medium leading-relaxed text-[#D97706]">
                                This token is shown once. Copy it into the device service or Postman environment now.
                            </p>
                            <button
                                type="button"
                                onClick={() => void navigator.clipboard?.writeText(deviceToken)}
                                className="mt-3 h-10 rounded-full bg-[#061D36] px-5 text-[13px] font-bold text-white"
                            >
                                Copy Device Token
                            </button>
                            </>
                            ) : null}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-[10px] bg-white p-3">
                                <p className="text-[12px] text-[#64748B]">
                                    Device ID
                                </p>
                                <p className="mt-1 text-[14px] font-bold text-[#061D36]">
                                    {provisionedDeviceId || activationResult?.deviceId || "รอ Activate"}
                                </p>
                            </div>

                            <div className="rounded-[10px] bg-white p-3">
                                <p className="text-[12px] text-[#64748B]">
                                    {deviceToken ? "Device Type" : "Expires At"}
                                </p>
                                <p className="mt-1 text-[14px] font-bold text-[#061D36]">
                                    {deviceToken ? activationResult?.device?.deviceType ?? "camera" : formatDateTime(activationExpiresAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(!isActivationDeviceType || isCamera || isBarrierGate) ? (
                        <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            รหัสอุปกรณ์
                        </label>
                        <input
                            value={form.deviceCode}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    deviceCode: event.target.value,
                                }))
                            }
                            placeholder={isCamera ? "CAM-OUT-A" : isPrinter ? "PRN-GATE-A" : isBarrierGate ? "BG-GATE-A" : "PRN001"}
                            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        />
                    </div>
                    ) : null}

                    <div className={usesSetupFields ? "sm:col-span-2" : ""}>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            ชื่ออุปกรณ์
                        </label>
                        <input
                            value={form.deviceName}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    deviceName: event.target.value,
                                }))
                            }
                            placeholder="Printer Counter 1"
                            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        />
                    </div>

                    <div className={usesSetupFields ? "sm:col-span-2" : ""}>
                            <label className="mb-2 block text-[13px] text-[#6B7280]">
                                ประเภทอุปกรณ์
                            </label>
                            <select
                                value={form.deviceType}
                                onChange={(event) =>
                                    handleDeviceTypeChange(event.target.value)
                                }
                                disabled={isProvisionMode}
                                className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                            >
                                <option value="">เลือกประเภท</option>

                                {deviceTypes.map((item) => (
                                    <option key={item.code} value={item.code}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                    {usesSetupFields ? (
                    <>
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-[13px] text-[#6B7280]">
                                Location
                            </label>
                            <input
                                value={form.location ?? ""}
                                onChange={(event) =>
                                    onChange((prev) => ({
                                        ...prev,
                                        location: event.target.value,
                                    }))
                                }
                                placeholder="Zone A"
                                className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                            />
                        </div>

                        {(isCamera || isBarrierGate) ? (
                        <>
                            <div>
                                <label className="mb-2 block text-[13px] text-[#6B7280]">
                                    Gate ID
                                </label>
                                <input
                                    value={form.gateId ?? ""}
                                    onChange={(event) =>
                                        onChange((prev) => ({
                                            ...prev,
                                            gateId: event.target.value,
                                        }))
                                    }
                                    placeholder="GATE-A"
                                    className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[13px] text-[#6B7280]">
                                    Direction
                                </label>
                                <select
                                    value={form.direction ?? "IN"}
                                    onChange={(event) =>
                                        onChange((prev) => ({
                                            ...prev,
                                            direction: event.target.value,
                                            cameraIds: isBarrierGate ? [] : prev.cameraIds,
                                        }))
                                    }
                                    className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                                >
                                    <option value="IN">IN</option>
                                    <option value="OUT">OUT</option>
                                </select>
                            </div>
                        </>
                        ) : null}

                        {isCamera ? (
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-[13px] text-[#6B7280]">
                                Camera Role
                            </label>
                            <select
                                value={form.cameraRole ?? "lpr"}
                                onChange={(event) =>
                                    onChange((prev) => ({
                                        ...prev,
                                        cameraRole: event.target.value,
                                    }))
                                }
                                className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                            >
                                <option value="lpr">LPR</option>
                            </select>
                        </div>
                        ) : null}

                        {isPrinter ? (
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-[13px] text-[#6B7280]">
                                Printer Role
                            </label>
                            <select
                                value={form.printerRole ?? "receipt"}
                                onChange={(event) =>
                                    onChange((prev) => ({
                                        ...prev,
                                        printerRole: event.target.value,
                                    }))
                                }
                                className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                            >
                                <option value="receipt">Receipt</option>
                            </select>
                        </div>
                        ) : null}

                        {(isCamera || isPrinter) ? (
                        <>
                            <div>
                                <label className="mb-2 block text-[13px] text-[#6B7280]">
                                    Connection Type
                                </label>
                                <select
                                    value={form.connectionType}
                                    onChange={(event) =>
                                        onChange((prev) => ({
                                            ...prev,
                                            connectionType: event.target.value,
                                        }))
                                    }
                                    className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                                >
                                    <option value="">Select connection</option>
                                    {connectionTypes.map((item) => (
                                        <option key={item.code} value={item.code}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-[13px] text-[#6B7280]">
                                    IP Address
                                </label>
                                <input
                                    value={form.ipAddress ?? ""}
                                    onChange={(event) =>
                                        onChange((prev) => ({
                                            ...prev,
                                            ipAddress: event.target.value || null,
                                        }))
                                    }
                                    placeholder="192.168.1.50"
                                    className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-[13px] text-[#6B7280]">
                                    Note
                                </label>
                                <textarea
                                    value={form.note}
                                    onChange={(event) =>
                                        onChange((prev) => ({
                                            ...prev,
                                            note: event.target.value,
                                        }))
                                    }
                                    placeholder={isPrinter ? "Printer for kiosk and barrier gate" : "Camera for Gate A exit"}
                                    className="min-h-[84px] w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 py-3 text-[14px] outline-none"
                                />
                            </div>
                        </>
                        ) : null}

                        {isBarrierGate ? (
                        <div className="sm:col-span-2">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <label className="block text-[13px] text-[#6B7280]">
                                    Cameras
                                </label>
                                {hiddenCameraCount > 0 ? (
                                <span className="text-[12px] font-medium text-[#D97706]">
                                    Hidden {hiddenCameraCount} camera(s) with different direction
                                </span>
                                ) : null}
                            </div>

                            {offlineCameraCount > 0 ? (
                            <p className="mb-2 rounded-md border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2 text-[12px] font-medium leading-relaxed text-[#C2410C]">
                                {offlineCameraCount} camera(s) are offline. Mapping is allowed, but LPR will work after the camera checks in.
                            </p>
                            ) : null}

                            <div className="max-h-[190px] space-y-2 overflow-y-auto rounded-md border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                                {directionMatchedCameras.length === 0 ? (
                                <p className="text-[13px] text-[#EF4444]">
                                    No activated camera matches this direction.
                                </p>
                                ) : (
                                    directionMatchedCameras.map((camera) => {
                                        const cameraId = getCameraId(camera);
                                        if (!cameraId) return null;

                                        return (
                                            <label
                                                key={cameraId}
                                                className="flex items-start gap-3 rounded-md bg-white px-3 py-2 text-[13px] text-[#061D36]"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCameraIds.includes(cameraId)}
                                                    onChange={() => toggleCameraId(cameraId)}
                                                    className="mt-1 h-4 w-4"
                                                />
                                                <span className="min-w-0 break-words">
                                                    {getCameraLabel(camera)}
                                                    {!camera.isOnline ? (
                                                    <span className="ml-2 font-bold text-[#C2410C]">
                                                        Offline
                                                    </span>
                                                    ) : null}
                                                </span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>

                            <p className="mt-2 text-[12px] text-[#64748B]">
                                Barrier Gate requires at least one activated camera.
                            </p>
                        </div>
                        ) : null}

                        {(isKiosk || isBarrierGate) ? (
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-[13px] text-[#6B7280]">
                                Printers
                            </label>

                            <div className="max-h-[190px] space-y-2 overflow-y-auto rounded-md border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                                {printerDevices.length === 0 ? (
                                <p className="text-[13px] text-[#EF4444]">
                                    No provisioned printer is available.
                                </p>
                                ) : (
                                    printerDevices.map((printer) => {
                                        const printerId = getPrinterId(printer);
                                        if (!printerId) return null;

                                        return (
                                            <label
                                                key={printerId}
                                                className="flex items-start gap-3 rounded-md bg-white px-3 py-2 text-[13px] text-[#061D36]"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPrinterIds.includes(printerId)}
                                                    onChange={() => togglePrinterId(printerId)}
                                                    className="mt-1 h-4 w-4"
                                                />
                                                <span className="min-w-0 break-words">
                                                    {getPrinterLabel(printer)}
                                                </span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>

                            <p className="mt-2 text-[12px] text-[#64748B]">
                                Printer can be linked to both Kiosk and Barrier Gate.
                            </p>
                        </div>
                        ) : null}

                        {mode === "edit" ? (
                        <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2">
                            <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                                <p className="text-[12px] text-[#64748B]">
                                    Device ID
                                </p>
                                <p className="mt-1 text-[14px] font-bold text-[#061D36]">
                                    {form.deviceId ?? "รอ Activate"}
                                </p>
                            </div>

                            <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                                <p className="text-[12px] text-[#64748B]">
                                    สถานะ
                                </p>
                                <p className={`mt-1 text-[14px] font-bold ${statusClassName}`}>
                                    {statusLabel}
                                </p>
                            </div>

                            {form.activationCode ? (
                            <div className="rounded-[10px] border border-[#FEF3C7] bg-[#FFFBEB] p-3 sm:col-span-2">
                                <p className="text-[12px] text-[#92400E]">
                                    Activation Code
                                </p>
                                <p className="mt-1 break-all text-[22px] font-black tracking-[3px] text-[#061D36] sm:text-[24px] sm:tracking-[4px]">
                                    {form.activationCode}
                                </p>
                                {form.expiresAt ? (
                                <p className="mt-2 text-[13px] font-bold text-[#92400E]">
                                    Expires At: {formatDateTime(form.expiresAt)}
                                </p>
                                ) : null}
                            </div>
                            ) : null}
                        </div>
                        ) : null}
                    </>
                    ) : (
                    <>
                        <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            รูปแบบการเชื่อมต่อ
                        </label>
                        <select
                            value={form.connectionType}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    connectionType: event.target.value,
                                }))
                            }
                            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        >
                            <option value="">เลือกรูปแบบ</option>
                            {connectionTypes.map((item) => (
                                <option
                                    key={item.code}
                                    value={item.code}
                                >
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                                    <label className="mb-2 block text-[13px] text-[#6B7280]">
                                        IP ADDRESS
                                    </label>
                                    <input
                                        value={form.ipAddress ?? ""}
                                        onChange={(event) =>
                                            onChange((prev) => ({
                                                ...prev,
                                                ipAddress:
                                                    event.target.value || null,
                                            }))
                                        }
                                        placeholder="192.168.x.x"
                                        className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            สถานะ
                        </label>
                        <select
                            value={form.status}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    status: event.target.value as DevicePayload["status"],
                                }))
                            }
                            className="h-11 w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] outline-none"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <label className="flex h-11 items-center gap-3 rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 text-[14px] text-[#061D36] sm:col-span-2">
                        <input
                            type="checkbox"
                            checked={form.isOnline}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    isOnline: event.target.checked,
                                }))
                            }
                            className="h-4 w-4"
                        />
                        เชื่อมต่อปกติ
                    </label>

                    <div className="sm:col-span-2">
                        <label className="mb-2 block text-[13px] text-[#6B7280]">
                            หมายเหตุ
                        </label>
                        <textarea
                            value={form.note}
                            onChange={(event) =>
                                onChange((prev) => ({
                                    ...prev,
                                    note: event.target.value,
                                }))
                            }
                            placeholder="Counter receipt printer"
                            className="min-h-[84px] w-full rounded-md border border-[#E5E7EB] bg-[#F1F2F3] px-4 py-3 text-[14px] outline-none"
                        />
                    </div>
                    </>
                    )}
                </div>
                )}

                <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 min-w-[110px] rounded-full bg-[#9CA3AF] px-6 text-[14px] font-bold text-white"
                    >
                        {activationCode ? "ปิด" : "ยกเลิก"}
                    </button>

                    {!activationCode && !deviceToken ? (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitting}
                        className="h-11 min-w-[110px] rounded-full bg-[#061D36] px-6 text-[14px] font-bold text-white disabled:opacity-60"
                    >
                        {submitting
                            ? "กำลังบันทึก..."
                            : isProvisionMode
                                ? "Provision Camera"
                                : isActivationCreateFlow
                                ? "สร้าง Code"
                                : "ตกลง"}
                    </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default DeviceModal;
