export type PaymentMethodIcon = "cash" | "bank" | "qr" | "wallet" | "more" | string;
export type ServiceChannelIcon = "user" | "vending" | "qr" | "gate" | string;

export type PaymentMethod = {
    id: string;
    label: string;
    icon: PaymentMethodIcon;
    isActive: boolean;
    method?: string;
    action?: string;
};

export type ServiceChannel = {
    id: string;
    name: string;
    icon: ServiceChannelIcon;
    allowedMethods: string[];
};

export type UpdatePaymentMethodPayload = {
    isActive: boolean;
};

export type UpdateChannelMethodsPayload = {
    allowedMethods: string[];
};