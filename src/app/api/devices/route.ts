import { NextResponse } from "next/server";
import mockData from "@/src/app/mock/device-data.json";
import type {
    DeviceActivityItem,
    DeviceAlertItem,
    DeviceItem,
    DeviceRaw,
    DeviceResponse,
    DeviceSummaryItem,
} from "@/src/app/type/device";

type DeviceMockJson = {
    devices: DeviceRaw[];
    activities: DeviceActivityItem[];
    alerts: DeviceAlertItem[];
};

const data = mockData as DeviceMockJson;

function formatServerTime(date: Date) {
    return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

function getTypeText(type: DeviceRaw["type"]) {
    switch (type) {
        case "printer":
            return "เครื่องพิมพ์";
        case "lpr":
            return "กล้อง LPR";
        case "camera":
            return "กล้อง";
        case "barrier":
            return "ไม้กั้น";
        default:
            return "อุปกรณ์";
    }
}

function getStatusText(status: DeviceRaw["status"]) {
    return status === "connected" ? "เชื่อมต่อปกติ" : "กำลังการเชื่อมต่อ";
}

function getBadgeText(type: DeviceRaw["type"]) {
    if (type === "printer") return "เครื่องพิมพ์";
    if (type === "lpr") return "กล้อง LPR";
    if (type === "camera") return "กล้อง";
    if (type === "barrier") return "ไม้กั้น";
    return "";
}

function mapDevice(device: DeviceRaw): DeviceItem {
    return {
        ...device,
        typeText: getTypeText(device.type),
        statusText: getStatusText(device.status),
        badgeText: getBadgeText(device.type),
    };
}

function calculateSummary(devices: DeviceRaw[]): DeviceSummaryItem[] {
    const connected = devices.filter((device) => device.status === "connected");
    const connecting = devices.filter((device) => device.status === "connecting");

    return [
        {
            title: "อุปกรณ์ทั้งหมด",
            value: devices.length,
        },
        {
            title: "เชื่อมต่อปกติ",
            value: connected.length,
        },
        {
            title: "บางการเชื่อมต่อ",
            value: connecting.length,
        },
    ];
}

export async function GET() {
    const response: DeviceResponse = {
        ok: true,
        message: "Fetched device data successfully",
        data: {
            serverTimeText: formatServerTime(new Date()),
            summary: calculateSummary(data.devices),
            devices: data.devices.map(mapDevice),
            activities: data.activities,
            alerts: data.alerts,
        },
    };

    return NextResponse.json(response);
}