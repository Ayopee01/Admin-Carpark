import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
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
        const search = req.nextUrl.search;

        const res = await fetch(`${baseUrl}/api/v1/transactions/${id}${search}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });

        const data = await res.json().catch(() => null);

        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json(
            { ok: false, message: "Fetch transaction detail failed" },
            { status: 500 }
        );
    }
}