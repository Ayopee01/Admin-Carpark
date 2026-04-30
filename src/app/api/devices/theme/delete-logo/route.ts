// src/app/api/devices/theme/logo/route.ts

import { NextRequest, NextResponse } from "next/server";

function getBaseUrl() {
    return process.env.BaseURL ?? process.env.BASE_URL ?? "";
}

async function safeJson(response: Response) {
    return response.json().catch(() => null);
}

export async function DELETE(request: NextRequest) {
    try {
        const baseUrl = getBaseUrl();

        if (!baseUrl) {
            return NextResponse.json(
                { message: "BaseURL is not configured" },
                { status: 500 }
            );
        }

        const authorization = request.headers.get("authorization");

        const response = await fetch(
            `${baseUrl.replace(/\/$/, "")}/api/v1/theme/logo`,
            {
                method: "DELETE",
                headers: {
                    ...(authorization ? { Authorization: authorization } : {}),
                },
                cache: "no-store",
            }
        );

        const result = await safeJson(response);

        return NextResponse.json(result, {
            status: response.status,
        });
    } catch (error) {
        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Delete logo failed",
            },
            { status: 500 }
        );
    }
}