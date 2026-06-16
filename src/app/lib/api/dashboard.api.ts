import { apiRequest } from "./apiClient";
import type { DashboardResponse } from "@/src/app/type/dashboard/dashboard";

export const dashboardApi = { get: () => apiRequest<DashboardResponse>("/api/dashboard") };
