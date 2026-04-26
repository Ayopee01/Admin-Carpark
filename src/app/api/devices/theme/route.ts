import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getBaseUrl() {
    return process.env.BASE_URL || process.env.BaseURL || "";
}

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

function parseJsonSafe(text: string) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function resolveAssetUrl(baseUrl: string, value: unknown) {
    if (typeof value !== "string" || !value) return value;

    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:")
    ) {
        return value;
    }

    if (value.startsWith("/")) {
        return `${baseUrl.replace(/\/$/, "")}${value}`;
    }

    return value;
}

function normalizeThemeAssetUrl(baseUrl: string, data: unknown) {
    if (!data || typeof data !== "object") return data;

    const record = data as Record<string, unknown>;

    if (record.logoUrl && typeof record.logoUrl === "string") {
        return {
            ...record,
            logoUrl: resolveAssetUrl(baseUrl, record.logoUrl),
        };
    }

    if (
        record.theme &&
        typeof record.theme === "object" &&
        record.theme !== null
    ) {
        const theme = record.theme as Record<string, unknown>;

        return {
            ...record,
            theme: {
                ...theme,
                logoUrl: resolveAssetUrl(baseUrl, theme.logoUrl),
            },
        };
    }

    return data;
}

export async function GET(req: NextRequest) {
    try {
        const baseUrl = getBaseUrl();

        if (!baseUrl) {
            return NextResponse.json(
                {
                    message: "Missing BASE_URL or BaseURL in environment variables",
                },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");
        const targetUrl = `${baseUrl.replace(/\/$/, "")}/api/v1/theme`;

        const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
                Accept: "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });

        const responseText = await response.text();
        const data = parseJsonSafe(responseText);

        if (!response.ok) {
            return NextResponse.json(
                {
                    message: getErrorMessage(
                        data,
                        `Theme fetch failed from backend status ${response.status}`
                    ),
                    targetUrl,
                    raw: data ?? responseText,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(normalizeThemeAssetUrl(baseUrl, data), {
            status: response.status,
        });
    } catch (error) {
        console.error("THEME_GET_ROUTE_ERROR:", error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : "Theme fetch failed",
            },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const baseUrl = getBaseUrl();

        if (!baseUrl) {
            return NextResponse.json(
                {
                    message: "Missing BASE_URL or BaseURL in environment variables",
                },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");
        const body = await req.json().catch(() => ({}));
        const targetUrl = `${baseUrl.replace(/\/$/, "")}/api/v1/theme`;

        const response = await fetch(targetUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        const responseText = await response.text();
        const data = parseJsonSafe(responseText);

        if (!response.ok) {
            return NextResponse.json(
                {
                    message: getErrorMessage(
                        data,
                        `Theme update failed from backend status ${response.status}`
                    ),
                    targetUrl,
                    raw: data ?? responseText,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(normalizeThemeAssetUrl(baseUrl, data), {
            status: response.status,
        });
    } catch (error) {
        console.error("THEME_PUT_ROUTE_ERROR:", error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : "Theme update failed",
            },
            { status: 500 }
        );
    }
}