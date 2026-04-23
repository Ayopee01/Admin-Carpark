function SystemDeviceConfigContent() {
    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border-t-4 border-[#0D1B2A] bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-3 text-[22px] font-extrabold text-[#1F2933]">
                    <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                    ตั้งค่าอุปกรณ์
                </h2>

                <div className="mt-8 space-y-6">
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-[14px] text-[#667085]">ขนาดตัวอักษร (พิกเซล)</label>
                            <span className="rounded bg-[#E5E7EB] px-2 py-1 text-[11px] text-[#667085]">
                                ปัจจุบัน: 12px
                            </span>
                        </div>
                        <div className="flex items-center rounded-xl bg-[#E5E7EB] px-4 py-4">
                            <input
                                defaultValue="12"
                                className="w-full bg-transparent text-[28px] font-bold outline-none"
                            />
                            <span className="text-[20px] text-[#667085]">px</span>
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-[14px] text-[#667085]">
                                ขนาดเลข BILL NUMBER (พิกเซล)
                            </label>
                            <span className="rounded bg-[#E5E7EB] px-2 py-1 text-[11px] text-[#667085]">
                                ปัจจุบัน: 16px
                            </span>
                        </div>
                        <div className="flex items-center rounded-xl bg-[#E5E7EB] px-4 py-4">
                            <input
                                defaultValue="16"
                                className="w-full bg-transparent text-[28px] font-bold outline-none"
                            />
                            <span className="text-[20px] text-[#667085]">px</span>
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-[14px] text-[#667085]">ปรับเส้นบรรทัดกระดาษ (มม.)</label>
                            <span className="rounded bg-[#E5E7EB] px-2 py-1 text-[11px] text-[#667085]">
                                ปัจจุบัน: 80mm
                            </span>
                        </div>
                        <div className="flex items-center rounded-xl bg-[#E5E7EB] px-4 py-4">
                            <input
                                defaultValue="80"
                                className="w-full bg-transparent text-[28px] font-bold outline-none"
                            />
                            <span className="text-[20px] text-[#667085]">mm</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-end gap-4 border-t border-[#E5E7EB] pt-6">
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

            <div className="space-y-4">
                <div className="rounded-2xl bg-[#D9DDE4] p-5 shadow-sm">
                    <div className="text-[18px] font-bold text-[#1F2933]">คำแนะนำการตั้งค่า</div>
                    <p className="mt-3 text-[14px] leading-7 text-[#667085]">
                        การปรับขนาดตัวอักษรจะส่งผลต่อการจัดวางข้อมูลในใบเสร็จ หากขนาดใหญ่เกินไปอาจทำให้ข้อมูลล้นขอบกระดาษได้
                    </p>

                    <div className="mt-4 rounded-xl bg-[#EEF1F5] p-4 text-[13px] text-[#667085]">
                        * แนะนำให้ทดลองพิมพ์ใบเสร็จหลังตั้งค่าทุกครั้ง
                    </div>
                </div>

                <div className="rounded-2xl bg-[#D9DDE4] p-5 shadow-sm">
                    <div className="mb-4 text-[18px] font-bold text-[#1F2933]">Live Preview</div>

                    <div className="mx-auto max-w-[220px] rounded-xl bg-white p-5 shadow-sm">
                        <div className="mx-auto mb-4 h-10 w-10 rounded-lg bg-[#EEF2F6]" />
                        <div className="mx-auto mb-2 h-[2px] w-32 bg-[#E5E7EB]" />
                        <div className="text-center text-[12px] font-bold">PARKING RECEIPT</div>
                        <div className="mt-6 space-y-2 text-[11px] text-[#374151]">
                            <div>วันที่ :</div>
                            <div>เวลาเข้า :</div>
                            <div>รหัสบิล: #A8902</div>
                        </div>

                        <div className="mx-auto mt-8 h-20 w-20 rounded bg-[#F3F4F6]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SystemDeviceConfigContent;