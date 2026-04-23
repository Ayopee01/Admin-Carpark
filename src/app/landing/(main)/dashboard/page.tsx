"use client";

// Hooks
import { useDashboard } from "@/src/app/hooks/useDashboard";
// Lib
import { buildChannelCards, buildServiceCards, buildSummaryCards } from "@/src/app/lib/dashboard/dashboard-ui";
//Components
import NoticeCard from "@/src/app/components/dashboard/NoticeCard";
import DashboardSkeleton from "@/src/app/components/dashboard/DashboardSkeleton";
import DashboardSectionTitle from "@/src/app/components/dashboard/DashboardSectionTitle";
import DashboardStatCard from "@/src/app/components/dashboard/DashboardStatCard";
import DashboardProgressCard from "@/src/app/components/dashboard/DashboardProgressCard";

function DashboardPage() {
    const { overview, revenue, loading, error } = useDashboard();

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <section className="min-h-full bg-[#EFEFEF] px-6 py-8 text-[#1F2933] md:px-8">
                <div className="mx-auto max-w-[1400px]">
                    <NoticeCard isError>{error}</NoticeCard>
                </div>
            </section>
        );
    }

    const summaryCards = buildSummaryCards(overview, revenue);
    const serviceCards = buildServiceCards(overview);
    const channelCards = buildChannelCards(overview, revenue);

    return (
        <section className="min-h-full bg-[#EFEFEF] px-5 py-6 text-[#1F2933] md:px-7 lg:p-14">
            <div className="mx-auto max-w-[1360px]">
                <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[34px] font-extrabold leading-none text-[#2B3640]">
                            จัดการระบบ
                        </h1>

                        <p className="mt-3 text-[13px] text-[#67727E]">
                            • ติดตามรายได้และปริมาณการใช้งาน
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-[#59D46B] bg-[#F5FFF6] px-4 py-1.5 text-[11px] font-semibold text-[#34B44C]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34B44C]" />
                        <span>Real-Time</span>
                    </div>
                </div>

                {summaryCards.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {summaryCards.map(({ key, ...card }) => (
                            <DashboardStatCard key={key} {...card} />
                        ))}
                    </div>
                ) : null}

                {serviceCards.length > 0 ? (
                    <div className="mt-8">
                        <DashboardSectionTitle
                            title="การชำระค่าบริการ"
                            description="ช่องทางการชำระค่าบริการ"
                        />

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {serviceCards.map(({ key, ...card }) => (
                                <DashboardProgressCard key={key} {...card} />
                            ))}
                        </div>
                    </div>
                ) : null}

                {channelCards.length > 0 ? (
                    <div className="mt-8">
                        <DashboardSectionTitle
                            title="ยอดชำระค่าบริการแต่ละช่องทาง"
                            description="ติดตามปริมาณการใช้งานแต่ละช่องทางบริการ"
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {channelCards.map(({ key, ...card }) => (
                                <DashboardProgressCard key={key} {...card} compact />
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

export default DashboardPage;