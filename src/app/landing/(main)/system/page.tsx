"use client";

import { useEffect, useMemo, useState } from "react";
import Preload from "@/src/app/components/Preload";
import SystemMenuTabs, {
  type SystemMenuKey,
} from "@/src/app/components/system/SystemMenuTabs";
import SystemDeviceConfigContent from "@/src/app/components/system/SetupBill/SetupBillContent";
import SystemEntryBillContent from "@/src/app/components/system/EntryBill/EntryBillContent";
import SystemPaidBillContent from "@/src/app/components/system/PaidBill/PaidBillContent";

function formatThaiDateTime(date: Date) {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  })
    .format(date)
    .replace(",", "");
}

function getLoadingDetail(activeTab: SystemMenuKey) {
  switch (activeTab) {
    case "device":
      return "กำลังโหลดการตั้งค่าระบบ";
    case "entry_bill":
      return "กำลังโหลดการตั้งค่าใบ Bill เข้าใช้บริการ";
    case "paid_bill":
      return "กำลังโหลดการตั้งค่าใบ Bill หลังชำระ";
    default:
      return "ระบบลานจอดรถ";
  }
}

function SettingSystemPage() {
  const [activeTab, setActiveTab] = useState<SystemMenuKey>("device");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateDateTime() {
      setCurrentDateTime(formatThaiDateTime(new Date()));
    }

    updateDateTime();

    const intervalId = window.setInterval(updateDateTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setProgress(8);

    const timers = [
      window.setTimeout(() => setProgress(18), 120),
      window.setTimeout(() => setProgress(60), 260),
      window.setTimeout(() => setProgress(82), 420),
      window.setTimeout(() => setProgress(100), 560),
      window.setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 750),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [activeTab]);

  const pageTitle = useMemo(() => {
    switch (activeTab) {
      case "device":
        return {
          title: "ตั้งค่าระบบ",
          description: "ตั้งค่าการแสดงผลใบเสร็จและอุปกรณ์",
        };

      case "entry_bill":
        return {
          title: "ตั้งค่าใบเสร็จ",
          description:
            "Configure your receipt layout and content for entry and payment phases.",
        };

      case "paid_bill":
        return {
          title: "ตั้งค่าใบเสร็จ",
          description:
            "ตั้งค่ารูปแบบและเนื้อหาใบเสร็จรับเงินของคุณสำหรับขั้นตอนการจอดทะเบียนและการชำระเงิน",
        };

      default:
        return {
          title: "ตั้งค่าระบบ",
          description: "ตั้งค่าการแสดงผลใบเสร็จและอุปกรณ์",
        };
    }
  }, [activeTab]);

  function renderContent() {
    switch (activeTab) {
      case "device":
        return <SystemDeviceConfigContent />;

      case "entry_bill":
        return <SystemEntryBillContent />;

      case "paid_bill":
        return <SystemPaidBillContent />;

      default:
        return <SystemDeviceConfigContent />;
    }
  }

  if (loading) {
    return (
      <Preload
        open
        progress={progress}
        message="กำลังโหลดข้อมูล..."
        detail={getLoadingDetail(activeTab)}
        fullscreen={false}
      />
    );
  }

  return (
    <section className="min-h-screen bg-[#EFEFEF] px-6 py-8 text-[#1F2933] md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#49C85B] bg-[#F5FFF6] px-4 py-2 text-[13px] font-semibold text-[#38B449]">
            <span className="h-2 w-2 rounded-full bg-[#38B449]" />
            <span>Real-Time</span>
          </div>

          <div className="text-[14px] text-[#808892]">
            {currentDateTime || "-"}
          </div>
        </div>

        <div>
          <h1 className="text-[42px] font-extrabold leading-none text-[#2B3640]">
            {pageTitle.title}
          </h1>

          <p className="mt-2 text-[15px] text-[#67727E]">
            {pageTitle.description}
          </p>
        </div>

        <SystemMenuTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-8">{renderContent()}</div>
      </div>
    </section>
  );
}

export default SettingSystemPage;