"use client";

import { useEffect, useState } from "react";
//Types
import type { DashboardOverviewResponse, DashboardRevenueOverallResponse, UseDashboardResult } from "@/src/app/type/dashboard/dashboard";
//Lib
import { fetchDashboardOverview, fetchDashboardRevenue } from "@/src/app/lib/dashboard/dashboardApi";

export function useDashboard(): UseDashboardResult {
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(
    null
  );
  const [revenue, setRevenue] = useState<DashboardRevenueOverallResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Missing token");
        }

        const [overviewData, revenueData] = await Promise.all([
          fetchDashboardOverview(token),
          fetchDashboardRevenue(token),
        ]);

        if (!isMounted) return;

        setOverview(overviewData);
        setRevenue(revenueData);
      } catch (err) {
        if (!isMounted) return;

        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    overview,
    revenue,
    loading,
    error,
  };
}