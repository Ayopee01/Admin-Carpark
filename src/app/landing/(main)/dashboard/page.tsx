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

import Preload from "@/src/app/components/Preload";
import SummaryCard from "@/src/app/components/dashboard/SummaryCard";
import RevenueGroupCard from "@/src/app/components/dashboard/RevenueGroupCard";
import ChannelCard from "@/src/app/components/dashboard/ChannelCard";

import type {
    DashboardChannelItem,
    DashboardResponse,
    DashboardRevenueGroup,
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
                    typeof window !== "undefined"
                        ? localStorage.getItem("token")
                        : null;

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
                return <UserRound size={16} strokeWidth={2.2} />;
            case "qr":
                return <QrCode size={16} strokeWidth={2.2} />;
            case "kiosk":
                return <MonitorSmartphone size={16} strokeWidth={2.2} />;
            case "gate":
                return <DoorOpen size={16} strokeWidth={2.2} />;
            default:
                return <Ticket size={16} strokeWidth={2.2} />;
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
            <section className="min-h-screen bg-[#F3F4F6] px-5 py-6 md:px-8 md:py-8">
                <div className="mx-auto max-w-[1280px] rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
                    {error || "ไม่พบข้อมูล Dashboard"}
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-[#F3F4F6] px-5 py-6 text-[#2A3439] md:px-8 md:py-8">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold leading-8 tracking-[-0.6px] text-[#2A3439]">
                            จัดการระบบ
                        </h1>
                        <p className="mt-2 text-xs font-medium leading-[18px] text-gray-500">
                            • ติดตามรายได้และปริมาณการใช้งาน
                        </p>
                    </div>

                    <div
                        className={`flex h-10 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${data.isRealtime
                            ? "border-sm bg-white text-[#38B449]"
                            : "border-sm bg-white text-[#667085]"
                            }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${data.isRealtime ? "bg-[#38B449]" : "bg-[#98A2B3]"
                                }`}
                        />
                        <span>{data.isRealtime ? "Real-Time" : "Offline"}</span>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        title="บัตรทั้งหมด"
                        value={formatNumber(data.summaryCards.totalTickets)}
                        suffix="tickets"
                        note="↗ Today’s Total"
                        icon={<Ticket size={16} strokeWidth={2.2} />}
                    />

                    <SummaryCard
                        title="ชำระเงินแล้ว"
                        value={formatNumber(data.summaryCards.paidCount)}
                        note={`฿ ${formatNumber(
                            data.summaryCards.paidRevenue
                        )}.00 Total`}
                        icon={<BadgeCheck size={16} strokeWidth={2.2} />}
                    />

                    <SummaryCard
                        title="บิลค้างชำระ"
                        value={formatNumber(data.summaryCards.pendingCount)}
                        suffix="pending"
                        note=""
                        icon={<Clock3 size={16} strokeWidth={2.2} />}
                    />
                </div>

                <div className="mt-10">
                    <h2 className="text-[28px] font-extrabold leading-none tracking-[-0.03em] text-[#1F2937] md:text-[32px]">
                        การชำระค่าบริการ
                    </h2>
                    <p className="mt-2 text-[12px] font-medium leading-[18px] text-[#6B7280]">
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
                                icon={getChannelIcon(
                                    group.id === "staff" ? "user" : "qr"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="text-[28px] font-extrabold leading-none tracking-[-0.03em] text-[#1F2937] md:text-[32px]">
                        ยอดชำระค่าบริการแต่ละช่องทาง
                    </h2>
                    <p className="mt-2 text-[12px] font-medium leading-[18px] text-[#6B7280]">
                        • ติดตามปริมาณการใช้งานในแต่ละช่องทางบริการ
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {data.channelBreakdown.map((channel) => (
                            <ChannelCard
                                key={channel.code}
                                title={channel.label}
                                subTitle={channel.subLabel}
                                countText={`${channel.count} รายการ`}
                                amountText={formatCurrency(channel.amount)}
                                percent={channel.percent}
                                icon={getChannelIcon(channel.icon)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DashboardPage;