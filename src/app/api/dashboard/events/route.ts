import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ message: "Missing BASE_URL in environment variables" }, { status: 500 });
    }

    const authorization = req.headers.get("authorization");
    const response = await fetch(`${baseUrl}/api/v1/dashboard/events`, {
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
  } catch {
    return NextResponse.json({ message: "Dashboard events stream failed" }, { status: 500 });
  }
}
