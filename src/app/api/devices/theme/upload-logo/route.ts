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

function normalizeUploadLogoResponse(baseUrl: string, data: unknown) {
    if (!data || typeof data !== "object") return data;

    const record = data as Record<string, unknown>;

    const nextData: Record<string, unknown> = {
        ...record,
        logoUrl: resolveAssetUrl(baseUrl, record.logoUrl),
        url: resolveAssetUrl(baseUrl, record.url),
    };

    if (
        record.theme &&
        typeof record.theme === "object" &&
        record.theme !== null
    ) {
        const theme = record.theme as Record<string, unknown>;

        nextData.theme = {
            ...theme,
            logoUrl: resolveAssetUrl(baseUrl, theme.logoUrl),
        };
    }

    if (
        record.data &&
        typeof record.data === "object" &&
        record.data !== null
    ) {
        const dataObject = record.data as Record<string, unknown>;

        nextData.data = {
            ...dataObject,
            logoUrl: resolveAssetUrl(baseUrl, dataObject.logoUrl),
            url: resolveAssetUrl(baseUrl, dataObject.url),
        };
    }

    return nextData;
}

export async function POST(req: NextRequest) {
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
        const formData = await req.formData();
        const logo = formData.get("logo");

        if (!logo || typeof logo === "string") {
            return NextResponse.json(
                {
                    message: "Logo file is required",
                    receivedKeys: Array.from(formData.keys()),
                },
                { status: 400 }
            );
        }

        const uploadFormData = new FormData();

        uploadFormData.append("logo", logo, logo.name || "logo");

        const targetUrl = `${baseUrl.replace(/\/$/, "")}/api/v1/theme/upload-logo`;

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: uploadFormData,
            cache: "no-store",
        });

        const responseText = await response.text();
        const data = parseJsonSafe(responseText);

        if (!response.ok) {
            return NextResponse.json(
                {
                    message: getErrorMessage(
                        data,
                        `อัปโหลดโลโก้ไม่สำเร็จจาก backend status ${response.status}`
                    ),
                    targetUrl,
                    raw: data ?? responseText,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(normalizeUploadLogoResponse(baseUrl, data), {
            status: response.status,
        });
    } catch (error) {
        console.error("UPLOAD_LOGO_ROUTE_ERROR:", error);

        return NextResponse.json(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "อัปโหลดโลโก้ไม่สำเร็จ",
            },
            { status: 500 }
        );
    }
}