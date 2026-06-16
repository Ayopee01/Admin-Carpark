import { apiRequest } from "./apiClient";
import type { SuccessMessageResponse } from "@/src/app/type/common";
import type { PrinterUpdateRequest, PrinterUpdateResponse, ReceiptSettingsResponse, SystemSettingsResponse, UpdateReceiptSettingsPayload, UpdateSystemSettingsPayload } from "@/src/app/type/system/system";

export const systemSettingsApi = {
  get: () => apiRequest<SystemSettingsResponse>("/api/system"),
  update: (body: UpdateSystemSettingsPayload) => apiRequest<SuccessMessageResponse>("/api/system", { method: "PUT", body: JSON.stringify(body) }),
  getReceipt: () => apiRequest<ReceiptSettingsResponse>("/api/system/receipt"),
  updateReceipt: (body: UpdateReceiptSettingsPayload) => apiRequest<SuccessMessageResponse>("/api/system/receipt", { method: "PUT", body: JSON.stringify(body) }),
  updatePrinter: (body: PrinterUpdateRequest) => apiRequest<PrinterUpdateResponse>("/api/system/receipt/printer", { method: "PUT", body: JSON.stringify(body) }),
};
