import { apiRequest } from "./apiClient";
import type { OverviewSummaryResponse } from "@/src/app/type/summary/summary";

export function getOverview(startDate?: string, endDate?: string) {
  const query = new URLSearchParams();
  if (startDate) query.set("start_date", startDate);
  if (endDate) query.set("end_date", endDate);
  return apiRequest<OverviewSummaryResponse>(`/api/summary${query.size ? `?${query}` : ""}`);
}
