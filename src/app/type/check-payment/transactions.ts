export type TransactionPaymentStatus = "paid" | "unpaid";

export type TransactionItem = {
    id: string;
    billNo: string;
    plateNo: string;
    vehicleType: string;
    serviceType: string;
    entryAt: string;
    exitAt: string;
    durationMinute: number;
    amount: number;
    vat: number;
    discount: number;
    netAmount: number;
    status: string;
    payment: {
        status: TransactionPaymentStatus;
        method: string | null;
        paidAt: string | null;
        qrCodeText: string | null;
        qrCodeImageUrl: string | null;
        referenceNo: string | null;
    };
    receipt: {
        receiptNo: string | null;
        issuedAt: string | null;
        footerText: string | null;
        printableText: string | null;
    };
    createdAt: string;
    updatedAt: string;
};

export type TransactionListResponse = {
    data: TransactionItem[];
    meta: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
};

export type TransactionEditDraft = {
    plateNo: string;
};