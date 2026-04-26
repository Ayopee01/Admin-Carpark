import type { ReactNode } from "react";
import ProgressBar from "@/src/app/components/dashboard/ProgressBar";

type RevenueGroupCardProps = {
    title: string;
    description: string;
    amountText: string;
    percent: number;
    icon: ReactNode;
};

function RevenueGroupCard({
    title,
    description,
    amountText,
    percent,
    icon,
}: RevenueGroupCardProps) {
    return (
        <article className="rounded-[18px] bg-[#E4E6E8] px-5 pb-4 pt-4 shadow-none md:px-6 md:pb-5 md:pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#F7F7F8] text-[#1F2937]">
                {icon}
            </div>

            <div className="mt-5">
                <h3 className="text-[18px] font-bold leading-[1.25] text-[#111827]">
                    {title}
                </h3>
                <p className="mt-1 text-[11px] font-medium leading-[16px] text-[#4B5563]">
                    {description}
                </p>
            </div>

            <div className="mt-10 flex items-end justify-between gap-3">
                <p className="text-[30px] font-medium leading-none tracking-[-0.03em] text-[#1F2937] md:text-[34px]">
                    {amountText}
                </p>
                <span className="text-[11px] font-bold leading-none text-[#111827]">
                    {percent}%
                </span>
            </div>

            <div className="mt-4">
                <ProgressBar
                    value={percent}
                    colorClass="bg-[#F2C744]"
                    trackClass="bg-white/80"
                    heightClass="h-[5px]"
                />
            </div>
        </article>
    );
}

export default RevenueGroupCard;