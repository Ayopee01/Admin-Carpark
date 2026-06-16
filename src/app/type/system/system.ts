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
    frontendUrl?: string;
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
    configUpdatedAt?: string;
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
    configUpdatedAt?: string;
    general: SystemGeneralSettings;
    receipt: ReceiptSettings;
    billing: BillingSettings;
    updatedAt: string;
    method?: string;
    action?: string;
};

export type SystemSettingsResponse = {
    configUpdatedAt: string | null;
    general: {
        systemName: string | null;
        location: string | null;
        language: string | null;
        timezone: string | null;
        frontendUrl: string | null;
    };
    receipt: ReceiptSettings;
    billing: Record<string, unknown> & {
        taxEnabled?: boolean;
        currency?: string;
        roundingMode?: string;
    };
    updatedAt?: string;
};

export type UpdateSystemSettingsPayload = Partial<{
    general: Partial<SystemGeneralSettings>;
    receipt: Partial<ReceiptSettings>;
    billing: Partial<BillingSettings>;
    method: string;
    action: string;
}>;

export type UpdateSystemSettingsResponse = {
    success: boolean;
    message: string;
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
    success: boolean;
    message: string;
};

export type PrinterSettings = {
    configUpdatedAt: string | null;
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

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
    general: {
        systemName: "",
        location: "",
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
        footerText: "",
    },
    billing: {
        taxEnabled: false,
        currency: "THB",
        roundingMode: "normal",
    },
    updatedAt: "",
};

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = DEFAULT_SYSTEM_SETTINGS.receipt;
