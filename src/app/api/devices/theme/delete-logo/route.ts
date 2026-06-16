import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getBaseUrl() {
    return process.env.BaseURL || process.env.BASE_URL || "";
}

function parseJsonSafe(text: string) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const baseUrl = getBaseUrl();

        if (!baseUrl) {
            return NextResponse.json(
                {
                    message: "Missing BaseURL or BASE_URL in environment variables",
                },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");

        const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/theme/logo`, {
            method: "DELETE",
            headers: {
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });

        const responseText = await response.text();
        const data = parseJsonSafe(responseText);

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        return NextResponse.json(data ?? { message: "Delete logo success" }, {
            status: response.status,
        });
    } catch (error) {
        console.error("DELETE_LOGO_ROUTE_ERROR:", error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : "Delete logo failed",
            },
            { status: 500 }
        );
    }
}
