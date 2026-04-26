import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const baseUrl = process.env.BASE_URL;

        if (!baseUrl) {
            return NextResponse.json(
                { ok: false, message: "Missing BaseURL in environment variables" },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");

        const res = await fetch(`${baseUrl}/api/v1/auth/logout`, {
            method: "POST",
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
            { ok: false, message: "Logout failed" },
            { status: 500 }
        );
    }
}