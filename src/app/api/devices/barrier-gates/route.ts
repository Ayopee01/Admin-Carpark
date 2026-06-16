import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const baseUrl = process.env.BASE_URL;

        if (!baseUrl) {
            return NextResponse.json(
                { message: "Missing BASE_URL in environment variables" },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");

        const response = await fetch(`${baseUrl}/api/v1/devices/barrier-gates`, {
            method: "GET",
            headers: {
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        return NextResponse.json(data, { status: response.status });
    } catch {
        return NextResponse.json(
            { message: "Barrier gates fetch failed" },
            { status: 500 }
        );
    }
}
