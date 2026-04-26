import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, message: "Missing BASE_URL in environment variables" },
        { status: 500 }
      );
    }

    if (!body?.refreshToken) {
      return NextResponse.json(
        { ok: false, message: "Missing refreshToken" },
        { status: 400 }
      );
    }

    const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: body.refreshToken,
      }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Refresh token failed" },
      { status: 500 }
    );
  }
}