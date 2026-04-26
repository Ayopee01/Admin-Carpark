export type SystemLanguage = "th" | "en" | "zh" | string;
export type SystemTimezone = "Asia/Bangkok" | string;
export type PaperWidth = "58mm" | "80mm" | string;
export type CurrencyCode = "THB" | string;
export type RoundingMode = "normal" | "up" | "down" | string;

export type SystemGeneralSettings = {
    systemName: string;
    location: string;
    language: SystemLanguage;
    timezone: SystemTimezone;
};

export type EntryBillSettings = {
    showDate: boolean;
    showEntryTime: boolean;
    showQrCode: boolean;
    showBillNo: boolean;
};

export type PaymentBillSettings = EntryBillSettings & {
    showExpiryTime: boolean;
    expiryDuration: number;
};

export type ReceiptSettings = {
    entryBill: EntryBillSettings;
    paymentBill: PaymentBillSettings;
    paperWidth: PaperWidth;
    footerText: string;
    method?: string;
    action?: string;
};

export type BillingSettings = {
    taxEnabled: boolean;
    currency: CurrencyCode;
    roundingMode: RoundingMode;
};

export type SystemSettings = {
    general: SystemGeneralSettings;
    receipt: ReceiptSettings;
    billing: BillingSettings;
    updatedAt: string;
    method?: string;
    action?: string;
};

export type SystemSettingsResponse = SystemSettings;

export type UpdateSystemSettingsPayload = Partial<{
    general: Partial<SystemGeneralSettings>;
    receipt: Partial<ReceiptSettings>;
    billing: Partial<BillingSettings>;
    method: string;
    action: string;
}>;

export type UpdateSystemSettingsResponse = {
    message: string;
    settings: SystemSettings;
};

export type ReceiptSettingsResponse = ReceiptSettings;

export type UpdateReceiptSettingsPayload = Partial<{
    entryBill: Partial<EntryBillSettings>;
    paymentBill: Partial<PaymentBillSettings>;
    paperWidth: PaperWidth;
    footerText: string;
    method: string;
    action: string;
}>;

export type UpdateReceiptSettingsResponse = {
    message: string;
    receipt: ReceiptSettings;
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
    general: {
        systemName: "Smart Carpark",
        location: "อาคารผู้โดยสาร A-12",
        language: "th",
        timezone: "Asia/Bangkok",
    },
    receipt: {
        entryBill: {
            showDate: true,
            showEntryTime: true,
            showQrCode: true,
            showBillNo: true,
        },
        paymentBill: {
            showDate: true,
            showEntryTime: true,
            showQrCode: true,
            showBillNo: true,
            showExpiryTime: true,
            expiryDuration: 15,
        },
        paperWidth: "80mm",
        footerText: "ขอบคุณที่ใช้บริการ",
    },
    billing: {
        taxEnabled: false,
        currency: "THB",
        roundingMode: "normal",
    },
    updatedAt: "",
};

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = DEFAULT_SYSTEM_SETTINGS.receipt;