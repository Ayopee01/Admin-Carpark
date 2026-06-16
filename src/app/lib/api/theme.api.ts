import { apiRequest } from "./apiClient";
import type { ThemeConfig, ThemeDeleteLogoResponse, ThemePayload, ThemeUploadLogoResponse } from "@/src/app/type/device/theme";

export const themeApi = {
  get: () => apiRequest<ThemeConfig>("/api/devices/theme"),
  update: (body: ThemePayload) => apiRequest<ThemeConfig>("/api/devices/theme", { method: "PUT", body: JSON.stringify(body) }),
  uploadLogo: (file: File) => {
    const body = new FormData();
    body.append("logo", file);
    return apiRequest<ThemeUploadLogoResponse>("/api/devices/theme/upload-logo", { method: "POST", body });
  },
  deleteLogo: () => apiRequest<ThemeDeleteLogoResponse>("/api/devices/theme/logo", { method: "DELETE" }),
};
