import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ThemeApiResponse = {
    themeColor: string | null;
    logoUrl: string | null;
    themeMode: string | null;
    customThemeColor: string | null;
    configUpdatedAt?: string;
    updatedAt?: string;
};

type ThemePutPayload = {
    themeColor?: string;
    logoUrl?: string | null;
    themeMode?: string;
    customThemeColor?: string | null;
};

function getBaseUrl() {
    return process.env.BaseURL || process.env.BASE_URL || "";
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

function isHexColor(value: unknown): value is string {
    return (
        typeof value === "string" &&
        /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
    );
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

function normalizeThemeResponse(baseUrl: string, data: unknown): ThemeApiResponse {
    if (!data || typeof data !== "object") {
        return {
            themeColor: null,
            logoUrl: null,
            themeMode: null,
            customThemeColor: null,
        };
    }

    const outer = data as Record<string, unknown>;
    const record =
        outer.theme && typeof outer.theme === "object"
            ? (outer.theme as Record<string, unknown>)
            : outer;

    const themeMode = typeof record.themeMode === "string" ? record.themeMode : null;
    const customThemeColor = isHexColor(record.customThemeColor)
        ? record.customThemeColor
        : null;
    const themeColor =
        themeMode === "custom"
            ? customThemeColor ?? "#FFD54F"
            : isHexColor(record.themeColor)
                ? record.themeColor
                : null;

    return {
        themeColor,
        logoUrl:
            typeof record.logoUrl === "string"
                ? String(resolveAssetUrl(baseUrl, record.logoUrl))
                : null,
        themeMode,
        customThemeColor,
        updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
        configUpdatedAt:
            typeof record.configUpdatedAt === "string"
                ? record.configUpdatedAt
                : undefined,
    };
}

export async function GET(req: NextRequest) {
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
                    raw: data ?? responseText,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(normalizeThemeResponse(baseUrl, data), {
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
                    message: "Missing BaseURL or BASE_URL in environment variables",
                },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");
        const body = await req.json().catch(() => null);

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                {
                    message: "Request body must be a JSON object",
                },
                { status: 400 }
            );
        }

        const record = body as Record<string, unknown>;
        const hasThemeColor = Object.prototype.hasOwnProperty.call(
            record,
            "themeColor"
        );
        const hasLogoUrl = Object.prototype.hasOwnProperty.call(record, "logoUrl");
        const hasThemeMode = Object.prototype.hasOwnProperty.call(
            record,
            "themeMode"
        );
        const hasCustomThemeColor = Object.prototype.hasOwnProperty.call(
            record,
            "customThemeColor"
        );
        const themeColor = record.themeColor;
        const logoUrl = record.logoUrl;
        const themeMode = record.themeMode;
        const customThemeColor = record.customThemeColor;

        if (!hasThemeColor && !hasLogoUrl && !hasThemeMode && !hasCustomThemeColor) {
            return NextResponse.json(
                {
                    message: "themeColor, logoUrl, themeMode, or customThemeColor is required",
                },
                { status: 400 }
            );
        }

        if (hasThemeColor && !isHexColor(themeColor)) {
            return NextResponse.json(
                {
                    message: "themeColor must be a HEX color, for example #FFD54F",
                },
                { status: 400 }
            );
        }

        if (hasLogoUrl && typeof logoUrl !== "string" && logoUrl !== null) {
            return NextResponse.json(
                {
                    message: "logoUrl must be a string or null",
                },
                { status: 400 }
            );
        }

        if (hasThemeMode && typeof themeMode !== "string") {
            return NextResponse.json(
                {
                    message: "themeMode must be a string",
                },
                { status: 400 }
            );
        }

        if (
            hasCustomThemeColor &&
            !isHexColor(customThemeColor) &&
            customThemeColor !== null
        ) {
            return NextResponse.json(
                {
                    message: "customThemeColor must be a HEX color or null",
                },
                { status: 400 }
            );
        }

        const payload: ThemePutPayload = {};

        if (hasThemeColor) {
            payload.themeColor = themeColor as string;
        }

        if (hasLogoUrl) {
            payload.logoUrl = logoUrl as string | null;
        }

        if (hasThemeMode) {
            payload.themeMode = themeMode as string;
        }

        if (hasCustomThemeColor) {
            payload.customThemeColor = customThemeColor as string | null;
        }

        const targetUrl = `${baseUrl.replace(/\/$/, "")}/api/v1/theme`;

        const response = await fetch(targetUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: JSON.stringify(payload),
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
                    raw: data ?? responseText,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(normalizeThemeResponse(baseUrl, data), {
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
