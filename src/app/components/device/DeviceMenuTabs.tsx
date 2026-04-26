"use client";

export type SettingMenuKey =
    | "device"
    | "pricing"
    | "channels"
    | "theme";

type SettingMenuTabsProps = {
    activeTab: SettingMenuKey;
    onChange: (tab: SettingMenuKey) => void;
};

const menuItems: {
    key: SettingMenuKey;
    label: string;
}[] = [
        {
            key: "device",
            label: "การตั้งค่าอุปกรณ์",
        },
        {
            key: "pricing",
            label: "กำหนดค่าบริการ",
        },
        {
            key: "channels",
            label: "ช่องทางการชำระค่าบริการ",
        },
        {
            key: "theme",
            label: "ธีม",
        },
    ];

function SettingMenuTabs({ activeTab, onChange }: SettingMenuTabsProps) {
    return (
        <div className="mt-6 flex flex-wrap gap-2 rounded-xl bg-[#E3E5E8] p-2 md:inline-flex">
            {menuItems.map((item) => {
                const isActive = item.key === activeTab;

                return (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => onChange(item.key)}
                        className={`rounded-lg px-4 py-3 text-[13px] font-semibold transition ${isActive
                                ? "bg-white text-[#1F2933] shadow-sm"
                                : "text-[#1F2933] hover:bg-white/70"
                            }`}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}

export default SettingMenuTabs;