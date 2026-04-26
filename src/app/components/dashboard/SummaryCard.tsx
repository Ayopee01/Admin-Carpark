import type { ReactNode } from "react";

type SummaryCardProps = {
    title: string;
    value: string;
    suffix?: string;
    note: string;
    icon: ReactNode;
};

function SummaryCard({ title, value, suffix, note, icon }: SummaryCardProps) {
    return (
        <article className="relative min-h-[138px] rounded-[8px] bg-[#E4E6E8] px-5 pb-4 pt-4 shadow-none">
            <div className="absolute inset-x-0 top-0 h-[4px] rounded-t-[8px] bg-[#1F2937]" />

            <div className="flex items-start justify-between">
                <p className="text-[11px] font-medium leading-[16px] text-[#5F6B76]">
                    {title}
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#D9DDE1] text-[#1F2937]">
                    {icon}
                </div>
            </div>

            <div className="mt-7 flex items-end gap-2">
                <h3 className="text-[28px] font-bold leading-none tracking-[-0.03em] text-[#4B5563] md:text-[32px]">
                    {value}
                </h3>

                {suffix ? (
                    <span className="mb-[2px] text-[12px] font-medium text-[#6B7280]">
                        {suffix}
                    </span>
                ) : null}
            </div>

            <p className="mt-4 text-[11px] font-semibold leading-[16px] text-[#111827]">
                {note}
            </p>
        </article>
    );
}

export default SummaryCard;