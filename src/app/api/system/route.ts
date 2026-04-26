import { NextRequest, NextResponse } from "next/server";

const BaseURL = process.env.BASE_URL;

function getErrorMessage(value: unknown, fallback: string) {
    if (
        value &&
        typeof value === "object" &&
        "message" in value &&
        typeof value.message === "string"
    ) {
        return value.message;
    }

    return fallback;
}

export async function GET(request: NextRequest) {
    try {
        if (!BaseURL) {
            return NextResponse.json(
                { message: "BaseURL is not configured" },
                { status: 500 }
            );
        }

        const authorization = request.headers.get("authorization");

        const response = await fetch(`${BaseURL}/api/v1/system-settings`, {
            method: "GET",
            headers: {
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
            return NextResponse.json(
                {
                    message: getErrorMessage(
                        result,
                        "โหลดข้อมูลตั้งค่าระบบไม่สำเร็จ"
                    ),
                    raw: result,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "เกิดข้อผิดพลาดระหว่างโหลดข้อมูลตั้งค่าระบบ",
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!BaseURL) {
            return NextResponse.json(
                { message: "BaseURL is not configured" },
                { status: 500 }
            );
        }

        const authorization = request.headers.get("authorization");
        const body = await request.json().catch(() => ({}));

        const response = await fetch(`${BaseURL}/api/v1/system-settings`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
            return NextResponse.json(
                {
                    message: getErrorMessage(
                        result,
                        "อัปเดตข้อมูลตั้งค่าระบบไม่สำเร็จ"
                    ),
                    raw: result,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "เกิดข้อผิดพลาดระหว่างอัปเดตข้อมูลตั้งค่าระบบ",
            },
            { status: 500 }
        );
    }
}