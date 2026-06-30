import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
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

    const response = await fetch(
      `${baseUrl}/api/v1/devices/${id}/reissue-activation-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
        },
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => null);

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Reissue activation code failed" },
      { status: 500 }
    );
  }
}
