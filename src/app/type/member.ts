export type MemberUserRaw = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
};

export type MemberUser = MemberUserRaw & {
  roleText: string;
  statusText: string;
};

export type MemberSummaryItem = {
  title: string;
  value: number;
  note?: string;
};

export type MemberResponse = {
  ok: boolean;
  message: string;
  data: {
    serverTimeText: string;
    summary: MemberSummaryItem[];
    users: MemberUser[];
  };
};