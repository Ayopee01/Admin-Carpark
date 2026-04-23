import type { ReactNode } from "react";
import type { IconType } from "react-icons";


export type DashboardRevenueTrendItem = {
    date: string;
    amount: number;
};

export type DashboardRevenueMonthlyItem = {
    month: string;
    amount: number;
};

export type DashboardRevenueServiceType = {
    code: string;
    label: string;
    amount: number;
};

/* =========================
   API TYPES
========================= */

export type DashboardFilters = {
    startDate: string | null;
    endDate: string | null;
    branchId: string | number | null;
};

export type DashboardSummaryCards = {
    totalBills: number;
    paidBills: number;
    unpaidBills: number;
    cancelledBills: number;
    todayRevenue: number;
    monthlyRevenue: number;
};

export type DashboardPaymentChannel = {
    code: string;
    label: string;
    amount: number;
    count: number;
};

export type DashboardServiceType = {
    code: string;
    label: string;
    amount: number;
    count: number;
};

export type DashboardLatestTransaction = {
    id: string | number;
    billNo: string;
    plateNo: string;
    amount: number;
    paymentStatus: string;
    status: string;
    paymentMethod?: string | null;
    paidAt: string | null;
};

export type DashboardOverviewResponse = {
    filters?: DashboardFilters;
    summaryCards: DashboardSummaryCards;
    paymentChannels: DashboardPaymentChannel[];
    serviceTypes: DashboardServiceType[];
    revenueTrend: DashboardRevenueTrendItem[];
    latestTransactions: DashboardLatestTransaction[];
};

export type DashboardRevenueSummary = {
    totalRevenue: number;
    parkingRevenue: number;
    evRevenue: number;
    bookingRevenue: number;
};

export type DashboardRevenuePeriodItem = {
    date: string;
    amount: number;
};

export type DashboardRevenueByPeriod = {
    daily: DashboardRevenuePeriodItem[];
    monthly: DashboardRevenueMonthlyItem[];
};;

export type DashboardRevenuePaymentChannel = {
    code: string;
    label: string;
    amount: number;
};

export type DashboardTopService = {
    serviceCode: string;
    serviceName: string;
    amount: number;
};

export type DashboardRevenueOverallResponse = {
    summary: DashboardRevenueSummary;
    revenueByPeriod: DashboardRevenueByPeriod;
    revenueByPaymentChannel: DashboardRevenuePaymentChannel[];
    revenueByServiceType: DashboardRevenueServiceType[];
    topServices: DashboardTopService[];
};

/* =========================
   UI TYPES
========================= */

export type DashboardStatCard = {
    key: string;
    title: string;
    value: string;
    unit?: string;
    note?: string;
    icon: IconType;
};

export type DashboardProgressCard = {
    key: string;
    title: string;
    description?: string;
    subText?: string;
    amount: string;
    percent?: number;
    icon: IconType;
};

/* =========================
   HOOK TYPES
========================= */

export type UseDashboardResult = {
    overview: DashboardOverviewResponse | null;
    revenue: DashboardRevenueOverallResponse | null;
    loading: boolean;
    error: string;
};

/* =========================
   COMPONENT PROP TYPES
========================= */

export type DashboardShellProps = {
    children: ReactNode;
};

export type NoticeCardProps = {
    children: ReactNode;
    isError?: boolean;
};

export type DashboardContentProps = {
    overview: DashboardOverviewResponse | null;
    revenue: DashboardRevenueOverallResponse | null;
};

export type DashboardSectionTitleProps = {
    title: string;
    description?: string;
};

export type DashboardStatCardProps = {
    title: string;
    value: string;
    unit?: string;
    note?: string;
    icon: IconType;
};

export type DashboardProgressCardProps = {
    title: string;
    description?: string;
    subText?: string;
    amount: string;
    percent?: number;
    icon: IconType;
    compact?: boolean;
};