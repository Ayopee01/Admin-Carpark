import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const baseUrl = process.env.BASE_URL;

        if (!baseUrl) {
            return NextResponse.json(
                { ok: false, message: "Missing BaseURL in environment variables" },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");

        const response = await fetch(`${baseUrl}/api/v1/dashboard`, {
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
    } catch {
        return NextResponse.json(
            { ok: false, message: "Dashboard fetch failed" },
            { status: 500 }
        );
    }
}