//Types
import type { DashboardStatCardProps } from "@/src/app/type/dashboard/dashboard";

function DashboardStatCard({
    title,
    value,
    unit,
    note,
    icon: Icon,
}: DashboardStatCardProps) {
    return (
        <div className="rounded-[14px] border-t-[3px] border-[#1D2A36] bg-[#DCDDDF] px-5 pb-5 pt-4">
            <div className="mb-7 flex items-start justify-between gap-4">
                <div className="text-[11px] font-medium text-[#4B5563]">{title}</div>

                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#E5E7EB] text-[#1F2933]">
                    <Icon size={15} />
                </div>
            </div>

            <div className="flex items-end gap-2">
                <div className="text-[28px] font-extrabold leading-none text-[#4B5563] md:text-[30px]">
                    {value}
                </div>

                {unit ? (
                    <div className="pb-[2px] text-[12px] text-[#6B7280]">{unit}</div>
                ) : null}
            </div>

            {note ? (
                <div className="mt-4 text-[11px] font-medium text-[#1F2933]">
                    {note}
                </div>
            ) : null}
        </div>
    );
}

export default DashboardStatCard;