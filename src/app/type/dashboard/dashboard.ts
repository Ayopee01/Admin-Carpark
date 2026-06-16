export type DashboardSummaryCards = {
    totalTickets: number;
    paidCount: number;
    paidRevenue: number;
    pendingCount: number;
    avgWaitTime: string;
};

export type DashboardRevenueGroup = {
    id: string;
    label: string;
    amount: number;
    personalAmount?: number;
    percent: number;
};

export type DashboardChannelItem = {
    id?: string;
    code?: string;
    label: string;
    subLabel?: string;
    icon?: "user" | "qr" | "kiosk" | "gate" | string;
    amount: number;
    count: number;
    percent: number;
};

export type DashboardResponse = {
    summaryCards: DashboardSummaryCards;
    revenueGroups: DashboardRevenueGroup[];
    channelBreakdown: DashboardChannelItem[];
    isRealtime: boolean;
};

export type DashboardSseEvent =
    | { type: "connected"; message: string }
    | {
        type: "dashboard_snapshot" | "dashboard_summary" | "dashboard_updated";
        trigger?: unknown;
        data: DashboardResponse;
        generatedAt: string;
    }
    | { type: "dashboard_error"; message: string; generatedAt: string }
    | { type: "ping"; at: string };
