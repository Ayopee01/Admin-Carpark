"use client";

import { useMemo, useState } from "react";
import SettingMenuTabs, {
  type SettingMenuKey,
} from "@/src/app/components/device-setting/DeviceMenuTabs";
import DeviceSettingContent from "@/src/app/components/device-setting/DeviceSettingContent";
import PricingSettingContent from "@/src/app/components/device-setting/PricingSettingContent";
import ChannelSettingContent from "@/src/app/components/device-setting/ChannelSettingContent";
import ThemeSettingContent from "@/src/app/components/device-setting/ThemeSettingContent";

function SettingDevicePage() {
  const [activeTab, setActiveTab] = useState<SettingMenuKey>("device");

  const pageTitle = useMemo(() => {
    switch (activeTab) {
      case "device":
        return {
          title: "การตั้งค่าอุปกรณ์",
          description: "ตั้งค่าการบริการผ่านตู้ป้อนออกการใช้บริการ",
        };
      case "pricing":
        return {
          title: "การตั้งราคาค่าบริการ",
          description: "ตั้งค่าราคาบริการตามเงื่อนไขเวลาการใช้บริการ",
        };
      case "channels":
        return {
          title: "การตั้งราคาค่าบริการ",
          description: "ตั้งค่าราคาบริการตามเงื่อนไขเวลาการใช้บริการ",
        };
      case "theme":
        return {
          title: "การตั้งค่าอุปกรณ์",
          description: "ตั้งค่าธีมการบริการตามเงื่อนไขเวลาการใช้บริการ",
        };
      default:
        return {
          title: "การตั้งค่าอุปกรณ์",
          description: "ตั้งค่าการบริการผ่านตู้ป้อนออกการใช้บริการ",
        };
    }
  }, [activeTab]);

  function renderContent() {
    switch (activeTab) {
      case "device":
        return <DeviceSettingContent />;
      case "pricing":
        return <PricingSettingContent />;
      case "channels":
        return <ChannelSettingContent />;
      case "theme":
        return <ThemeSettingContent />;
      default:
        return <DeviceSettingContent />;
    }
  }

  return (
    <section className="min-h-screen bg-[#EFEFEF] px-6 py-8 text-[#1F2933] md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#49C85B] bg-[#F5FFF6] px-4 py-2 text-[13px] font-semibold text-[#38B449]">
            <span className="h-2 w-2 rounded-full bg-[#38B449]" />
            <span>Real-Time</span>
          </div>

          <div className="text-[14px] text-[#808892]">11 เม.ย. 2569 21:47:55</div>
        </div>

        <div>
          <h1 className="text-[42px] font-extrabold leading-none text-[#2B3640]">
            {pageTitle.title}
          </h1>
          <p className="mt-2 text-[15px] text-[#67727E]">
            {pageTitle.description}
          </p>
        </div>

        <SettingMenuTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-8">{renderContent()}</div>
      </div>
    </section>
  );
}

export default SettingDevicePage;