import { apiRequest } from "./apiClient";
import type { SuccessMessageResponse } from "@/src/app/type/common";
import type { PaymentMethodsResponse, ServiceChannelsResponse, UpdateChannelMethodsPayload, UpdatePaymentMethodPayload } from "@/src/app/type/device/payment";

export const paymentSettingsApi = {
  methods: () => apiRequest<PaymentMethodsResponse>("/api/devices/payment/methods"),
  channels: () => apiRequest<ServiceChannelsResponse>("/api/devices/payment/channels"),
  updateMethod: (id: string, body: UpdatePaymentMethodPayload) => apiRequest<SuccessMessageResponse>(`/api/devices/payment/methods/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  updateChannel: (id: string, body: UpdateChannelMethodsPayload) => apiRequest<SuccessMessageResponse>(`/api/devices/payment/channels/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
};
