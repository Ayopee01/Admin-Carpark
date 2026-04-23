export type PaymentStatus = "pending" | "paid";

export type CheckPaymentItemRaw = {
  id: string;
  billNo: string;
  plate: string;
  serviceAt: string;
  fee: number;
  status: PaymentStatus;
};

export type CheckPaymentItem = {
  id: string;
  billNo: string;
  plate: string;
  serviceAt: string;
  serviceAtText: string;
  fee: number;
  feeText: string;
  status: PaymentStatus;
  statusText: string;
};

export type CheckPaymentResponse = {
  ok: boolean;
  message: string;
  data: {
    total: number;
    items: CheckPaymentItem[];
  };
};