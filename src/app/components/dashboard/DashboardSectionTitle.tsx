//Types
import type { DashboardSectionTitleProps } from "@/src/app/type/dashboard/dashboard";

function DashboardSectionTitle({
    title,
    description,
}: DashboardSectionTitleProps) {
    return (
        <div className="mb-5">
            <h2 className="text-[18px] font-extrabold leading-none text-[#1F2933]">
                {title}
            </h2>

            {description ? (
                <p className="mt-2 text-[12px] text-[#6B7280]">• {description}</p>
            ) : null}
        </div>
    );
}

export default DashboardSectionTitle;