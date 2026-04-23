export type DeviceStatus = "connected" | "connecting";

export type DeviceType = "printer" | "lpr" | "camera" | "barrier";

export type DeviceRaw = {
    id: string;
    name: string;
    type: DeviceType;
    ipAddress: string;
    model: string;
    status: DeviceStatus;
};

export type DeviceItem = DeviceRaw & {
    typeText: string;
    statusText: string;
    badgeText?: string;
};

export type DeviceActivityItem = {
    id: string;
    title: string;
    description: string;
    timeText: string;
};

export type DeviceAlertItem = {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    actionLabel: string;
};

export type DeviceSummaryItem = {
    title: string;
    value: number;
};

export type DeviceResponse = {
    ok: boolean;
    message: string;
    data: {
        serverTimeText: string;
        summary: DeviceSummaryItem[];
        devices: DeviceItem[];
        activities: DeviceActivityItem[];
        alerts: DeviceAlertItem[];
    };
};