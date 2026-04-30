export type OverviewFilters = {
    startDate: string;
    endDate: string;
};

export type OverviewSummaryCards = {
    totalTickets: number;
    paidCount: number;
    paidRevenue: number;
    pendingCount: number;
    avgWait: string;
};

export type OverviewRevenueGroup = {
    id: string;
    label: string;
    amount: number;
    percent: number;
};

export type OverviewUsageChartMode = "daily" | "weekly" | "monthly" | "yearly";

export type OverviewUsageChartItem = {
    label: string;
    value: number;
};

export type OverviewServiceSummaryItem = {
    id: string;
    label: string;
    amount: number;
    count: number;
    percent: number;
    icon: "cash" | "qr" | "kiosk" | "gate" | string;
};

export type OverviewSummaryResponse = {
    filters: OverviewFilters;
    chartFilters?: OverviewFilters;
    summaryCards: OverviewSummaryCards;
    revenueGroups: OverviewRevenueGroup[];
    usageChartMode?: OverviewUsageChartMode;
    usageChartLabel?: string;
    usageChart: OverviewUsageChartItem[];
    serviceSummary: OverviewServiceSummaryItem[];
    totalSummaryCalculated: number;
};