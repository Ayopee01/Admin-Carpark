import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const baseUrl = process.env.BaseURL;

        if (!baseUrl) {
            return NextResponse.json(
                { ok: false, message: "Missing BaseURL in environment variables" },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");

        const res = await fetch(`${baseUrl}/api/v1/dashboard`, {
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
            { ok: false, message: "Dashboard revenue overall fetch failed" },
            { status: 500 }
        );
    }
}