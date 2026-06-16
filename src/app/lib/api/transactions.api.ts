import { apiRequest } from "./apiClient";
import type { AdminPaymentResponse, PaymentRequest, TransactionDetail, TransactionListResponse, TransactionUpdateRequest } from "@/src/app/type/check-payment/transactions";

export const transactionsApi = {
  list: (query = "all=true") => apiRequest<TransactionListResponse>(`/api/check-payment/transactions?${query}`),
  detail: (id: string) => apiRequest<TransactionDetail>(`/api/check-payment/transactions/${id}`),
  update: (id: string, body: TransactionUpdateRequest) => apiRequest(`/api/check-payment/transactions/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  pay: (id: string, body: PaymentRequest) => apiRequest<AdminPaymentResponse>(`/api/check-payment/transactions/${id}/payment`, { method: "POST", body: JSON.stringify(body) }),
};
