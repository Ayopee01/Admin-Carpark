import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
    try {
        const baseUrl = process.env.BASE_URL;

        if (!baseUrl) {
            return NextResponse.json(
                { ok: false, message: "Missing BASE_URL in environment variables" },
                { status: 500 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { ok: false, message: "Missing transaction id" },
                { status: 400 }
            );
        }

        const authorization = req.headers.get("authorization");

        const response = await fetch(`${baseUrl}/api/v1/transactions/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Transaction detail route error:", error);

        return NextResponse.json(
            { ok: false, message: "Transaction detail fetch failed" },
            { status: 500 }
        );
    }
}