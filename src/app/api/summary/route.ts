import { NextRequest, NextResponse } from "next/server";

function getBaseUrl() {
  return process.env.BaseURL ?? process.env.BASE_URL ?? "";
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl();

    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, message: "Missing BASE_URL in environment variables" },
        { status: 500 }
      );
    }

    const authorization = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);

    const startDate =
      searchParams.get("start_date") || searchParams.get("startDate");

    const endDate =
      searchParams.get("end_date") || searchParams.get("endDate");

    const upstreamUrl = new URL(`${baseUrl}/api/v1/overview/summary`);

    if (startDate) {
      upstreamUrl.searchParams.set("start_date", startDate);
    }

    if (endDate) {
      upstreamUrl.searchParams.set("end_date", endDate);
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