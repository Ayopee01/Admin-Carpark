//Types
import type { DashboardProgressCardProps } from "@/src/app/type/dashboard/dashboard";

function DashboardProgressCard({
    title,
    description,
    subText,
    amount,
    percent,
    icon: Icon,
    compact = false,
}: DashboardProgressCardProps) {
    const progressColor = compact ? "bg-[#1D2A36]" : "bg-[#E7B93E]";

    return (
        <div
            className={`rounded-[18px] bg-[#DCDDDF] ${compact ? "min-h-[160px] p-5" : "min-h-[190px] p-6"
                }`}
        >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-[10px] bg-white text-[#1F2933]">
                <Icon size={18} />
            </div>

            <div
                className={`font-bold text-[#111827] ${compact ? "text-[18px]" : "text-[22px]"
                    }`}
            >
                {title}
            </div>

            {description ? (
                <div className="mt-2 text-[12px] leading-5 text-[#4B5563]">
                    {description}
                </div>
            ) : null}

            {subText ? (
                <div className="mt-1 text-[11px] text-[#6B7280]">{subText}</div>
            ) : null}

            <div className="mt-8 flex items-end justify-between gap-4">
                <div
                    className={`font-medium leading-none text-[#1F2933] ${compact ? "text-[22px]" : "text-[28px]"
                        }`}
                >
                    {amount}
                </div>

                {typeof percent === "number" ? (
                    <div className="text-[11px] font-semibold text-[#1F2933]">
                        {percent}%
                    </div>
                ) : null}
            </div>

            {typeof percent === "number" ? (
                <div className="mt-4 h-[5px] w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                    <div
                        className={`h-full rounded-full ${progressColor}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            ) : null}
        </div>
    );
}

export default DashboardProgressCard;