import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const baseUrl = process.env.BaseURL;

        if (!baseUrl) {
            return NextResponse.json(
                { ok: false, message: "Missing BaseURL in environment variables" },
                { status: 500 }
            );
        }

        const { id } = await context.params;
        const authorization = req.headers.get("authorization");
        const body = await req.json().catch(() => null);

        const res = await fetch(`${baseUrl}/api/v1/transactions/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        const data = await res.json().catch(() => null);

        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json(
            { ok: false, message: "Update transaction status failed" },
            { status: 500 }
        );
    }
}