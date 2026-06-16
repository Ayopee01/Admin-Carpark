import type { ISODateString, PaginationMeta } from "@/src/app/type/common";

export type VehicleType = "car" | "motorcycle";
export type TransactionStatus =
  | "pending"
  | "partially_paid"
  | "completed"
  | "cancelled"
  | "paid"
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
  amount: { net: number; paid: number; remaining: number };
  duration: { display: string; hours: number; totalMinutes: number };
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
    amount: { netAmount: number; paidAmount: number; remainingAmount: number };
    parking: {
      entryAt: ISODateString | null;
      exitTimeLimit: ISODateString | null;
      isOverstay: boolean;
      durationDisplay: string;
      totalMinutes: number;
    };
  };
};

export type TransactionPaymentStatus = "paid" | "unpaid";
export type TransactionEditDraft = { plateNo: string };

// View model kept for the existing table UI. It is derived only from
// TransactionListItem fields at the page boundary.
export type TransactionItem = {
  id: string;
  billNo: string;
  plateNo: string;
  vehicleType: string;
  entryAt: ISODateString | null;
  exitAt: ISODateString | null;
  netAmount: number;
  status: TransactionStatus;
  payment: {
    status: TransactionPaymentStatus;
    method: string | null;
    paidAt: ISODateString | null;
  };
};
