import { NextRequest, NextResponse } from "next/server";
import mockData from "@/src/app/mock/summary-data.json";
import type {
  SummaryCardItem,
  SummaryChannel,
  SummaryChannelItem,
  SummaryChartItem,
  SummaryOverviewItem,
  SummaryResponse,
  SummaryTransaction,
} from "@/src/app/type/summary";

type SummaryMockJson = {
  transactions: SummaryTransaction[];
};

const data = mockData as SummaryMockJson;

function sumAmount(items: SummaryTransaction[]) {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

function formatCurrency(value: number) {
  return `฿ ${value.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatThaiShortDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(date);
}

function getRangeText(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return `${formatThaiShortDate(fromDate)} - ${formatThaiShortDate(toDate)}`;
}

function isInRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

function calculateCards(items: SummaryTransaction[]): SummaryCardItem[] {
  const paid = items.filter((item) => item.status === "paid");
  const pending = items.filter((item) => item.status === "pending");

  return [
    {
      title: "บิลทั้งหมด",
      value: items.length,
      unit: "tickets",
      note: "Today’s Total",
    },
    {
      title: "ชำระเงินแล้ว",
      value: paid.length,
      unit: "",
      note: `${formatCurrency(sumAmount(paid))} Total`,
    },
    {
      title: "บิลค้างชำระ",
      value: pending.length,
      unit: "pending",
      note: "Avg. wait",
    },
  ];
}

function calculateOverview(items: SummaryTransaction[]): SummaryOverviewItem[] {
  const totalAmount = sumAmount(items);

  const groups = [
    {
      id: "assisted",
      title: "เจ้าหน้าที่ช่วยเหลือ",
      subtitle: "การชำระเงินสด ผ่านความช่วยเหลือ",
    },
    {
      id: "scanpay",
      title: "สแกนจ่าย",
      subtitle: "สแกนจ่าย (แอป / คิวอาร์โค้ด)",
    },
  ] as const;

  return groups.map((group) => {
    const groupItems = items.filter((item) => item.group === group.id);
    const amount = sumAmount(groupItems);
    const progress = totalAmount === 0 ? 0 : Math.round((amount / totalAmount) * 100);

    return {
      id: group.id,
      title: group.title,
      subtitle: group.subtitle,
      amount,
      progress,
    };
  });
}

function calculateChart(items: SummaryTransaction[]): SummaryChartItem[] {
  const labels = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
  const values = new Map<number, number>();

  items.forEach((item) => {
    const day = new Date(item.date).getDay();
    const normalizedDay = day === 0 ? 6 : day - 1;
    values.set(normalizedDay, (values.get(normalizedDay) ?? 0) + 1);
  });

  return labels.map((label, index) => ({
    label,
    value: values.get(index) ?? 0,
  }));
}

function getChannelMeta(channel: SummaryChannel) {
  switch (channel) {
    case "cashier":
      return "ยืนสด (Cashier)";
    case "promptpay":
      return "E-Payment";
    case "kiosk":
      return "Kiosk";
    case "exit":
      return "หน้าทางออก";
  }
}

function calculateChannels(items: SummaryTransaction[]): SummaryChannelItem[] {
  const allAmount = sumAmount(items);

  const channels: SummaryChannel[] = ["cashier", "promptpay", "kiosk", "exit"];

  return channels.map((channel) => {
    const channelItems = items.filter((item) => item.channel === channel);
    const amount = sumAmount(channelItems);
    const percent = allAmount === 0 ? 0 : Math.round((amount / allAmount) * 100);

    return {
      id: channel,
      title: getChannelMeta(channel),
      countText: `${channelItems.length} รายการ`,
      amount,
      percent,
    };
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from") || "2026-04-09";
  const to = searchParams.get("to") || "2026-04-13";

  const filteredItems = data.transactions.filter((item) =>
    isInRange(item.date, from, to)
  );

  const response: SummaryResponse = {
    ok: true,
    message: "Fetched summary data successfully",
    data: {
      dateRangeText: getRangeText(from, to),
      cards: calculateCards(filteredItems),
      overview: calculateOverview(filteredItems),
      chart: calculateChart(filteredItems),
      channels: calculateChannels(filteredItems),
      totalRevenue: sumAmount(filteredItems),
    },
  };

  return NextResponse.json(response);
}