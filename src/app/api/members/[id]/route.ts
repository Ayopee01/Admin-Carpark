import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    try {
        const baseUrl = process.env.BASE_URL;
        const { id } = await params;

        if (!baseUrl) {
            return NextResponse.json(
                { message: "Missing BASE_URL in environment variables" },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");
        const body = await req.json().catch(() => null);

        const response = await fetch(`${baseUrl}/api/v1/members/${id}`, {
            method: "PATCH",
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
            { message: "Update member failed" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
    try {
        const baseUrl = process.env.BASE_URL;
        const { id } = await params;

        if (!baseUrl) {
            return NextResponse.json(
                { message: "Missing BASE_URL in environment variables" },
                { status: 500 }
            );
        }

        const authorization = req.headers.get("authorization");

        const response = await fetch(`${baseUrl}/api/v1/members/${id}`, {
            method: "DELETE",
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
            { message: "Delete member failed" },
            { status: 500 }
        );
    }
}