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

import Preload from "@/src/app/components/Preload";
import SummaryCard from "@/src/app/components/dashboard/SummaryCard";
import RevenueGroupCard from "@/src/app/components/dashboard/RevenueGroupCard";
import DateRangeFilter from "@/src/app/components/summary/DateRangeFilter";
import UsageChartCard from "@/src/app/components/summary/UsageChartCard";
import ServiceSummaryCard from "@/src/app/components/summary/ServiceSummaryCard";

import type {
    OverviewRevenueGroup,
    OverviewSseEvent,
    OverviewSummaryResponse,
} from "@/src/app/type/summary/summary";

function formatDateParam(date?: Date) {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getDateRangeParams(range?: DateRange) {
    if (!range?.from) {
        return {
            startDate: "",
            endDate: "",
        };
    }

    const startDate = formatDateParam(range.from);
    const endDate = formatDateParam(range.to ?? range.from);

    return {
        startDate,
        endDate,
    };
}

function getErrorMessage(value: unknown, fallback: string) {
    if (
        value &&
        typeof value === "object" &&
        "message" in value &&
        typeof value.message === "string"
    ) {
        return value.message;
    }

    return fallback;
}

function SummaryPage() {
    const [data, setData] = useState<OverviewSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const [isRealtime, setIsRealtime] = useState(false);

    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

    const { startDate: selectedStartDate, endDate: selectedEndDate } = useMemo(
        () => getDateRangeParams(selectedRange),
        [selectedRange]
    );

    useEffect(() => {
        let ignore = false;
        let timer: number | undefined;

        async function fetchOverviewSummary() {
            try {
                setLoading(true);
                setProgress(8);
                setError("");

                const token =
                    typeof window !== "undefined" ? localStorage.getItem("token") : null;

                const query = new URLSearchParams();

                if (selectedStartDate) {
                    query.set("start_date", selectedStartDate);
                }

                if (selectedEndDate) {
                    query.set("end_date", selectedEndDate);
                }

                if (!ignore) {
                    setProgress(18);
                }

                const response = await fetch(
                    `/api/summary${query.toString() ? `?${query.toString()}` : ""}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        cache: "no-store",
                    }
                );

                if (!ignore) {
                    setProgress(60);
                }

                const result = await response.json().catch(() => null);

                if (!ignore) {
                    setProgress(82);
                }

                if (!response.ok) {
                    throw new Error(result?.message || "ไม่สามารถดึงข้อมูลภาพรวมได้");
                }

                if (!ignore) {
                    setData(result as OverviewSummaryResponse);
                    setProgress(100);
                }
            } catch (err) {
                if (!ignore) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
                    );
                    setProgress(100);
                }
            } finally {
                if (!ignore) {
                    timer = window.setTimeout(() => {
                        if (!ignore) {
                            setLoading(false);
                            setProgress(0);
                        }
                    }, 350);
                }
            }
        }

        void fetchOverviewSummary();

        return () => {
            ignore = true;

            if (timer) {
                window.clearTimeout(timer);
            }
        };
    }, [selectedEndDate, selectedStartDate]);

    useEffect(() => {
        const controller = new AbortController();
        let reconnectTimer: number | undefined;

        function buildEventsUrl() {
            const query = new URLSearchParams();

            if (selectedStartDate) {
                query.set("start_date", selectedStartDate);
            }

            if (selectedEndDate) {
                query.set("end_date", selectedEndDate);
            }

            return `/api/summary/events${query.toString() ? `?${query.toString()}` : ""}`;
        }

        function handleOverviewEvent(event: OverviewSseEvent) {
            if (
                event.type === "overview_snapshot" ||
                event.type === "overview_summary" ||
                event.type === "overview_updated"
            ) {
                setData(event.data);
                setError("");
                setIsRealtime(true);
                return;
            }

            if (event.type === "overview_error") {
                setIsRealtime(false);
            }
        }

        async function connect() {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(buildEventsUrl(), {
                    headers: {
                        Accept: "text/event-stream",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    signal: controller.signal,
                    cache: "no-store",
                });

                if (!response.ok || !response.body) {
                    const result = await response.json().catch(() => null);
                    const message = getErrorMessage(
                        result,
                        response.status === 400
                            ? "Invalid overview date range"
                            : response.status === 401
                                ? "Unauthorized"
                                : response.status === 403
                                    ? "Forbidden"
                                    : "Overview event stream unavailable"
                    );

                    if (
                        response.status === 400 ||
                        response.status === 401 ||
                        response.status === 403
                    ) {
                        setIsRealtime(false);
                        setError(message);
                        return;
                    }

                    throw new Error(message);
                }

                setIsRealtime(true);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (!controller.signal.aborted) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const chunks = buffer.split(/\r?\n\r?\n/);
                    buffer = chunks.pop() ?? "";

                    for (const chunk of chunks) {
                        const dataText = chunk
                            .split(/\r?\n/)
                            .filter((line) => line.startsWith("data:"))
                            .map((line) => line.slice(5).trim())
                            .join("\n");

                        if (!dataText) continue;

                        const event = JSON.parse(dataText) as OverviewSseEvent;
                        if (event.type === "connected" || event.type === "ping") {
                            continue;
                        }

                        handleOverviewEvent(event);
                    }
                }

                if (!controller.signal.aborted) {
                    throw new Error("Overview event stream disconnected");
                }
            } catch {
                if (controller.signal.aborted) return;

                setIsRealtime(false);
                reconnectTimer = window.setTimeout(connect, 5000);
            }
        }

        void connect();

        return () => {
            controller.abort();

            if (reconnectTimer) {
                window.clearTimeout(reconnectTimer);
            }
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
            <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold ${isRealtime
                    ? "border-[#49C85B] bg-[#F5FFF6] text-[#38B449]"
                    : "border-[#D8DADF] bg-white text-[#6B7280]"
                    }`}
            >
                <span
                    className={`h-2 w-2 rounded-full ${isRealtime ? "bg-[#38B449]" : "bg-[#9CA3AF]"
                        }`}
                />
                <span>{isRealtime ? "Realtime" : "Online"}</span>
            </div>
        ),
        [isRealtime]
    );

    if (loading) {
        return (
            <Preload
                open
                progress={progress}
                message="กำลังโหลดข้อมูล..."
                detail="กำลังโหลดข้อมูลยอดรวมทั้งหมด"
                fullscreen={false}
            />
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
        <section className="min-h-screen bg-[#F3F4F6] px-4 py-6 text-[#1F2937] md:px-8 md:py-8">
            <div className="mx-auto max-w-[1320px]">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[30px] font-extrabold leading-none text-[#1F2937] sm:text-[36px]">
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
                    <DateRangeFilter value={selectedRange} onChange={setSelectedRange} />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        title="บัตรทั้งหมด"
                        value={formatNumber(data.summaryCards.totalTickets)}
                        suffix="tickets"
                        note="↗ Total"
                        icon={<LuTicket size={16} />}
                    />

                    <SummaryCard
                        title="ชำระเงินแล้ว"
                        value={formatNumber(data.summaryCards.paidCount)}
                        note={`฿ ${formatNumber(data.summaryCards.paidRevenue)}.00 Total`}
                        icon={<LuCircleDollarSign size={16} />}
                    />

                    <SummaryCard
                        title="บิลค้างชำระ"
                        value={formatNumber(data.summaryCards.pendingCount)}
                        suffix="pending"
                        note=""
                        icon={<LuClock3 size={16} />}
                    />
                </div>

                <div className="mt-10">
                    <h2 className="text-[26px] font-extrabold leading-none text-[#1F2937] sm:text-[32px]">
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

                <div className="mt-4 grid min-w-0 max-w-full gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <UsageChartCard
                        title="สถิติการใช้งานของผู้ใช้"
                        description={`ข้อมูลแสดงจำนวนผู้เข้าใช้บริการ (${data.usageChartLabel ?? "รายวัน"})`}
                        badgeLabel={data.usageChartLabel ?? "รายวัน"}
                        items={data.usageChart}
                    />

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
