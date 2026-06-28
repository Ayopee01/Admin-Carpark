import { apiRequest } from "./apiClient";
import type { CameraProvisionRequest, CameraProvisionResponse, DeviceActivationCodeCreateRequest, DeviceActivationCodeCreateResponse, DevicePayload, DevicesConfigResponse, PrinterProvisionRequest, PrinterProvisionResponse } from "@/src/app/type/device/device";

export const devicesApi = {
  list: () => apiRequest<DevicesConfigResponse>("/api/devices/devices"),
  create: (body: DeviceActivationCodeCreateRequest) => apiRequest<DeviceActivationCodeCreateResponse>("/api/devices/devices", { method: "POST", body: JSON.stringify(body) }),
  provisionCamera: (body: CameraProvisionRequest) => apiRequest<CameraProvisionResponse>("/api/devices/devices/cameras/provision", { method: "POST", body: JSON.stringify(body) }),
  provisionPrinter: (body: PrinterProvisionRequest) => apiRequest<PrinterProvisionResponse>("/api/devices/devices/printers/provision", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: DevicePayload) => apiRequest(`/api/devices/devices/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest(`/api/devices/devices/${id}`, { method: "DELETE" }),
};
