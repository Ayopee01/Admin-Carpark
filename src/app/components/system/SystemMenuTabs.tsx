"use client";

export type SystemMenuKey = "device" | "entry_bill" | "paid_bill";

type SystemMenuTabsProps = {
    activeTab: SystemMenuKey;
    onChange: (tab: SystemMenuKey) => void;
};

const menuItems: {
    key: SystemMenuKey;
    label: string;
}[] = [
        {
            key: "device",
            label: "ตั้งค่าอุปกรณ์",
        },
        {
            key: "entry_bill",
            label: "ใบ Bill เข้าใช้บริการ",
        },
        {
            key: "paid_bill",
            label: "ใบ Bill หลังชำระ",
        },
    ];

function SystemMenuTabs({ activeTab, onChange }: SystemMenuTabsProps) {
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

export default SystemMenuTabs;