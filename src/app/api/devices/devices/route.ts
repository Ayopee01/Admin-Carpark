import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const baseUrl = process.env.BASE_URL;
        if (!baseUrl) {
            return NextResponse.json({ message: "Missing BASE_URL in environment variables" }, { status: 500 });
        }

        const url = new URL(`${baseUrl}/api/v1/devices`);
        req.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));
        const authorization = req.headers.get("authorization");
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });
        const data = await response.json().catch(() => null);
        return NextResponse.json(data, { status: response.status });
    } catch {
        return NextResponse.json({ message: "Devices fetch failed" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const baseUrl = process.env.BASE_URL;

        if (!baseUrl) {
            return NextResponse.json(
                { message: "Missing BASE_URL in environment variables" },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");
        const body = await req.json().catch(() => null);

        const response = await fetch(`${baseUrl}/api/v1/devices`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        return NextResponse.json(data, { status: response.status });
    } catch {
        return NextResponse.json(
            { message: "Create device failed" },
            { status: 500 }
        );
    }
}
