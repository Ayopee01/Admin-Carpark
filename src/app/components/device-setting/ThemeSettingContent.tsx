function ThemeSettingContent() {
    return (
        <>
            <h2 className="mb-6 flex items-center gap-3 text-[20px] font-extrabold text-[#2B3640]">
                <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                การตั้งค่าธีม
            </h2>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl bg-[#F8F8F8] p-6">
                    <div className="text-[18px] font-extrabold text-[#2B3640]">ธีมที่มีอยู่</div>

                    <div className="mt-5 flex flex-wrap gap-4">
                        {["ธีม 01", "ธีม 02", "ธีม 03", "ธีม 04"].map((item, index) => (
                            <button
                                key={item}
                                type="button"
                                className={`rounded-xl border p-4 text-left ${index === 1
                                        ? "border-[#0D1B2A] bg-white shadow-sm"
                                        : "border-transparent bg-[#E9EAEC]"
                                    }`}
                            >
                                <div className="flex gap-2">
                                    <span className="h-8 w-8 rounded bg-[#96CCFF]" />
                                    <span className="h-8 w-8 rounded bg-[#FFD54F]" />
                                </div>
                                <div className="mt-3 text-[13px] font-semibold">{item}</div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 rounded-2xl border border-[#E0E2E6] bg-white p-6">
                        <div className="mb-5 text-center text-[20px] font-extrabold text-[#2B3640]">
                            เซ็ตหลัก 2 สี
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-xl bg-[#E6EEF4] p-4">
                                <div className="text-[12px] font-semibold text-[#667085]">สีหลัก (PRIMARY)</div>
                                <div className="mt-3 flex items-center gap-3">
                                    <span className="h-10 w-10 rounded bg-[#0D1B2A]" />
                                    <span className="text-[14px] font-medium">#0D1B2A</span>
                                </div>
                            </div>

                            <div className="rounded-xl bg-[#E6EEF4] p-4">
                                <div className="text-[12px] font-semibold text-[#667085]">สีรอง (SECONDARY)</div>
                                <div className="mt-3 flex items-center gap-3">
                                    <span className="h-10 w-10 rounded bg-[#FFD54F]" />
                                    <span className="text-[14px] font-medium">#FFD54F</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[24px] border border-[#667085] bg-[#F8F8F8] p-5">
                    <div className="text-[24px] font-extrabold text-[#2B3640]">ตัวอย่าง</div>

                    <div className="mt-5 rounded-xl bg-[#EFEFEF] p-4">
                        <div className="rounded-xl bg-white p-4">
                            <div className="mb-4 h-3 w-32 rounded-full bg-[#F1E9C9]" />
                            <div className="mb-2 h-3 rounded bg-[#F3F4F6]" />
                            <div className="mb-2 h-3 w-3/4 rounded bg-[#F3F4F6]" />
                            <div className="rounded-xl bg-[#EEE9DB] p-8">
                                <div className="mx-auto h-14 w-14 rounded-b-2xl border-[4px] border-[#0D1B2A] border-t-0" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="mt-5 w-full rounded-xl bg-[#0D1B2A] px-4 py-4 text-[16px] font-bold text-white"
                    >
                        ตัวอย่าง
                    </button>

                    <button
                        type="button"
                        className="mt-3 w-full rounded-xl bg-[#FFD54F] px-4 py-4 text-[16px] font-bold text-white"
                    >
                        ตัวอย่าง
                    </button>

                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            className="flex-1 rounded-full bg-[#0D1B2A] px-4 py-3 text-[14px] font-semibold text-white"
                        >
                            บันทึก
                        </button>
                        <button
                            type="button"
                            className="flex-1 rounded-full bg-[#0D1B2A] px-4 py-3 text-[14px] font-semibold text-white"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ThemeSettingContent;