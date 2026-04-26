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
    summaryCards: OverviewSummaryCards;
    revenueGroups: OverviewRevenueGroup[];
    usageChart: OverviewUsageChartItem[];
    serviceSummary: OverviewServiceSummaryItem[];
    totalSummaryCalculated: number;
};