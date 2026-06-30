import { apiRequest } from "./apiClient";
import type { DeviceActivationCodeCreateRequest, DeviceActivationCodeCreateResponse, DeviceActivationCodeReissueResponse, DevicePayload, DevicesConfigResponse } from "@/src/app/type/device/device";

export const devicesApi = {
  list: () => apiRequest<DevicesConfigResponse>("/api/devices/devices"),
  create: (body: DeviceActivationCodeCreateRequest) => apiRequest<DeviceActivationCodeCreateResponse>("/api/devices/devices", { method: "POST", body: JSON.stringify(body) }),
  reissueActivationCode: (id: string) => apiRequest<DeviceActivationCodeReissueResponse>(`/api/devices/devices/${id}/reissue-activation-code`, { method: "POST" }),
  update: (id: string, body: DevicePayload) => apiRequest(`/api/devices/devices/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest(`/api/devices/devices/${id}`, { method: "DELETE" }),
};
