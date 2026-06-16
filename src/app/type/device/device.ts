import type { ConfigMeta, ISODateString } from "@/src/app/type/common";

export type DeviceType = "kiosk" | "barrier_gate" | "camera" | "printer" | "lpr" | string;
export type DeviceStatus =
  | "pending_activation"
  | "active"
  | "offline"
  | "maintenance"
  | string;

export type DeviceItem = {
  id?: string;
  deviceId: string | null;
  deviceCode?: string;
  deviceName: string;
  deviceType: DeviceType;
  connectionType: string;
  location: string | null;
  ipAddress: string | null;
  status: DeviceStatus;
  isOnline: boolean;
  note: string;
  activationCode?: string | null;
  activationExpiresAt?: ISODateString | null;
  activatedAt?: ISODateString;
  lastSeen?: ISODateString;
};

export type DevicesConfigResponse = ConfigMeta & {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  devices: DeviceItem[];
};

export type DeviceActivationCodeCreateRequest = {
  deviceName?: string;
  name?: string;
  deviceType: "kiosk" | "barrier_gate";
  deviceCode?: string;
  location?: string;
  connectionType?: string;
  note?: string;
};

export type DeviceActivationCodeCreateResponse = {
  CodeActivate: string;
  deviceName: string;
  deviceType: "kiosk" | "barrier_gate";
  status: "active";
  isOnline: boolean;
};

export type DevicePayload = {
  deviceCode: string;
  deviceName: string;
  deviceType: DeviceType;
  connectionType: string;
  ipAddress: string | null;
  status: DeviceStatus;
  isOnline: boolean;
  note: string;
  location?: string | null;
  deviceId?: string | null;
  activationCode?: string | null;
  activationExpiresAt?: ISODateString | null;
  expiresAt?: ISODateString | null;
};

export type DeviceMasterItem = { code: string; label: string };
