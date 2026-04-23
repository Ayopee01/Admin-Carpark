import { LuPlus } from "react-icons/lu";

function ChannelSettingContent() {
    return (
        <>
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 text-[20px] font-extrabold text-[#2B3640]">
                    <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                    การกำหนดช่องทางการชำระค่าบริการ
                </h2>

                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#061D36] px-5 py-3 text-[14px] font-semibold text-white"
                >
                    <LuPlus size={16} />
                    เพิ่มช่องทาง
                </button>
            </div>

            <div className="rounded-2xl bg-[#D9D9D9] p-6">
                <div className="text-[18px] font-extrabold text-[#2B3640]">วิธีการชำระเงิน</div>

                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                    {[
                        "แคชเชียร์ 1",
                        "ธนาคาร 1",
                        "ธนาคาร 2",
                        "สแกนจ่าย 1",
                        "วอลเล็ต 1",
                        "อื่นๆ",
                    ].map((item) => (
                        <div key={item} className="rounded-xl bg-[#ECECEC] p-4">
                            <div className="text-[15px] font-semibold">{item}</div>
                            <div className="mt-2 text-[12px] text-[#667085]">ตัวอย่างช่องทาง</div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 rounded-2xl bg-[#EFEFEF] p-5">
                    <div className="mb-4 text-[18px] font-extrabold text-[#2B3640]">
                        การตั้งค่าช่องทางบริการ
                    </div>

                    <div className="space-y-4">
                        {["แคชเชียร์", "Kiosk", "สแกนจ่าย", "Exit Gate"].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between rounded-xl border border-[#E0E2E6] bg-white px-5 py-4"
                            >
                                <div className="font-semibold">{item}</div>

                                <button
                                    type="button"
                                    className="rounded-full border border-[#FF4D3A] px-5 py-2 text-[13px] font-semibold text-[#FF4D3A]"
                                >
                                    แก้ไข
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChannelSettingContent;