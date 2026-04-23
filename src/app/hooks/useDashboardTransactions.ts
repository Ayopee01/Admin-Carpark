"use client";

import { useEffect, useState } from "react";

export type DashboardTransaction = {
    id: string;
    billNo: string;
    plateNo: string;
    vehicleType: string;
    serviceType: string;
    entryAt: string;
    exitAt: string | null;
    durationMinute: number;
    amount: number;
    vat: number;
    discount: number;
    netAmount: number;
    status: "completed" | "pending" | "cancelled" | string;
    payment: {
        status: "paid" | "unpaid" | string;
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

type TransactionsResponse = {
    data: DashboardTransaction[];
    meta: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
};

type UseDashboardTransactionsResult = {
    transactions: DashboardTransaction[];
    loading: boolean;
    error: string;
};

async function fetchTransactionsPage(
    token: string,
    page: number,
    perPage = 100
): Promise<TransactionsResponse> {
    const response = await fetch(
        `/api/check-payment/transactions?page=${page}&perPage=${perPage}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูล transactions ได้");
    }

    return response.json();
}

async function fetchAllTransactions(token: string) {
    const firstPage = await fetchTransactionsPage(token, 1, 100);
    const allTransactions = [...firstPage.data];

    if (firstPage.meta.totalPages <= 1) {
        return allTransactions;
    }

    const requests: Promise<TransactionsResponse>[] = [];

    for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
        requests.push(fetchTransactionsPage(token, page, 100));
    }

    const restPages = await Promise.all(requests);

    for (const pageData of restPages) {
        allTransactions.push(...pageData.data);
    }

    return allTransactions;
}

export function useDashboardTransactions(): UseDashboardTransactionsResult {
    const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadTransactions() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Missing token");
                }

                const allTransactions = await fetchAllTransactions(token);

                if (!isMounted) return;

                setTransactions(allTransactions);
            } catch (err) {
                if (!isMounted) return;

                setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        }

        loadTransactions();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        transactions,
        loading,
        error,
    };
}