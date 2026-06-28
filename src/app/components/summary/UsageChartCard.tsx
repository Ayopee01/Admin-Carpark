"use client";

import type { OverviewUsageChartItem } from "@/src/app/type/summary/summary";

type Props = {
    title?: string;
    description?: string;
    badgeLabel?: string;
    items: OverviewUsageChartItem[];
};

function UsageChartCard({
    title = "สถิติการใช้งานของผู้ใช้",
    description = "ข้อมูลแสดงจำนวนผู้ใช้งานบริการ (ชม.) รายสัปดาห์",
    badgeLabel = "มีการใช้",
    items,
}: Props) {
    const width = 640;
    const height = 260;
    const paddingLeft = 30;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 42;

    const innerWidth = width - paddingLeft - paddingRight;
    const innerHeight = height - paddingTop - paddingBottom;

    const maxValue = Math.max(...items.map((item) => item.value), 1);

    const points = items.map((item, index) => {
        const x =
            paddingLeft +
            (items.length === 1
                ? innerWidth / 2
                : (index * innerWidth) / (items.length - 1));

        const y =
            paddingTop +
            innerHeight -
            (item.value / maxValue) * (innerHeight - 12);

        return {
            ...item,
            x,
            y,
        };
    });

    const polylinePoints = points
        .map((point) => `${point.x},${point.y}`)
        .join(" ");

    return (
        <article className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h3 className="text-[18px] font-bold text-[#1F2937]">
                        {title}
                    </h3>

                    <p className="mt-1 text-[12px] text-[#667085]">
                        {description}
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 text-[12px] font-medium text-[#667085]">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                    {badgeLabel}
                </div>
            </div>

            {items.length === 0 ? (
                <div className="flex min-h-[260px] items-center justify-center text-[14px] text-[#98A2B3]">
                    ไม่มีข้อมูลกราฟ
                </div>
            ) : (
                <>
                <div className="space-y-3 md:hidden">
                    {items.map((item) => {
                        const percent = Math.max(4, (item.value / maxValue) * 100);

                        return (
                            <div
                                key={item.label}
                                className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)_44px] items-center gap-3"
                            >
                                <span className="truncate text-[12px] font-medium text-[#667085]">
                                    {item.label}
                                </span>
                                <div className="h-7 min-w-0 rounded-full bg-[#EEF2F6]">
                                    <div
                                        className="h-full rounded-full bg-[#8EC0F4]"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="text-right text-[12px] font-bold text-[#1F2937]">
                                    {item.value}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="hidden w-full overflow-x-auto md:block">
                    <div className="min-w-[620px]">
                        <svg
                            viewBox={`0 0 ${width} ${height}`}
                            className="h-[260px] w-full"
                            preserveAspectRatio="none"
                        >
                            {[0, 1, 2, 3].map((line) => {
                                const y = paddingTop + (innerHeight / 3) * line;

                                return (
                                    <line
                                        key={line}
                                        x1={paddingLeft}
                                        y1={y}
                                        x2={width - paddingRight}
                                        y2={y}
                                        stroke="#E5E7EB"
                                        strokeWidth="1"
                                    />
                                );
                            })}

                            <polyline
                                fill="none"
                                stroke="#8EC0F4"
                                strokeWidth="4"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                points={polylinePoints}
                            />

                            {points.map((point) => (
                                <g key={point.label}>
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="4.5"
                                        fill="#8EC0F4"
                                    />

                                    <text
                                        x={point.x}
                                        y={height - 12}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="#667085"
                                    >
                                        {point.label}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>
                </>
            )}
        </article>
    );
}

export default UsageChartCard;
