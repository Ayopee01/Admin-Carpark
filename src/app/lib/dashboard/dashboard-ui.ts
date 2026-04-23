//Icons
import { FiCheckCircle, FiClock, FiCreditCard, FiFileText, FiLogOut, FiMonitor, FiUser } from "react-icons/fi";
import { BsQrCodeScan } from "react-icons/bs";
//Types
import type { DashboardContentProps, DashboardOverviewResponse, DashboardProgressCard, DashboardRevenueOverallResponse, DashboardStatCard } from "@/src/app/type/dashboard/dashboard";

function compact<T>(items: Array<T | null | undefined | false>): T[] {
  return items.filter(Boolean) as T[];
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

export function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toPercent(amount: number, total: number) {
  if (!Number.isFinite(amount) || !Number.isFinite(total) || total <= 0) {
    return undefined;
  }

  return Math.max(0, Math.min(100, Math.round((amount / total) * 100)));
}

function getServiceIcon(code?: string) {
  const normalized = (code || "").toLowerCase();

  if (
    normalized.includes("cash") ||
    normalized.includes("staff") ||
    normalized.includes("agent") ||
    normalized.includes("counter")
  ) {
    return FiUser;
  }

  if (
    normalized.includes("scan") ||
    normalized.includes("qr") ||
    normalized.includes("prompt")
  ) {
    return BsQrCodeScan;
  }

  return FiCreditCard;
}

function getChannelIcon(code?: string) {
  const normalized = (code || "").toLowerCase();

  if (normalized.includes("cash")) return FiUser;
  if (normalized.includes("qr") || normalized.includes("prompt")) return BsQrCodeScan;
  if (normalized.includes("kiosk")) return FiMonitor;
  if (normalized.includes("gate") || normalized.includes("exit")) return FiLogOut;

  return FiCreditCard;
}

export function buildSummaryCards(
  overview: DashboardOverviewResponse | null,
  revenue: DashboardRevenueOverallResponse | null
): DashboardStatCard[] {
  const summary = overview?.summaryCards;
  if (!summary) return [];

  return compact([
    typeof summary.totalBills === "number" && {
      key: "total-bills",
      title: "บิลทั้งหมด",
      value: formatNumber(summary.totalBills),
      unit: "tickets",
      note:
        typeof summary.paidBills === "number"
          ? `ชำระแล้ว ${formatNumber(summary.paidBills)} รายการ`
          : undefined,
      icon: FiFileText,
    },
    typeof summary.paidBills === "number" && {
      key: "paid-bills",
      title: "ชำระเสร็จแล้ว",
      value: formatNumber(summary.paidBills),
      note:
        typeof revenue?.summary?.totalRevenue === "number"
          ? `${formatCurrency(revenue.summary.totalRevenue)} Total`
          : undefined,
      icon: FiCheckCircle,
    },
    typeof summary.unpaidBills === "number" && {
      key: "unpaid-bills",
      title: "ยังค้างชำระ",
      value: formatNumber(summary.unpaidBills),
      unit: "pending",
      note:
        typeof summary.cancelledBills === "number"
          ? `ยกเลิก ${formatNumber(summary.cancelledBills)} รายการ`
          : undefined,
      icon: FiClock,
    },
  ]);
}

export function buildServiceCards(
  overview: DashboardOverviewResponse | null
): DashboardProgressCard[] {
  const serviceTypes = overview?.serviceTypes ?? [];
  if (!serviceTypes.length) return [];

  const totalAmount = serviceTypes.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  return serviceTypes.map((item, index) => ({
    key: item.code || `${item.label}-${index}`,
    title: item.label,
    description: undefined,
    subText:
      typeof item.count === "number"
        ? `${formatNumber(item.count)} รายการ`
        : undefined,
    amount: formatCurrency(item.amount || 0),
    percent: toPercent(item.amount || 0, totalAmount),
    icon: getServiceIcon(item.code),
  }));
}

export function buildChannelCards(
  overview: DashboardOverviewResponse | null,
  revenue: DashboardRevenueOverallResponse | null
): DashboardProgressCard[] {
  const source =
    revenue?.revenueByPaymentChannel?.length
      ? revenue.revenueByPaymentChannel.map((item) => ({
        code: item.code,
        label: item.label,
        amount: item.amount,
        count: undefined,
      }))
      : overview?.paymentChannels ?? [];

  if (!source.length) return [];

  const totalAmount = source.reduce((sum, item) => sum + (item.amount || 0), 0);

  return source.map((item, index) => ({
    key: item.code || `${item.label}-${index}`,
    title: item.label,
    description: undefined,
    subText:
      typeof item.count === "number"
        ? `${formatNumber(item.count)} รายการ`
        : undefined,
    amount: formatCurrency(item.amount || 0),
    percent: toPercent(item.amount || 0, totalAmount),
    icon: getChannelIcon(item.code),
  }));
}

export function hasDashboardData({
  overview,
  revenue,
}: DashboardContentProps) {
  return Boolean(
    overview?.summaryCards ||
    overview?.serviceTypes?.length ||
    overview?.paymentChannels?.length ||
    revenue?.revenueByPaymentChannel?.length
  );
}