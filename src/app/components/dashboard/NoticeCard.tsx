//Types
import type { NoticeCardProps } from "@/src/app/type/dashboard/dashboard";

function NoticeCard({ children, isError = false }: NoticeCardProps) {
    return (
        <div
            className={`rounded-[20px] bg-white p-6 shadow-sm ${isError ? "text-red-600" : "text-[#1F2933]"
                }`}
        >
            {children}
        </div>
    );
}

export default NoticeCard;