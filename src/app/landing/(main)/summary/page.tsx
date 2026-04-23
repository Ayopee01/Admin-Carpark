"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

// Hooks
import { useDashboardTransactions } from "@/src/app/hooks/useDashboardTransactions";

// Types
import type { DashboardFilters } from "@/src/app/type/dashboard/dashboard";

// Lib
import { buildSummaryFromTransactions } from "@/src/app/lib/summary/summary-from-transactions";

// Components
import NoticeCard from "@/src/app/components/dashboard/NoticeCard";
import DashboardSkeleton from "@/src/app/components/dashboard/DashboardSkeleton";
import DashboardSectionTitle from "@/src/app/components/dashboard/DashboardSectionTitle";
import DashboardStatCard from "@/src/app/components/dashboard/DashboardStatCard";
import DashboardProgressCard from "@/src/app/components/dashboard/DashboardProgressCard";
import UserActivityChart from "@/src/app/components/summary/UserActivityChart";
import DateRangeDropdown from "@/src/app/components/DateRangeDropdown";

const DEFAULT_FILTERS: DashboardFilters = {
  startDate: null,
  endDate: null,
  branchId: null,
};

function toIsoDate(date?: Date) {
  if (!date) return null;

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function SummaryPage() {
  const { transactions, loading, error } = useDashboardTransactions();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  const appliedFilters = useMemo<DashboardFilters>(() => {
    return {
      ...DEFAULT_FILTERS,
      startDate: toIsoDate(selectedRange?.from),
      endDate: toIsoDate(selectedRange?.to),
    };
  }, [selectedRange]);

  const summaryData = useMemo(() => {
    return buildSummaryFromTransactions(transactions, appliedFilters);
  }, [transactions, appliedFilters]);

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

  return (
    <section className="min-h-full bg-[#EFEFEF] px-5 py-6 text-[#1F2933] md:px-7 lg:p-14">
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-extrabold leading-none text-[#2B3640]">
              ยอดรวมทั้งหมด
            </h1>

            <p className="mt-3 text-[13px] text-[#67727E]">
              • สรุปยอดการใช้บริการและการชำระเงิน
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#59D46B] bg-[#F5FFF6] px-4 py-1.5 text-[11px] font-semibold text-[#34B44C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34B44C]" />
            <span>Real-Time</span>
          </div>
        </div>

        <div className="mb-8">
          <DateRangeDropdown
            value={selectedRange}
            onChange={setSelectedRange}
          />
        </div>

        {summaryData.summaryCards.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summaryData.summaryCards.map(({ key, ...card }) => (
              <DashboardStatCard key={key} {...card} />
            ))}
          </div>
        ) : null}

        {summaryData.serviceCards.length > 0 ? (
          <div className="mt-8">
            <DashboardSectionTitle
              title="ยอดรวมทั้งหมด"
              description="สรุปยอดการใช้บริการและการชำระเงิน"
            />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {summaryData.serviceCards.map(({ key, ...card }) => (
                <DashboardProgressCard key={key} {...card} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <UserActivityChart
            data={summaryData.chartData}
            channels={summaryData.channels}
            totalRevenue={summaryData.totalRevenue}
            highlightLabel={summaryData.highlightLabel}
          />
        </div>
      </div>
    </section>
  );
}

export default SummaryPage;