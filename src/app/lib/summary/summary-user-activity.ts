import type { DashboardFilters, DashboardOverviewResponse, DashboardRevenueOverallResponse } from "@/src/app/type/dashboard/dashboard";

export type UserActivityPoint = {
  label: string;
  value: number;
};

export type UserActivityChannelItem = {
  code: string;
  label: string;
  amount: number;
  count: number;
  percent: number;
};

export type UserActivitySectionData = {
  chartData: UserActivityPoint[];
  channels: UserActivityChannelItem[];
  totalRevenue: number;
  highlightLabel: string;
};

const FULL_DAY_LABELS = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัส",
  "ศุกร์",
  "เสาร์",
];

function toNumber(value: number | null | undefined) {
  return Number(value ?? 0);
}

function getThaiDayLabel(dateString: string) {
  const date = new Date(dateString);
  return FULL_DAY_LABELS[date.getDay()] ?? "";
}

function getTodayThaiLabel() {
  return FULL_DAY_LABELS[new Date().getDay()] ?? "";
}

function isDateInRange(
  targetDate: string,
  startDate: string | null,
  endDate: string | null
) {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (target < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (target > end) {
      return false;
    }
  }

  return true;
}

function filterDailyRevenueByDate(
  daily: { date: string; amount: number }[],
  filters?: Partial<DashboardFilters>
) {
  if (!filters?.startDate && !filters?.endDate) {
    return daily;
  }

  return daily.filter((item) =>
    isDateInRange(item.date, filters.startDate ?? null, filters.endDate ?? null)
  );
}

export function buildUserActivitySectionData(
  overview: DashboardOverviewResponse,
  revenue: DashboardRevenueOverallResponse,
  filters?: Partial<DashboardFilters>
): UserActivitySectionData {
  const filteredDaily = filterDailyRevenueByDate(
    revenue?.revenueByPeriod?.daily ?? [],
    filters
  );

  const totalRevenueFromDaily = filteredDaily.reduce(
    (sum, item) => sum + toNumber(item.amount),
    0
  );

  const fallbackTotalRevenue = overview.paymentChannels.reduce(
    (sum, item) => sum + toNumber(item.amount),
    0
  );

  const totalRevenue =
    totalRevenueFromDaily > 0
      ? totalRevenueFromDaily
      : toNumber(revenue?.summary?.totalRevenue) || fallbackTotalRevenue;

  const amountByCode = new Map(
    (revenue?.revenueByPaymentChannel ?? []).map((item) => [
      item.code,
      toNumber(item.amount),
    ])
  );

  const channels: UserActivityChannelItem[] = (overview.paymentChannels ?? []).map(
    (item) => {
      const amount = amountByCode.get(item.code) ?? toNumber(item.amount);
      const percent =
        totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;

      return {
        code: item.code,
        label: item.label,
        amount,
        count: toNumber(item.count),
        percent,
      };
    }
  );

  const chartData: UserActivityPoint[] = filteredDaily.map((item) => ({
    label: getThaiDayLabel(item.date),
    value: toNumber(item.amount),
  }));

  const highlightLabel =
    chartData.length > 0
      ? chartData[chartData.length - 1].label
      : getTodayThaiLabel();

  return {
    chartData,
    channels,
    totalRevenue,
    highlightLabel,
  };
}