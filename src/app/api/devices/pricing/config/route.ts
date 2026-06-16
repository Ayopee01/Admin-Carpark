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

        const response = await fetch(`${baseUrl}/api/v1/service-pricing/config`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        return NextResponse.json(data, { status: response.status });
    } catch {
        return NextResponse.json(
            { message: "Service pricing config fetch failed" },
            { status: 500 }
        );
    }
}

async function updatePricingConfig(req: NextRequest, method: "POST" | "PUT") {
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

        const response = await fetch(`${baseUrl}/api/v1/service-pricing/config`, {
            method,
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
            { message: "Service pricing config update failed" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    return updatePricingConfig(req, "PUT");
}

export async function POST(req: NextRequest) {
    return updatePricingConfig(req, "POST");
}
