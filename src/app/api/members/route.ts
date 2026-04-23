import { NextRequest, NextResponse } from "next/server";
import mockData from "@/src/app/mock/member-users.json";
import type {
  MemberResponse,
  MemberSummaryItem,
  MemberUser,
  MemberUserRaw,
} from "@/src/app/type/member";

type MemberMockJson = {
  users: MemberUserRaw[];
};

const data = mockData as MemberMockJson;

function normalizeText(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function formatServerTime(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function mapUser(user: MemberUserRaw): MemberUser {
  return {
    ...user,
    roleText: user.role,
    statusText: user.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน",
  };
}

function calculateSummary(users: MemberUserRaw[]): MemberSummaryItem[] {
  const activeUsers = users.filter((user) => user.isActive);
  const adminUsers = users.filter((user) =>
    ["แอดมิน", "ผู้ดูแลระบบ", "ผู้จัดการ"].includes(user.role)
  );

  return [
    {
      title: "สมาชิกทั้งหมด",
      value: users.length,
    },
    {
      title: "กำลังใช้งาน",
      value: activeUsers.length,
    },
    {
      title: "ADMINS",
      value: adminUsers.length,
    },
  ];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim() ?? "";

  let users = [...data.users];

  if (query) {
    const keyword = normalizeText(query);

    users = users.filter((user) => {
      const target = normalizeText(
        `${user.fullName}${user.email}${user.phone}${user.role}`
      );

      return target.includes(keyword);
    });
  }

  const response: MemberResponse = {
    ok: true,
    message: "Fetched member users successfully",
    data: {
      serverTimeText: formatServerTime(new Date()),
      summary: calculateSummary(users),
      users: users.map(mapUser),
    },
  };

  return NextResponse.json(response);
}