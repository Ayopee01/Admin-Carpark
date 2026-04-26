import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.BASE_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, message: "Missing BASE_URL in environment variables" },
        { status: 500 }
      );
    }

    const authorization = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const upstreamUrl = new URL(`${baseUrl}/api/v1/overview/summary`);

    if (startDate) {
      upstreamUrl.searchParams.set("startDate", startDate);
    }

    if (endDate) {
      upstreamUrl.searchParams.set("endDate", endDate);
    }

    const response = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Overview summary route error:", error);

    return NextResponse.json(
      { ok: false, message: "Overview summary fetch failed" },
      { status: 500 }
    );
  }
}