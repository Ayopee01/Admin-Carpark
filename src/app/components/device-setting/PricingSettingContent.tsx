import { LuPlus } from "react-icons/lu";

function PricingCard({
    hour,
    price,
}: {
    hour: string;
    price: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-[#667085] bg-[#F8F8F8] px-6 py-6">
            <div>
                <div className="text-[28px] font-extrabold text-[#1F2933]">
                    {hour} : <span className="text-[#34C759]">{price}</span>
                </div>
                <div className="mt-1 text-[13px] text-[#667085]">ราคาสำหรับ {hour}</div>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    className="rounded-full border border-[#FF4D3A] px-5 py-2 text-[13px] font-semibold text-[#FF4D3A]"
                >
                    แก้ไข
                </button>
                <button
                    type="button"
                    className="rounded-full border border-[#FF4D3A] px-5 py-2 text-[13px] font-semibold text-[#FF4D3A]"
                >
                    ลบ
                </button>
            </div>
        </div>
    );
}

function PricingSettingContent() {
    return (
        <>
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 text-[20px] font-extrabold text-[#2B3640]">
                    <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                    กำหนดราคาค่าบริการ
                </h2>

                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#061D36] px-5 py-3 text-[14px] font-semibold text-white"
                >
                    <LuPlus size={16} />
                    เพิ่มเงื่อนไข
                </button>
            </div>

            <div className="space-y-4">
                <PricingCard hour="ชั่วโมง 1" price="10 บาท" />
                <PricingCard hour="ชั่วโมง 2" price="20 บาท" />
            </div>
        </>
    );
}

export default PricingSettingContent;