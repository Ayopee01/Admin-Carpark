import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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
    const upstreamUrl = new URL(`${baseUrl}/api/v1/overview/events`);

    const startDate =
      searchParams.get("start_date") || searchParams.get("startDate");
    const endDate =
      searchParams.get("end_date") || searchParams.get("endDate");

    if (startDate) {
      upstreamUrl.searchParams.set("start_date", startDate);
    }

    if (endDate) {
      upstreamUrl.searchParams.set("end_date", endDate);
    }

    const response = await fetch(upstreamUrl.toString(), {
      headers: {
        Accept: "text/event-stream",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => null);
      return NextResponse.json(data, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Overview events route error:", error);

    return NextResponse.json(
      { ok: false, message: "Overview events stream failed" },
      { status: 500 }
    );
  }
}
