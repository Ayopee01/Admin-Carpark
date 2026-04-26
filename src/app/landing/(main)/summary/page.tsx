"use client";

import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
    LuArrowDownToLine,
    LuCircleDollarSign,
    LuClock3,
    LuQrCode,
    LuTicket,
    LuUserRound,
} from "react-icons/lu";

import SummaryCard from "@/src/app/components/dashboard/SummaryCard";
import RevenueGroupCard from "@/src/app/components/dashboard/RevenueGroupCard";
import DateRangeFilter from "@/src/app/components/summary/DateRangeFilter";
import UsageChartCard from "@/src/app/components/summary/UsageChartCard";
import ServiceSummaryCard from "@/src/app/components/summary/ServiceSummaryCard";

import type {
    OverviewRevenueGroup,
    OverviewSummaryResponse,
} from "@/src/app/type/summary/summary";

function formatDateParam(date?: Date) {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function SummaryPage() {
    const [data, setData] = useState<OverviewSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

    const selectedStartDate =
        selectedRange?.from && selectedRange?.to
            ? formatDateParam(selectedRange.from)
            : "";

    const selectedEndDate =
        selectedRange?.from && selectedRange?.to
            ? formatDateParam(selectedRange.to)
            : "";

    useEffect(() => {
        let ignore = false;

        async function fetchOverviewSummary() {
            try {
                setLoading(true);
                setError("");

                const token =
                    typeof window !== "undefined"
                        ? localStorage.getItem("token")
                        : null;

                const query = new URLSearchParams();

                if (selectedStartDate) {
                    query.set("startDate", selectedStartDate);
                }

                if (selectedEndDate) {
                    query.set("endDate", selectedEndDate);
                }

                const response = await fetch(
                    `/api/summary${query.toString() ? `?${query.toString()}` : ""
                    }`,
                    {
                        method: "GET",
                        headers: {
                            ...(token
                                ? { Authorization: `Bearer ${token}` }
                                : {}),
                        },
                        cache: "no-store",
                    }
                );

                const result = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        result?.message || "ไม่สามารถดึงข้อมูลภาพรวมได้"
                    );
                }

                if (!ignore) {
                    setData(result as OverviewSummaryResponse);
                }
            } catch (err) {
                if (!ignore) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchOverviewSummary();

        return () => {
            ignore = true;
        };
    }, [selectedEndDate, selectedStartDate]);

    function formatNumber(value: number) {
        return new Intl.NumberFormat("en-US").format(value);
    }

    function formatCurrency(value: number) {
        return `฿${new Intl.NumberFormat("en-US").format(value)}`;
    }

    function getRevenueDescription(group: OverviewRevenueGroup) {
        if (group.id === "staff") {
            return "การชำระเงินสด ผ่านคนงานช่วยเหลือ";
        }

        if (group.id === "scan") {
            return "สแกนจ่าย (แอป / คิวอาร์โค้ด)";
        }

        return "ข้อมูลรายได้";
    }

    function handleDownloadJson() {
        if (!data) return;

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "overview-summary.json";
        link.click();

        URL.revokeObjectURL(url);
    }

    const realtimeBadge = useMemo(
        () => (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#49C85B] bg-[#F5FFF6] px-4 py-2 text-[13px] font-semibold text-[#38B449]">
                <span className="h-2 w-2 rounded-full bg-[#38B449]" />
                <span>Real-Time</span>
            </div>
        ),
        []
    );

    if (loading) {
        return (
            <section className="min-h-screen bg-[#F3F4F6] px-5 py-6 md:px-8 md:py-8">
                <div className="mx-auto max-w-[1320px] animate-pulse">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="h-10 w-[220px] rounded bg-[#D7D9DD]" />
                            <div className="mt-3 h-4 w-[220px] rounded bg-[#D7D9DD]" />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-[180px] rounded-full bg-[#D7D9DD]" />
                            <div className="h-10 w-[120px] rounded-full bg-[#D7D9DD]" />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="h-[138px] rounded-[8px] bg-[#E4E6E8]" />
                        <div className="h-[138px] rounded-[8px] bg-[#E4E6E8]" />
                        <div className="h-[138px] rounded-[8px] bg-[#E4E6E8]" />
                    </div>

                    <div className="mt-10">
                        <div className="h-8 w-[200px] rounded bg-[#D7D9DD]" />
                        <div className="mt-2 h-4 w-[240px] rounded bg-[#D7D9DD]" />
                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                            <div className="h-[190px] rounded-[18px] bg-[#E4E6E8]" />
                            <div className="h-[190px] rounded-[18px] bg-[#E4E6E8]" />
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="h-[360px] rounded-[18px] bg-white" />
                        <div className="h-[360px] rounded-[18px] bg-[#E4E6E8]" />
                    </div>
                </div>
            </section>
        );
    }

    if (error || !data) {
        return (
            <section className="min-h-screen bg-[#F3F4F6] px-5 py-6 md:px-8 md:py-8">
                <div className="mx-auto max-w-[1320px] rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
                    {error || "ไม่พบข้อมูลภาพรวม"}
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-[#F3F4F6] px-5 py-6 text-[#1F2937] md:px-8 md:py-8">
            <div className="mx-auto max-w-[1320px]">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[36px] font-extrabold leading-none tracking-[-0.04em] text-[#1F2937]">
                            ยอดรวมทั้งหมด
                        </h1>
                        <p className="mt-2 text-[14px] text-[#6B7280]">
                            สรุปยอดการใช้บริการและการชำระเงิน
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {realtimeBadge}

                        <button
                            type="button"
                            onClick={handleDownloadJson}
                            className="inline-flex items-center gap-2 rounded-full bg-[#061D36] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-95"
                        >
                            <LuArrowDownToLine size={16} />
                            ดาวน์โหลด
                        </button>
                    </div>
                </div>

                <div className="mb-5">
                    <DateRangeFilter
                        value={selectedRange}
                        onChange={setSelectedRange}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        title="บัตรทั้งหมด"
                        value={formatNumber(data.summaryCards.totalTickets)}
                        suffix="tickets"
                        note="↗ Today’s Total"
                        icon={<LuTicket size={16} />}
                    />

                    <SummaryCard
                        title="ชำระเงินแล้ว"
                        value={formatNumber(data.summaryCards.paidCount)}
                        note={`฿ ${formatNumber(
                            data.summaryCards.paidRevenue
                        )}.00 Total`}
                        icon={<LuCircleDollarSign size={16} />}
                    />

                    <SummaryCard
                        title="บิลค้างชำระ"
                        value={formatNumber(data.summaryCards.pendingCount)}
                        suffix="pending"
                        note={``}
                        icon={<LuClock3 size={16} />}
                    />
                </div>

                <div className="mt-10">
                    <h2 className="text-[32px] font-extrabold leading-none tracking-[-0.03em] text-[#1F2937]">
                        ยอดรวมทั้งหมด
                    </h2>
                    <p className="mt-2 text-[14px] text-[#6B7280]">
                        สรุปยอดการใช้บริการและการชำระเงิน
                    </p>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        {data.revenueGroups.map((group) => (
                            <RevenueGroupCard
                                key={group.id}
                                title={group.label}
                                description={getRevenueDescription(group)}
                                amountText={formatCurrency(group.amount)}
                                percent={group.percent}
                                icon={
                                    group.id === "staff" ? (
                                        <LuUserRound size={16} />
                                    ) : (
                                        <LuQrCode size={16} />
                                    )
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <UsageChartCard items={data.usageChart} />
                    <ServiceSummaryCard
                        items={data.serviceSummary}
                        totalAmount={data.totalSummaryCalculated}
                    />
                </div>
            </div>
        </section>
    );
}

export default SummaryPage;