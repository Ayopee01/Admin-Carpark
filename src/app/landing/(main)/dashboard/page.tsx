"use client";

import { useEffect, useState } from "react";
import {
    BadgeCheck,
    Clock3,
    DoorOpen,
    MonitorSmartphone,
    QrCode,
    Ticket,
    UserRound,
} from "lucide-react";
import { LuReceiptText, LuTrendingUp } from "react-icons/lu";

import Preload from "@/src/app/components/Preload";
import SummaryCard from "@/src/app/components/dashboard/SummaryCard";
import RevenueGroupCard from "@/src/app/components/dashboard/RevenueGroupCard";
import ChannelCard from "@/src/app/components/dashboard/ChannelCard";

import type {
    DashboardChannelItem,
    DashboardResponse,
    DashboardRevenueGroup,
    DashboardSseEvent,
} from "@/src/app/type/dashboard/dashboard";

function DashboardPage() {
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;
        let timer: number | undefined;

        async function fetchDashboard() {
            try {
                setLoading(true);
                setProgress(8);
                setError("");

                const token =
                    typeof window !== "undefined" ? localStorage.getItem("token") : null;

                setProgress(18);

                const response = await fetch("/api/dashboard", {
                    method: "GET",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    cache: "no-store",
                });

                if (!ignore) {
                    setProgress(60);
                }

                const result = await response.json().catch(() => null);

                if (!ignore) {
                    setProgress(82);
                }

                if (!response.ok) {
                    throw new Error(
                        result?.message || "ไม่สามารถดึงข้อมูล Dashboard ได้"
                    );
                }

                if (!ignore) {
                    setData(result as DashboardResponse);
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

        fetchDashboard();

        return () => {
            ignore = true;

            if (timer) {
                window.clearTimeout(timer);
            }
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let reconnectTimer: number | undefined;
        let pollingTimer: number | undefined;

        async function pollDashboard() {
            try {
                const response = await fetch("/api/dashboard", { signal: controller.signal });
                if (response.ok) {
                    setData((await response.json()) as DashboardResponse);
                }
            } catch {
                // The next polling interval retries automatically.
            }
        }

        function startPolling() {
            if (pollingTimer) return;
            void pollDashboard();
            pollingTimer = window.setInterval(pollDashboard, 30000);
        }

        async function connect() {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("/api/dashboard/events", {
                    headers: {
                        Accept: "text/event-stream",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    signal: controller.signal,
                });
                if (!response.ok || !response.body) throw new Error("SSE unavailable");

                if (pollingTimer) {
                    window.clearInterval(pollingTimer);
                    pollingTimer = undefined;
                }

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
                        const event = JSON.parse(dataText) as DashboardSseEvent;
                        if (
                            event.type === "dashboard_snapshot" ||
                            event.type === "dashboard_summary" ||
                            event.type === "dashboard_updated"
                        ) {
                            setData(event.data);
                        }
                    }
                }
            } catch {
                if (controller.signal.aborted) return;
                startPolling();
                reconnectTimer = window.setTimeout(connect, 5000);
            }
        }

        void connect();
        return () => {
            controller.abort();
            if (reconnectTimer) window.clearTimeout(reconnectTimer);
            if (pollingTimer) window.clearInterval(pollingTimer);
        };
    }, []);

    const formatNumber = (value: number) =>
        new Intl.NumberFormat("en-US").format(value);

    const formatCurrency = (value: number) =>
        `฿${new Intl.NumberFormat("en-US").format(value)}`;

    const getRevenueDescription = (group: DashboardRevenueGroup) => {
        if (group.id === "staff") {
            return "การชำระเงินสด ผ่านคนงานช่วยเหลือ";
        }

        if (group.id === "scan") {
            return "สแกนจ่าย (แอป / คิวอาร์โค้ด)";
        }

        return "ข้อมูลรายได้";
    };

    const getChannelIcon = (icon: DashboardChannelItem["icon"]) => {
        switch (icon) {
            case "user":
                return <UserRound className="h-4 w-4" strokeWidth={2.25} />;
            case "qr":
                return <QrCode className="h-4 w-4" strokeWidth={2.25} />;
            case "kiosk":
                return <MonitorSmartphone className="h-4 w-4" strokeWidth={2.25} />;
            case "gate":
                return <DoorOpen className="h-4 w-4" strokeWidth={2.25} />;
            default:
                return <Ticket className="h-4 w-4" strokeWidth={2.25} />;
        }
    };

    if (loading) {
        return (
            <Preload
                open
                progress={progress}
                message="กำลังโหลดข้อมูล..."
                detail="ระบบลานจอดรถ"
                fullscreen={false}
            />
        );
    }

    if (error || !data) {
        return (
            <section className="min-h-screen bg-gray-100 px-5 py-6 md:p-20">
                <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
                    {error || "ไม่พบข้อมูล Dashboard"}
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gray-100 px-5 py-6 text-slate-700 md:p-20">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold leading-8 tracking-tight text-slate-700">
                            จัดการระบบ
                        </h1>

                        <p className="mt-2 text-xs font-medium leading-5 text-gray-500">
                            • ติดตามรายได้และปริมาณการใช้งาน
                        </p>
                    </div>

                    <div
                        className={`flex h-10 items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-semibold ${data.isRealtime
                                ? "border-green-100 text-green-600"
                                : "border-slate-200 text-slate-500"
                            }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${data.isRealtime ? "bg-green-500" : "bg-slate-400"
                                }`}
                        />

                        <span>{data.isRealtime ? "Online" : "Offline"}</span>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        title="บิลทั้งหมด"
                        value={formatNumber(data.summaryCards.totalTickets)}
                        suffix="tickets"
                        note="Today’s Total"
                        noteIcon={
                            <LuTrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                        }
                        icon={<LuReceiptText className="h-4 w-4" strokeWidth={2.25} />}
                    />

                    <SummaryCard
                        title="ชำระเงินแล้ว"
                        value={formatNumber(data.summaryCards.paidCount)}
                        note={`฿ ${formatNumber(data.summaryCards.paidRevenue)}.00 Total`}
                        icon={<BadgeCheck className="h-4 w-4" strokeWidth={2.25} />}
                    />

                    <SummaryCard
                        title="บิลค้างชำระ"
                        value={formatNumber(data.summaryCards.pendingCount)}
                        suffix="pending"
                        note=""
                        icon={<Clock3 className="h-4 w-4" strokeWidth={2.25} />}
                    />
                </div>

                <div className="mt-10">
                    <h2 className="text-3xl font-extrabold leading-none tracking-tight text-gray-800 md:text-4xl">
                        การชำระค่าบริการ
                    </h2>

                    <p className="mt-2 text-xs font-medium leading-5 text-gray-500">
                        • ช่องทางการชำระค่าบริการ
                    </p>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        {data.revenueGroups.map((group) => (
                            <RevenueGroupCard
                                key={group.id}
                                title={group.label}
                                description={getRevenueDescription(group)}
                                amountText={formatCurrency(group.amount)}
                                percent={group.percent}
                                icon={getChannelIcon(group.id === "staff" ? "user" : "qr")}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="text-3xl font-extrabold leading-none tracking-tight text-gray-800 md:text-4xl">
                        ยอดชำระค่าบริการแต่ละช่องทาง
                    </h2>

                    <p className="mt-2 text-xs font-medium leading-5 text-gray-500">
                        • ติดตามปริมาณการใช้งานในแต่ละช่องทางบริการ
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {data.channelBreakdown.map((channel) => (
                            <ChannelCard
                                key={channel.id ?? channel.code ?? channel.label}
                                title={channel.label}
                                subTitle={channel.subLabel ?? ""}
                                countText={`${channel.count} รายการ`}
                                amountText={formatCurrency(channel.amount)}
                                percent={channel.percent}
                                icon={getChannelIcon(channel.icon ?? "")}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DashboardPage;
