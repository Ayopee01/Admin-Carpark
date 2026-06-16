import { apiRequest } from "./apiClient";
import type { SuccessMessageResponse } from "@/src/app/type/common";
import type { PricingRulePayload, ServicePricingConfig } from "@/src/app/type/device/pricing";

export const pricingApi = {
  get: () => apiRequest<ServicePricingConfig>("/api/devices/pricing/config"),
  create: (body: PricingRulePayload) => apiRequest<SuccessMessageResponse>("/api/devices/pricing/rules", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: PricingRulePayload) => apiRequest<SuccessMessageResponse>(`/api/devices/pricing/rules/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<SuccessMessageResponse>(`/api/devices/pricing/rules/${id}`, { method: "DELETE" }),
};
