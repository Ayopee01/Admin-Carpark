import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.BASE_URL ?? "";

    if (!baseUrl) {
      return NextResponse.json(
        { message: "API base URL is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid Omise charge payload" },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;
    const sanitizedBody = {
      plateNo: payload.plateNo,
      source: payload.source,
      sourceType: payload.sourceType ?? "promptpay",
      method: payload.method ?? "promptpay",
      channel: "cashier",
      transactionId: payload.transactionId,
      amount: payload.amount,
    };

    const authorization = request.headers.get("authorization");
    const response = await fetch(
      `${baseUrl}/api/v1/admin/payment/omise/charge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body: JSON.stringify(sanitizedBody),
        cache: "no-store",
      }
    );

    return NextResponse.json(await response.json().catch(() => null), {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to create Omise charge",
        reason: error instanceof Error ? error.message : "network_error",
      },
      { status: 502 }
    );
  }
}
