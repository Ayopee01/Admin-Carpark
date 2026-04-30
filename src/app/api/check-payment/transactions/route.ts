import { NextRequest, NextResponse } from "next/server";

type ApiMeta = {
    page?: number;
    perPage?: number;
    per_page?: number;
    total?: number;
    totalPages?: number;
    total_pages?: number;
};

type ApiResponse = {
    data?: unknown[];
    meta?: ApiMeta;
};

function getBaseUrl() {
    return process.env.BaseURL ?? process.env.BASE_URL ?? "";
}

function buildUpstreamUrl(baseUrl: string, page: number) {
    const url = new URL(`${baseUrl}/api/v1/transactions`);

    /**
     * ไม่กำหนด per_page เอง
     * ให้ Backend ใช้ default ของตัวเอง เช่น หน้าละ 10
     */
    url.searchParams.set("page", String(page));

    return url.toString();
}

async function fetchTransactionPage({
    baseUrl,
    page,
    authorization,
}: {
    baseUrl: string;
    page: number;
    authorization: string | null;
}) {
    const response = await fetch(buildUpstreamUrl(baseUrl, page), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(authorization ? { Authorization: authorization } : {}),
        },
        cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as ApiResponse | null;

    if (!response.ok) {
        return {
            ok: false,
            status: response.status,
            data,
        };
    }

    return {
        ok: true,
        status: response.status,
        data,
    };
}

export async function GET(req: NextRequest) {
    try {
        const baseUrl = getBaseUrl();

        if (!baseUrl) {
            return NextResponse.json(
                { ok: false, message: "Missing BaseURL in environment variables" },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");

        const firstPage = await fetchTransactionPage({
            baseUrl,
            page: 1,
            authorization,
        });

        if (!firstPage.ok) {
            return NextResponse.json(firstPage.data, {
                status: firstPage.status,
            });
        }

        const firstData = firstPage.data?.data ?? [];
        const meta = firstPage.data?.meta;

        const totalPages =
            meta?.totalPages ??
            meta?.total_pages ??
            1;

        const allItems = [...firstData];

        for (let page = 2; page <= totalPages; page += 1) {
            const nextPage = await fetchTransactionPage({
                baseUrl,
                page,
                authorization,
            });

            if (!nextPage.ok) {
                return NextResponse.json(nextPage.data, {
                    status: nextPage.status,
                });
            }

            allItems.push(...(nextPage.data?.data ?? []));
        }

        return NextResponse.json({
            data: allItems,
            meta: {
                page: 1,
                perPage: allItems.length,
                total: allItems.length,
                totalPages: 1,
                source: meta,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: "Transactions fetch failed",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}