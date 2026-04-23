import { LuCalendarDays, LuClock3, LuQrCode, LuReceiptText } from "react-icons/lu";

function RowItem({
    icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-[#E8EBEF] px-5 py-4">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#1F2933]">
                    {icon}
                </div>
                <span className="text-[16px] text-[#1F2933]">{label}</span>
            </div>

            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#061D36] text-white">
                ✓
            </div>
        </div>
    );
}

function SystemEntryBillContent() {
    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border-t-4 border-[#0D1B2A] bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-3 text-[22px] font-extrabold text-[#1F2933]">
                    <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                    กำหนดข้อมูลในใบเสร็จ
                </h2>

                <div className="mt-8 space-y-4">
                    <RowItem icon={<LuCalendarDays size={18} />} label="วัน เดือน ปี" />
                    <RowItem icon={<LuClock3 size={18} />} label="เวลาเข้า" />
                    <RowItem icon={<LuQrCode size={18} />} label="QR Code" />
                    <RowItem icon={<LuReceiptText size={18} />} label="รหัสบิล" />
                </div>

                <div className="mt-10 flex justify-center gap-4 border-t border-[#E5E7EB] pt-6">
                    <button
                        type="button"
                        className="rounded-full bg-[#061D36] px-8 py-3 text-[14px] font-semibold text-white"
                    >
                        บันทึก
                    </button>
                    <button
                        type="button"
                        className="rounded-full bg-[#061D36] px-8 py-3 text-[14px] font-semibold text-white"
                    >
                        ยกเลิก
                    </button>
                </div>
            </div>

            <div className="rounded-2xl bg-[#D9DDE4] p-5 shadow-sm">
                <div className="mb-4 text-[18px] font-bold text-[#1F2933]">ตัวอย่าง</div>

                <div className="mx-auto w-[260px] rounded-xl bg-white p-6 shadow-md">
                    <div className="text-center text-[28px] font-extrabold text-[#1F2933]">
                        Smart Carpark
                    </div>
                    <div className="mt-1 text-center text-[10px] text-[#6B7280]">
                        ระบบจอดรถอัจฉริยะ | อาคาร A-12
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-y-2 text-[13px]">
                        <div>วันที่ :</div>
                        <div className="text-right">25/10/2023</div>
                        <div>เวลาเข้า :</div>
                        <div className="text-right">14:30:22</div>
                        <div>รหัสบิล :</div>
                        <div className="text-right">#GP-09941</div>
                    </div>

                    <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center bg-[#F3F4F6]">
                        QR
                    </div>

                    <div className="mt-8 border-t border-dashed border-[#D1D5DB] pt-6 text-center">
                        <div className="text-[18px] font-bold">ขอบคุณผู้ใช้บริการ</div>
                        <div className="mt-1 text-[11px] text-[#6B7280]">
                            โปรดเก็บใบเสร็จนี้เพื่อใช้อ้างอิงภายหลัง
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SystemEntryBillContent;