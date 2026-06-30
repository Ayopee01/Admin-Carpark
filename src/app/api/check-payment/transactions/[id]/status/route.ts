import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
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
        const body = await req.json().catch(() => null);

        const encodedId = encodeURIComponent(id);

        const response = await fetch(`${baseUrl}/api/v1/transactions/${encodedId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Update transaction status route error:", error);

        return NextResponse.json(
            { ok: false, message: "Update transaction status failed" },
            { status: 500 }
        );
    }
}
