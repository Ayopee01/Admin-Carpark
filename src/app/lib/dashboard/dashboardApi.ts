//Types
import type { DashboardOverviewResponse, DashboardRevenueOverallResponse } from "@/src/app/type/dashboard/dashboard";

async function fetchDashboardData<T>(
  url: string,
  token: string,
  errorMessage: string
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export function fetchDashboardOverview(token: string) {
  return fetchDashboardData<DashboardOverviewResponse>(
    "/api/dashboard/overview",
    token,
    "ไม่สามารถโหลดข้อมูลภาพรวม dashboard ได้"
  );
}

export function fetchDashboardRevenue(token: string) {
  return fetchDashboardData<DashboardRevenueOverallResponse>(
    "/api/dashboard/revenue-overall",
    token,
    "ไม่สามารถโหลดข้อมูลรายได้ dashboard ได้"
  );
}