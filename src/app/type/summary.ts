export type SummaryStatus = "paid" | "pending";
export type SummaryChannel = "cashier" | "promptpay" | "kiosk" | "exit";
export type SummaryGroup = "assisted" | "scanpay";

export type SummaryTransaction = {
    id: string;
    date: string;
    channel: SummaryChannel;
    group: SummaryGroup;
    amount: number;
    status: SummaryStatus;
};

export type SummaryCardItem = {
    title: string;
    value: number;
    unit: string;
    note: string;
};

export type SummaryOverviewItem = {
    id: string;
    title: string;
    subtitle: string;
    amount: number;
    progress: number;
};

export type SummaryChartItem = {
    label: string;
    value: number;
};

export type SummaryChannelItem = {
    id: SummaryChannel;
    title: string;
    countText: string;
    amount: number;
    percent: number;
};

export type SummaryResponse = {
    ok: boolean;
    message: string;
    data: {
        dateRangeText: string;
        cards: SummaryCardItem[];
        overview: SummaryOverviewItem[];
        chart: SummaryChartItem[];
        channels: SummaryChannelItem[];
        totalRevenue: number;
    };
};