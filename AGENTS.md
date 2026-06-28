# AGENTS.md

เอกสารนี้จัดทำเพื่อใช้เป็น Prompt / Specification ให้ AI หรือทีม Frontend วิเคราะห์และปรับปรุง **Frontend Admin Project** ให้เชื่อมต่อกับ **Backend API ล่าสุดของ Smart Carpark** ได้ถูกต้องตาม Response และการทำงานจริงของ Backend

---

## 1. Backend Summary

Backend Project นี้เป็นระบบ **Smart Carpark API** ใช้สำหรับจัดการระบบลานจอดรถ เช่น รายการรถเข้าออก, การชำระเงิน, อุปกรณ์ Kiosk / Barrier Gate, Theme, Pricing, Payment Settings และ System Settings

### Main Tech Stack

- NodeJS
- ExpressJS
- Prisma ORM
- PostgreSQL
- Docker / Docker Compose
- Swagger / OpenAPI
- REST API
- Server-Sent Events หรือ SSE สำหรับ realtime update

### Backend API Docs

Backend มี Swagger/OpenAPI ที่:

```txt
/docs/openapi.json
```

---

## 2. Admin Frontend Goal

ให้ปรับ Project Frontend Admin ที่มีอยู่แล้วให้ใช้ API จริงจาก Backend ล่าสุด โดยเน้นเรื่องต่อไปนี้:

1. เชื่อมต่อ API จริงแทน mock/static data
2. กำหนด TypeScript Types ให้ตรงกับ Backend response จริง
3. แยก API service/client เป็นหมวดหมู่
4. ปรับ UI field mapping ให้ตรงกับ Backend
5. จัดการ Auth Token, Refresh Token, Logout, Unauthorized และ Forbidden
6. หลัง mutation ที่ Backend คืนแค่ `{ success, message }` ต้อง refetch ข้อมูลใหม่
7. ห้ามเดา field เอง ถ้า Backend ไม่คืน field นั้น ให้ทำเป็น optional หรือไม่ใช้
8. โค้ดต้อง maintainable, stable, reusable และพร้อมใช้งานจริง

---

## 3. Base URL

Frontend ควรใช้ Base URL จาก environment variable:

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

ตัวอย่าง `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

---

## 4. Authentication

Admin API ส่วนใหญ่ต้องใช้ Bearer Token:

```http
Authorization: Bearer <accessToken>
```

### Public API ที่ไม่ต้องใช้ Bearer Token

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/devices/config`
- `/api/v1/client/*` เป็นฝั่ง client/kiosk ไม่ใช่ Admin หลัก

---

## 5. Permission

Backend ใช้ `user.permissions` เป็นตัวกำหนดสิทธิ์จริงของ Admin

```ts
export type Permission =
  | "dashboard"
  | "transactions"
  | "overview"
  | "pricing"
  | "devices"
  | "theme"
  | "settings";
```

Frontend ต้องใช้ permission นี้ในการ:

- แสดง/ซ่อนเมนู Sidebar
- ป้องกัน route
- ป้องกันปุ่ม action เช่น create, update, delete
- แสดงหน้า Forbidden เมื่อไม่มีสิทธิ์

---

# AI Prompt สำหรับ Frontend Admin

นำ Prompt ด้านล่างนี้ไปให้ AI ใช้วิเคราะห์และปรับ Project Frontend Admin ได้เลย

---

## Prompt

คุณคือ **Senior Frontend Architect** และ **Senior React/Next.js TypeScript Developer**

ช่วยวิเคราะห์และปรับปรุง Project Frontend Admin ที่มีอยู่แล้ว ให้เชื่อมต่อกับ Backend API ล่าสุดของระบบ Smart Carpark ให้ถูกต้องตาม Contract ด้านล่างนี้

---

## เป้าหมายหลัก

1. ปรับ Frontend Admin ให้ใช้ API จริงจาก Backend แทน mock/static data
2. กำหนด TypeScript Types ให้ชัดเจนตาม Response ที่ Backend คืนจริง
3. แยก API service/client เป็นหมวดหมู่ เช่น auth, dashboard, overview, transactions, members, pricing, payment settings, devices, theme, system settings
4. ปรับหน้า UI เดิมให้ map field จาก Backend ถูกต้อง
5. จัดการ access token / refresh token / logout / unauthorized / forbidden ให้ครบ
6. หลัง mutation ที่ Backend คืนแค่ success/message ให้ refetch ข้อมูลใหม่
7. ห้ามเดา field เอง ถ้า field ไม่มีใน Backend response ห้ามใช้ หรือให้ map เป็น optional/null
8. ให้เขียนโค้ดแบบ maintainable, stable, reusable และพร้อม production

---

# Shared Types

```ts
export type ISODateString = string;

export type Permission =
  | "dashboard"
  | "transactions"
  | "overview"
  | "pricing"
  | "devices"
  | "theme"
  | "settings";

export type ApiErrorResponse = {
  message: string;
  code?: string;
  requiredPermission?: Permission;
  yourPermissions?: Permission[];
  latest?: unknown;
};

export type SuccessMessageResponse = {
  success: boolean;
  message: string;
};

export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  from?: number;
  to?: number;
  all?: boolean;
  totalFound?: number;
  realtime?: boolean;
};

export type ConfigMeta = {
  configUpdatedAt: ISODateString | null;
};
```

---

# 1. Auth API

## Endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

```ts
export type UserRole = "super_admin" | "staff" | "system" | string;
export type UserStatus = "active" | "inactive" | string;

export type User = {
  id: string;
  username: string;
  name: string;
  email: string | null;
  phone?: string | null;
  role: UserRole;
  permissions: Permission[];
  status: UserStatus;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type MeResponse = {
  user: User;
};

export type LogoutResponse = {
  message: string;
};
```

## Frontend Behavior

- เก็บ `token`, `refreshToken`, `user`
- แนบ Bearer token ทุก Admin request
- ถ้าเจอ `401` ให้ลอง refresh token 1 ครั้ง
- ถ้า refresh ไม่สำเร็จ ให้ logout และ redirect ไปหน้า login
- ถ้าเจอ `403` ให้แสดงข้อความว่าไม่มีสิทธิ์ และดู `requiredPermission`

---

# 2. Dashboard API

## Endpoints

- `GET /api/v1/dashboard`
- `GET /api/v1/dashboard/events`

```ts
export type DashboardSummaryCards = {
  totalTickets: number;
  paidCount: number;
  paidRevenue: number;
  pendingCount: number;
  avgWaitTime: string;
};

export type DashboardRevenueGroup = {
  id: string;
  label: string;
  amount: number;
  personalAmount?: number;
  percent: number;
};

export type DashboardChannelBreakdown = {
  id?: string;
  code?: string;
  label: string;
  subLabel?: string;
  icon?: string;
  amount: number;
  count: number;
  percent: number;
};

export type DashboardSummaryResponse = {
  summaryCards: DashboardSummaryCards;
  revenueGroups: DashboardRevenueGroup[];
  channelBreakdown: DashboardChannelBreakdown[];
  isRealtime: boolean;
};

export type DashboardSseEvent =
  | {
      type: "connected";
      message: string;
    }
  | {
      type: "dashboard_snapshot" | "dashboard_summary" | "dashboard_updated";
      trigger?: unknown;
      data: DashboardSummaryResponse;
      generatedAt: ISODateString;
    }
  | {
      type: "dashboard_error";
      message: string;
      generatedAt: ISODateString;
    }
  | {
      type: "ping";
      at: ISODateString;
    };
```

## Frontend Behavior

- หน้า Dashboard โหลด `GET /api/v1/dashboard`
- เปิด SSE `/api/v1/dashboard/events` เพื่อ realtime update
- ถ้า SSE หลุด ให้ fallback ด้วย polling หรือ reconnect

---

# 3. Overview API

## Endpoint

- `GET /api/v1/overview/summary?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

```ts
export type OverviewSummaryCards = {
  totalTickets: number;
  paidCount: number;
  paidRevenue: number;
  pendingCount: number;
  avgWait: string;
};

export type OverviewRevenueGroup = {
  id: string;
  label: string;
  amount: number;
  percent: number;
};

export type OverviewUsageChartItem = {
  label: string;
  value: number;
};

export type OverviewServiceSummaryItem = {
  id: string;
  label: string;
  amount: number;
  count: number;
  percent: number;
  icon: string;
};

export type OverviewSummaryResponse = {
  filters: {
    startDate: ISODateString;
    endDate: ISODateString;
  };
  chartFilters: {
    startDate: ISODateString;
    endDate: ISODateString;
  };
  summaryCards: OverviewSummaryCards;
  revenueGroups: OverviewRevenueGroup[];
  usageChartMode: "daily" | "weekly" | "monthly" | "yearly";
  usageChartLabel: string;
  usageChart: OverviewUsageChartItem[];
  serviceSummary: OverviewServiceSummaryItem[];
  totalSummaryCalculated: number;
};
```

## Frontend Behavior

- ใช้ Date Range Picker แล้วส่ง `start_date`, `end_date`
- รองรับ date-only string `YYYY-MM-DD`
- ถ้าไม่ส่ง Backend จะใช้ช่วงต้นเดือนถึงปัจจุบัน

---

# 4. Transactions API

## Endpoints

- `GET /api/v1/transactions`
- `POST /api/v1/transactions`
- `GET /api/v1/transactions/:id`
- `PATCH /api/v1/transactions/:id`
- `PATCH /api/v1/transactions/:id/status`
- `DELETE /api/v1/transactions/:id`
- `POST /api/v1/transactions/:id/payment`

```ts
export type VehicleType = "car" | "motorcycle";
export type TransactionStatus =
  | "pending"
  | "partially_paid"
  | "paid_waiting_exit"
  | "completed"
  | "cancelled"
  | string;

export type PaymentMethod = "cash" | "qr" | "bank1" | "wallet" | "other" | string;
export type PaymentChannel = "cashier" | "mobile" | "kiosk" | "gate" | string;

export type TransactionPayment = {
  id: string;
  method: PaymentMethod;
  channel: PaymentChannel;
  paidAmount: number | null;
  amount?: number;
  paidAt: ISODateString;
  expiryAt?: ISODateString;
  processedBy?: string;
  deviceId?: string;
  deviceType?: string;
  deviceName?: string;
  deviceLocation?: string;
  kioskDeviceId?: string;
  kioskName?: string;
  kioskLocation?: string;
};

export type TransactionDetail = {
  id: string;
  billNo: string;
  plateNo: string;
  vehicleType: VehicleType | string;
  entryAt: ISODateString | null;
  exitAt: ISODateString | null;
  calculatedAt: ISODateString | null;
  exitTimeLimit: ISODateString | null;
  isOverstay: boolean;
  status: TransactionStatus;
  baseAmount: number;
  netAmount: number;
  totalPaid: number;
  remainingAmount: number;
  serviceDisplay: string;
  durationHour: number;
  totalMinutes: number;
  payments: TransactionPayment[];
  qrData: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type TransactionListItem = {
  id: string;
  billNo: string;
  plateNo: string;
  vehicleType: VehicleType | string;
  status: TransactionStatus;
  entryAt: ISODateString | null;
  exitAt: ISODateString | null;
  exitTimeLimit: ISODateString | null;
  isOverstay: boolean;
  amount: {
    net: number;
    paid: number;
    remaining: number;
  };
  duration: {
    display: string;
    hours: number;
    totalMinutes: number;
  };
  latestPayment: {
    paymentId: string;
    method: PaymentMethod;
    channel: PaymentChannel;
    paidAmount: number;
    paidAt: ISODateString;
  } | null;
  updatedAt: ISODateString;
};

export type TransactionListResponse = {
  data: TransactionListItem[];
  meta: PaginationMeta;
};

export type CameraDirection = "IN" | "OUT";

export type CameraTransactionRequest = {
  plateNo: string;
  vehicleType?: VehicleType;
  cameraId: string;
  gateId: string;
  direction: CameraDirection;
  capturedAt?: ISODateString;
  confidence?: number;
  imageUrl?: string;
};

export type CameraTransactionResponse = {
  success: boolean;
  action:
    | "OPEN_GATE"
    | "VALIDATION_ERROR"
    | "IGNORE_DUPLICATE"
    | "IGNORE_ACTIVE_TRANSACTION"
    | string;
  message: string;
  data?: {
    transactionId: string;
    plateNo: string;
    direction: CameraDirection;
    status: TransactionStatus;
  };
  errors?: {
    field: string;
    message: string;
  }[];
};

export type TransactionUpdateRequest = Partial<{
  plateNo: string;
  vehicleType: VehicleType;
  serviceType: string;
  status: TransactionStatus;
  totalPaid: number;
  payments: TransactionPayment[];
  exitTimeLimit: ISODateString | null;
  exitAt: ISODateString | null;
}>;

export type PaymentRequest = {
  plateNo?: string;
  method: PaymentMethod;
  channel: PaymentChannel;
  amount?: number;
  deviceId?: string;
  deviceType?: string;
  deviceName?: string;
  deviceLocation?: string;
};

export type AdminPaymentResponse = {
  message: string;
  data: {
    transaction: {
      transactionId: string;
      billNo: string;
      plateNo: string;
      vehicleType: VehicleType | string;
      status: TransactionStatus;
    };
    payment: {
      paymentId: string;
      method: PaymentMethod;
      channel: PaymentChannel;
      paidAmount: number;
      paidAt: ISODateString;
      processedBy: string;
    } | null;
    amount: {
      netAmount: number;
      paidAmount: number;
      remainingAmount: number;
    };
    parking: {
      entryAt: ISODateString | null;
      exitTimeLimit: ISODateString | null;
      isOverstay: boolean;
      durationDisplay: string;
      totalMinutes: number;
    };
  };
};

export type TransactionStatusUpdateResponse = {
  success: boolean;
  message: string;
  status: TransactionStatus;
};
```

## Frontend Behavior

- หน้า list ใช้ `GET /api/v1/transactions?page=1&per_page=10&keyword=...`
- รองรับ query:
  - `keyword`
  - `plate_no`
  - `bill_no`
  - `page`
  - `per_page`
  - `all=true`
- หน้า detail ใช้ `GET /api/v1/transactions/:id`
- ปุ่มชำระเงิน admin ใช้ `POST /api/v1/transactions/:id/payment`
- หลังชำระเงินสำเร็จให้ refetch detail และ list
- `id` ใน path สามารถเป็น transaction id หรือ plateNo ได้ตาม Backend

## Transaction Status Meaning

Frontend ต้องแสดงผลสถานะตามความหมายล่าสุดจาก Backend ดังนี้:

| Status | ความหมาย |
| --- | --- |
| `pending` | ยังไม่จ่าย |
| `partially_paid` | จ่ายบางส่วน หรือจ่ายแล้วแต่ยอดยังไม่ครบ/มีค่าเพิ่มหลังเกินเวลาออก |
| `paid_waiting_exit` | จ่ายครบแล้ว รอรถออกภายในเวลาที่กำหนด |
| `completed` | รถออกแล้ว transaction จบจริง |
| `cancelled` | ยกเลิก |

---

# 5. Members API

## Endpoints

- `GET /api/v1/members/stats`
- `GET /api/v1/members`
- `POST /api/v1/members`
- `PATCH /api/v1/members/:id`
- `PATCH /api/v1/members/:id/permissions`
- `DELETE /api/v1/members/:id`

```ts
export type Member = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type MemberStatsResponse = {
  totalMembers: number;
  activeMembers: number;
  totalAdmins: number;
};

export type MemberCreateRequest = {
  username?: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: Permission[];
};

export type MemberUpdateRequest = Partial<Omit<MemberCreateRequest, "password">> & {
  password?: string;
};

export type MemberPermissionsUpdateRequest = {
  permissions: Permission[];
};

export type MemberPermissionsUpdateResponse = {
  message: string;
  member: Member;
};

export type MemberDeleteResponse = {
  message: string;
};
```

## Frontend Behavior

- เมนู Members ต้องใช้ permission `"settings"`
- `GET /api/v1/members` คืน array ตรง ๆ ไม่ได้ห่อ `data`
- query ที่รองรับ: `keyword`, `status`, `role`
- หลัง create/update/delete ให้ refetch list และ stats

---

# 6. Service Pricing API

## Endpoints

- `GET /api/v1/service-pricing/config`
- `PUT /api/v1/service-pricing/config`
- `POST /api/v1/service-pricing/config`
- `PATCH /api/v1/service-pricing/config/:id`
- `DELETE /api/v1/service-pricing/config/:id`

```ts
export type PricingStatus = "active" | "inactive" | string;

export type FeeType =
  | "base_hour"
  | "next_hour"
  | "overnight_day"
  | "overnight_week"
  | "overnight_month"
  | "overnight_year";

export type PricingRule = {
  id: string;
  name: string;
  feeType: FeeType;
  vehicleType: VehicleType;
  price: number;
  baseHours: number;
  hourStart: number;
  hourEnd: number | null;
  periodUnit: "day" | "week" | "month" | "year" | null | string;
  periodStart: number;
  periodEnd: number | null;
  status: PricingStatus;
};

export type PricingConfigResponse = ConfigMeta & {
  pricingRules: PricingRule[];
};

export type PricingRulePayload = Partial<Omit<PricingRule, "id">> & {
  price: number;
};

export type PricingConfigPutRequest = {
  pricingRules?: PricingRule[];
  paymentChannels?: unknown[];
  serviceChannelMapping?: unknown[];
  masterData?: unknown;
};
```

## Frontend Behavior

- เมนู pricing ต้องใช้ permission `"pricing"`
- `POST` ต้องมี `price`
- mutation คืนแค่ `{ success, message }`
- หลัง create/update/delete/put ต้อง refetch `GET /api/v1/service-pricing/config`

---

# 7. Payment Settings API

## Endpoints

- `GET /api/v1/payment-settings/methods`
- `PATCH /api/v1/payment-settings/methods/:id`
- `GET /api/v1/payment-settings/channels`
- `PATCH /api/v1/payment-settings/channels/:id`

```ts
export type PaymentMethodSetting = {
  id: string;
  label: string;
  icon?: string;
  isActive: boolean;
  [key: string]: unknown;
};

export type PaymentMethodListResponse = ConfigMeta & {
  data: PaymentMethodSetting[];
};

export type PaymentMethodUpdateRequest = Partial<PaymentMethodSetting>;

export type PaymentChannelSetting = {
  id: string;
  name: string;
  icon?: string;
  allowedMethods: string[];
  [key: string]: unknown;
};

export type PaymentChannelListResponse = ConfigMeta & {
  data: PaymentChannelSetting[];
};

export type ChannelMappingUpdateRequest = {
  allowedMethods: string[];
};
```

## Frontend Behavior

- อยู่ใน permission `"pricing"`
- update method คืน `{ success: true, message: "Payment method updated" }`
- update channel คืน `{ success: true, message: "Channel mapping updated" }`
- หลัง update ต้อง refetch methods/channels
- เวลา confirm payment ต้องเลือก method/channel ที่เปิดใช้งานและ allowed ตาม setting

---

# 8. Devices API

## Admin Endpoints

- `GET /api/v1/devices`
- `POST /api/v1/devices`
- `POST /api/v1/devices/cameras/provision`
- `POST /api/v1/devices/printers/provision`
- `PUT /api/v1/devices/:deviceId`
- `DELETE /api/v1/devices/:deviceId`
- `GET /api/v1/devices/events`

## Public Endpoint

- `GET /api/v1/devices/config`

```ts
export type DeviceType =
  | "kiosk"
  | "barrier_gate"
  | "camera"
  | "printer"
  | "lpr"
  | string;

export type DeviceStatus =
  | "pending_activation"
  | "active"
  | "offline"
  | "maintenance"
  | string;

export type DeviceDirection = "IN" | "OUT" | string;

export type Device = {
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
  gateId?: string | null;
  direction?: DeviceDirection | null;
  cameraRole?: string | null;
  cameraIds?: string[];
  printerRole?: string | null;
  printerIds?: string[];
};

export type DeviceListResponse = ConfigMeta & {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  devices: Device[];
};

export type DeviceActivationCodeCreateRequest = {
  deviceName?: string;
  name?: string;
  deviceType: "kiosk" | "barrier_gate";
  deviceCode?: string;
  location?: string;
  connectionType?: string;
  note?: string;
  gateId?: string;
  direction?: DeviceDirection;
  cameraIds?: string[];
  printerIds?: string[];
};

export type DeviceActivationCodeCreateResponse = {
  CodeActivate: string;
  deviceName: string;
  deviceType: "kiosk" | "barrier_gate";
  status: "active";
  isOnline: boolean;
};

export type CameraProvisionRequest = {
  deviceName: string;
  deviceCode: string;
  location: string;
  gateId: string;
  direction: DeviceDirection;
  cameraRole: "lpr" | string;
  connectionType: string;
  ipAddress: string;
  note?: string;
};

export type CameraProvisionResponse = {
  success: boolean;
  message: string;
  device: Device;
  deviceToken: string;
};

export type PrinterProvisionRequest = {
  deviceName: string;
  deviceCode: string;
  location: string;
  connectionType: string;
  ipAddress: string;
  printerRole: "receipt" | string;
  note?: string;
};

export type PrinterProvisionResponse = {
  success: boolean;
  message: string;
  device: Device;
  deviceToken: string;
};

export type DeviceUpdateRequest = Partial<{
  deviceCode: string;
  deviceName: string;
  name: string;
  deviceType: DeviceType;
  connectionType: string;
  ipAddress: string | null;
  ip: string | null;
  location: string | null;
  status: DeviceStatus;
  isOnline: boolean;
  note: string;
  gateId: string | null;
  direction: DeviceDirection | null;
  cameraRole: string | null;
  cameraIds: string[];
  printerRole: string | null;
  printerIds: string[];
}>;

export type DeviceMutationResponse = {
  message: string;
  device: {
    deviceId: string;
    deviceName: string;
    deviceType: DeviceType;
    connectionType: string;
    location: string | null;
    ipAddress: string | null;
    status: DeviceStatus;
    isOnline: boolean;
    note: string;
  };
};

export type DeviceDeleteResponse = {
  success: boolean;
  message: string;
};

export type PublicDeviceConfigResponse = {
  theme: {
    systemName: string | null;
    themeColor: string | null;
    logoUrl: string | null;
    themeMode: string;
    customThemeColor: string | null;
    updatedAt: ISODateString | null;
  };
};

export type DeviceSseEvent =
  | {
      type: "connected";
      message: string;
    }
  | {
      type: "devices_config_updated";
      config: unknown;
    }
  | {
      type:
        | "device_event"
        | "device_activated"
        | "device_status_changed"
        | "device_deleted"
        | string;
      deviceId?: string | null;
      id?: string;
      deviceCode?: string;
      deviceType?: DeviceType;
      deviceName?: string;
      previousStatus?: DeviceStatus;
      status?: DeviceStatus;
      isOnline?: boolean;
      lastSeen?: ISODateString;
    }
  | {
      type: "ping";
      at: ISODateString;
    };
```

## Frontend Behavior

- เมนู devices ต้องใช้ permission `"devices"`
- หน้า list ใช้ `GET /api/v1/devices`
- query ที่รองรับ:
  - `deviceType`
  - `status`
  - `keyword`
- หน้าเพิ่มอุปกรณ์จริงคือสร้าง activation code ผ่าน `POST /api/v1/devices`
- Response ใช้ `CodeActivate` สำหรับแสดงรหัสให้ Kiosk/Barrier Gate นำไป activate
- `POST /api/v1/devices` รองรับ activation code เฉพาะ `deviceType` เป็น `kiosk` หรือ `barrier_gate` เท่านั้น ห้ามส่ง `deviceType: "camera"` เข้า endpoint นี้
- Provision กล้อง LPR ใช้ `POST /api/v1/devices/cameras/provision` โดยส่ง `deviceName`, `deviceCode`, `location`, `gateId`, `direction`, `cameraRole`, `connectionType`, `ipAddress`, และ `note`
- Provision Printer ใช้ `POST /api/v1/devices/printers/provision` โดยส่ง `deviceName`, `deviceCode`, `location`, `connectionType`, `ipAddress`, `printerRole`, และ `note`
- Response ของ camera/printer provision มี `deviceToken` ซึ่ง backend แสดงครั้งเดียว Frontend ต้องแสดงให้ copy ทันทีและไม่คาดหวังว่าจะดึงซ้ำได้
- Barrier Gate setup ต้องส่ง `gateId`, `direction`, `cameraIds`, และ `printerIds` โดยเลือกจาก camera/printer devices ที่ provision แล้ว
- Kiosk setup ต้องส่ง `printerIds` โดยเลือกจาก printer devices ที่ provision แล้ว และไม่ต้องเลือก `cameraIds`
- หน้า Barrier Gate form ควร filter กล้องตาม `direction` ของ gate หรือแจ้งเตือนเมื่อ direction ไม่ตรง
- หลัง create/update/delete ให้ refetch list
- เปิด SSE `/api/v1/devices/events` เพื่อ update status realtime

---

# 9. Theme API

## Endpoints

- `GET /api/v1/theme`
- `PUT /api/v1/theme`
- `POST /api/v1/theme/upload-logo`
- `DELETE /api/v1/theme/logo`

```ts
export type Theme = ConfigMeta & {
  themeColor: string | null;
  logoUrl: string | null;
  themeMode: string;
  customThemeColor: string | null;
  updatedAt?: ISODateString;
};

export type ThemeUpdateRequest = Partial<{
  themeColor: string | null;
  logoUrl: string | null;
  themeMode: string;
  customThemeColor: string | null;
}>;

export type ThemeUpdateResponse = {
  message: string;
  theme: Theme;
};

export type LogoUploadResponse = {
  message: string;
  logoUrl: string;
  theme: Theme;
};

export type LogoDeleteResponse = {
  message: string;
  theme: Theme;
};
```

## Frontend Behavior

- เมนู theme ต้องใช้ permission `"theme"`
- `GET /api/v1/theme` ใช้แสดงสีและ logo ล่าสุด
- เวลาแก้สีให้ส่งเฉพาะ field สี เช่น `themeColor`, `themeMode`, `customThemeColor`
- ถ้า `themeMode === "theme"` ให้ใช้ `themeColor` เป็นสีที่แสดงผลจริง
- ถ้า `themeMode === "custom"` ให้ใช้ `customThemeColor` เป็นสีที่แสดงผลจริง
- ถ้าค่าสีที่เลือกว่าง, `null` หรือไม่ใช่ HEX color ที่ถูกต้อง ให้ fallback เป็น `#FFD54F`

```ts
const DEFAULT_THEME_COLOR = "#FFD54F";

const isHexColor = (value?: string | null) =>
  typeof value === "string" && /^#[0-9A-F]{6}$/i.test(value);

function resolveThemeColor(theme: Theme) {
  const sourceColor =
    theme.themeMode === "custom"
      ? theme.customThemeColor
      : theme.themeMode === "theme"
        ? theme.themeColor
        : null;

  return isHexColor(sourceColor) ? sourceColor : DEFAULT_THEME_COLOR;
}
```

- Upload logo ใช้ FormData:

```ts
const formData = new FormData();
formData.append("logo", file);
```

- ลบ logo ใช้ `DELETE /api/v1/theme/logo`
- หลัง upload/delete/update ให้ใช้ `response.theme` หรือ refetch

### Logo URL Mapping

ถ้า Backend คืน `logoUrl` เป็น path เช่น:

```txt
/uploads/logo.png
```

Frontend ให้ render เป็น:

```ts
const logoSrc = logoUrl?.startsWith("/uploads")
  ? `${API_BASE_URL}${logoUrl}`
  : logoUrl;
```

ถ้าไม่มี logo ให้แสดง:

```txt
ยังไม่มีโลโก้
```

---

# 10. System Settings API

## Endpoints

- `GET /api/v1/system-settings`
- `PUT /api/v1/system-settings`
- `GET /api/v1/system-settings/receipt`
- `PUT /api/v1/system-settings/receipt`
- `PUT /api/v1/system-settings/receipt/printer`

```ts
export type SystemSettings = ConfigMeta & {
  general: {
    systemName: string | null;
    location: string | null;
    language: string | null;
    timezone: string | null;
    frontendUrl: string | null;
  };
  receipt: ReceiptSettings;
  billing: {
    taxEnabled?: boolean;
    currency?: string;
    roundingMode?: string;
    [key: string]: unknown;
  };
  updatedAt?: ISODateString;
};

export type ReceiptSettings = ConfigMeta & {
  entryBill?: {
    showDate?: boolean;
    showEntryTime?: boolean;
    showQrCode?: boolean;
    showBillNo?: boolean;
  };
  paymentBill?: {
    showDate?: boolean;
    showEntryTime?: boolean;
    showQrCode?: boolean;
    showBillNo?: boolean;
    showExpiryTime?: boolean;
    expiryDuration?: number;
  };
  printer?: PrinterSettings;
  paperWidth?: string;
  footerText?: string;
  [key: string]: unknown;
};

export type PrinterSettings = ConfigMeta & {
  fontSize?: number;
  billNumberFontSize?: number;
  paperWidth?: number;
};

export type PrinterUpdateRequest = {
  fontSize?: number;
  billNumberFontSize?: number;
  paperWidth?: number;
};

export type PrinterUpdateResponse = {
  message: string;
  printer: PrinterSettings;
};
```

## Frontend Behavior

- เมนู system settings ต้องใช้ permission `"settings"`
- `PUT /api/v1/system-settings` คืนแค่ `{ success, message }` ต้อง refetch
- `PUT /api/v1/system-settings/receipt` คืนแค่ `{ success, message }` ต้อง refetch
- `PUT /api/v1/system-settings/receipt/printer` คืน printer object กลับมา

---

# 11. API Client Requirements

ให้สร้าง API layer กลาง เช่น:

```txt
src/lib/api/apiClient.ts
src/lib/api/auth.api.ts
src/lib/api/dashboard.api.ts
src/lib/api/overview.api.ts
src/lib/api/transactions.api.ts
src/lib/api/members.api.ts
src/lib/api/pricing.api.ts
src/lib/api/paymentSettings.api.ts
src/lib/api/devices.api.ts
src/lib/api/theme.api.ts
src/lib/api/systemSettings.api.ts
```

## apiClient ต้องทำ

- set baseURL จาก env
- แนบ Authorization header อัตโนมัติ
- parse JSON error
- handle 401 ด้วย refresh token
- handle 403 โดยโยน ForbiddenError พร้อม requiredPermission
- รองรับ upload multipart/form-data
- รองรับ SSE ผ่าน EventSource หรือ fetch/event-stream polyfill หากต้องใส่ Authorization header

## หมายเหตุเรื่อง SSE

Native `EventSource` ใส่ Authorization header ไม่ได้โดยตรง

ถ้า Backend ต้องใช้ Bearer token ให้ใช้:

- `@microsoft/fetch-event-source`
- หรือ fetch stream
- หรือปรับ Backend ให้รับ token ผ่าน cookie แทน

---

# 12. UI Mapping Requirements

## Dashboard

ใช้ field:

- `summaryCards.totalTickets`
- `summaryCards.paidCount`
- `summaryCards.paidRevenue`
- `summaryCards.pendingCount`
- `channelBreakdown`

## Transactions

List table ใช้ `TransactionListItem`

Detail modal/page ใช้ `TransactionDetail`

ยอดเงิน:

```ts
// list
amount.net
amount.paid
amount.remaining

// detail
netAmount
totalPaid
remainingAmount
```

ปุ่มชำระเงินส่ง:

```ts
{
  method,
  channel,
  amount
}
```

หลังชำระเงินให้ refetch

## Devices

ใช้ field:

- `devices`
- `total`
- `online`
- `offline`
- `maintenance`

Create device ให้แสดง:

```ts
response.CodeActivate
```

Status badge ใช้:

```ts
status
isOnline
```

## Theme

- ถ้า `themeMode === "theme"` ต้องใช้ `themeColor` เป็นสีที่แสดงผลจริง
- ถ้า `themeMode === "custom"` ต้องใช้ `customThemeColor` เป็นสีที่แสดงผลจริง
- ถ้าค่าสีที่เลือกว่าง, เป็น `null` หรือไม่ใช่ HEX color ให้ใช้ `#FFD54F`
- Logo URL จาก Backend อาจเป็น `/uploads/logo.png`
- ถ้า path ขึ้นต้นด้วย `/uploads` ให้ต่อกับ `API_BASE_URL`
- ถ้าไม่มี logo ให้แสดง “ยังไม่มีโลโก้”
- ปุ่มลบ logo เรียก `DELETE /api/v1/theme/logo`

## Pricing

- ใช้ `pricingRules`
- สร้าง/แก้ไข rule ตาม `PricingRule`
- หลัง mutation ต้อง refetch

## Members

- ใช้ `permissions` เพื่อจัดสิทธิ์
- role ไม่ใช่ตัวกันสิทธิ์หลัก
- สิทธิ์จริงอิง `permissions`

---

# 13. Recommended Frontend Update Order

ให้ปรับตามลำดับนี้:

```txt
auth + apiClient
↓
Transactions
↓
Dashboard
↓
Overview
↓
Devices
↓
Pricing / Payment Settings
↓
Theme
↓
System Settings
↓
Members
```

เหตุผล:

- `auth + apiClient` เป็นฐานของทุกหน้า
- `Transactions` เป็นแกนข้อมูลหลักของระบบ
- `Dashboard` และ `Overview` พึ่งพาข้อมูล transaction/payment
- `Devices` มี SSE และ config ที่เกี่ยวกับ kiosk/barrier
- `Pricing` และ `Payment Settings` มีผลต่อการคิดค่าจอดและชำระเงิน
- `Theme` และ `System Settings` เป็น config แยก
- `Members` เป็นส่วนจัดการสิทธิ์และผู้ใช้งาน

---

# 14. Deliverables ที่ต้องการจาก AI

ช่วยปรับ Project Frontend Admin ให้ได้ผลลัพธ์ดังนี้:

1. สร้าง/ปรับ TypeScript types ทั้งหมดตาม Contract ด้านบน
2. สร้าง API service แยกไฟล์ตามหมวด
3. ปรับ auth flow ให้ login, refresh, logout, me ใช้งานได้จริง
4. ปรับ protected route และ sidebar menu ตาม `user.permissions`
5. ปรับหน้า Dashboard, Overview, Transactions, Members, Pricing, Payment Settings, Devices, Theme, System Settings ให้ใช้ API จริง
6. แก้ field mapping ให้ตรงกับ Backend response
7. จัด loading/error/empty state ทุกหน้า
8. หลัง create/update/delete ให้ refetch หรือ invalidate query
9. ห้ามใช้ mock data ถ้า API พร้อมใช้งาน
10. เขียนโค้ดแบบ copy ไปใช้จริงได้ พร้อมอธิบายไฟล์ที่ต้องแก้และเหตุผล

---

# 15. ก่อนแก้โค้ด ให้ AI ทำตามขั้นตอนนี้

1. ตรวจโครงสร้าง project เดิม
2. ระบุไฟล์ที่เกี่ยวข้อง
3. เสนอแผนแก้ไขสั้น ๆ
4. แก้เป็นส่วน ๆ
5. ให้โค้ด TypeScript ที่ copy วางได้
6. อธิบายว่าทำไมต้องแก้จุดนั้น
7. ทดสอบ flow หลัก:
   - Login
   - Refresh token
   - Fetch current user
   - Transaction list/detail/payment
   - Dashboard summary
   - Devices list/create/update/delete
   - Theme update/upload/delete logo
   - Pricing update
   - System settings update

---

# 16. Important Notes

## สิ่งที่ต้องระวัง

1. `GET /api/v1/transactions` คืน shape แบบ list item
2. `GET /api/v1/transactions/:id` คืน shape แบบ detail
3. mutation หลายเส้นคืนแค่ `{ success, message }` ต้อง refetch
4. `POST /api/v1/devices` คืน `CodeActivate` ตัว C และ A ใหญ่
5. Upload logo ใช้ field ชื่อ `logo`
6. Theme สีและ logo แยกกัน
7. Native EventSource แนบ Authorization header ไม่ได้
8. permission ให้ยึด `user.permissions` ไม่ใช่ role อย่างเดียว
9. Logo URL ต้อง map ให้ถูก ถ้าเป็น `/uploads`
10. ห้ามส่ง passwordHash หรือ sensitive data กลับไปแสดงใน Frontend

---

# 17. Suggested Folder Structure

```txt
src/
  lib/
    api/
      apiClient.ts
      auth.api.ts
      dashboard.api.ts
      overview.api.ts
      transactions.api.ts
      members.api.ts
      pricing.api.ts
      paymentSettings.api.ts
      devices.api.ts
      theme.api.ts
      systemSettings.api.ts
    types/
      common.ts
      auth.ts
      dashboard.ts
      overview.ts
      transactions.ts
      members.ts
      pricing.ts
      paymentSettings.ts
      devices.ts
      theme.ts
      systemSettings.ts
    auth/
      authStore.ts
      permissions.ts
      protectedRoute.tsx
```

---

# 18. Example API Client Concept

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: unknown = null;

    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    throw new ApiError(
      "API request failed",
      response.status,
      errorData
    );
  }

  return response.json() as Promise<T>;
}
```

ให้ AI ปรับต่อให้รองรับ refresh token, 401 retry, 403 forbidden และ logout flow ตามโครงสร้างจริงของ Project Frontend

---

# End of Document
