export type DeviceStatus = "active" | "inactive";

export type DeviceItem = {
    id: string;
    deviceCode: string;
    deviceName: string;
    deviceType: string;
    connectionType: string;
    ipAddress: string | null;
    status: DeviceStatus;
    isOnline: boolean;
    note: string;
};

export type DeviceSummary = {
    totalDevices: number;
    online: number;
    offline: number;
};

export type DeviceMasterItem = {
    code: string;
    label: string;
};

export type DevicesConfigResponse = {
    summary: DeviceSummary;
    devices: DeviceItem[];
    masterData: {
        deviceTypes: DeviceMasterItem[];
        connectionTypes: DeviceMasterItem[];
    };
};

export type DevicePayload = {
    deviceCode: string;
    deviceName: string;
    deviceType: string;
    connectionType: string;
    ipAddress: string | null;
    status: DeviceStatus;
    note: string;
};