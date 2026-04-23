import { LuBell, LuHouse, LuPlus, LuPrinter } from "react-icons/lu";

function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="rounded-xl bg-[#D9D9D9] px-5 py-5 shadow-sm">
            <div className="text-[12px] font-medium text-[#59636E]">{title}</div>
            <div className="mt-6 text-[36px] font-extrabold leading-none text-[#1F2933]">
                {value}
            </div>
        </div>
    );
}

function DeviceSettingContent() {
    return (
        <>
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 text-[20px] font-extrabold text-[#2B3640]">
                    <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                    การตั้งค่าอุปกรณ์
                </h2>

                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center border-l border-[#1F2933] text-[#1F2933]">
                        <LuBell size={32} />
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full bg-[#061D36] px-5 py-3 text-[14px] font-semibold text-white"
                    >
                        <LuPlus size={16} />
                        เพิ่มอุปกรณ์
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard title="อุปกรณ์ทั้งหมด" value="12" />
                <StatCard title="เชื่อมต่อปกติ" value="10" />
                <StatCard title="บางการเชื่อมต่อ" value="02" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl border border-[#AEB6C0] bg-[#F8F8F8] shadow-sm">
                    <div className="rounded-t-2xl bg-[#031C36] px-6 py-5 text-[18px] font-extrabold text-white">
                        อุปกรณ์ที่มีอยู่ในระบบ
                    </div>

                    <div className="space-y-4 p-6">
                        {[
                            "Printer 1",
                            "Printer Counter B",
                            "LPR Entry A",
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECEFF2] text-[#1F2933]">
                                    {item.includes("LPR") ? <LuHouse size={18} /> : <LuPrinter size={18} />}
                                </div>

                                <div>
                                    <div className="font-semibold text-[#1F2933]">{item}</div>
                                    <div className="text-[13px] text-[#667085]">
                                        192.168.2.105 • ESC/POS • เชื่อมต่อปกติ
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl bg-[#D9D9D9] p-5 shadow-sm">
                    <h3 className="text-[18px] font-extrabold text-[#2B3640]">กิจกรรมล่าสุด</h3>

                    <div className="mt-5 space-y-4">
                        <div className="rounded-xl bg-[#F8F8F8] p-4">
                            <div className="font-semibold">Member login</div>
                            <div className="mt-1 text-[13px] text-[#667085]">
                                จากครู A, ผู้ใช้ ประสบการณ์ถูกพิเศษ ...
                            </div>
                        </div>

                        <div className="rounded-xl bg-[#F8F8F8] p-4">
                            <div className="font-semibold">Backup completed</div>
                            <div className="mt-1 text-[13px] text-[#667085]">
                                สำรองข้อมูล LPR-04 เสร็จเรียบร้อย
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="mt-5 w-full rounded-lg border border-[#1F2933] px-4 py-3 text-[13px] font-semibold"
                    >
                        ดูทั้งหมด
                    </button>
                </div>
            </div>
        </>
    );
}

export default DeviceSettingContent;