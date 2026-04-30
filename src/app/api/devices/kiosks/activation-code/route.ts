import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const baseUrl = process.env.BASE_URL;

        if (!baseUrl) {
            return NextResponse.json(
                { message: "BaseURL is not configured" },
                { status: 500 }
            );
        }

        const authorization = request.headers.get("authorization");
        const body = await request.json();

        const payload = {
            name: body.name ?? "",
            location: body.location ?? "",
        };

        const response = await fetch(
            `${baseUrl}/api/v1/devices/kiosks/activation-code`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(authorization
                        ? {
                            Authorization: authorization,
                        }
                        : {}),
                },
                body: JSON.stringify(payload),
                cache: "no-store",
            }
        );

        const data = await response.json().catch(() => null);

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        return NextResponse.json(
            {
                message: "Failed to generate kiosk activation code",
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            { status: 500 }
        );
    }
}