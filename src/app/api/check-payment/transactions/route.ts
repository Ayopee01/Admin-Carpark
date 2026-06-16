import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ message: "Missing BASE_URL in environment variables" }, { status: 500 });
    }

    const upstreamUrl = new URL(`${baseUrl}/api/v1/transactions`);
    req.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.append(key, value));

    const authorization = req.headers.get("authorization");
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Transactions fetch failed" },
      { status: 500 }
    );
  }
}
