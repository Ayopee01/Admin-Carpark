export type MemberStatus = "active" | "inactive";
export type MemberRole = "super_admin" | "admin" | "manager" | "staff" | string;

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  role: MemberRole;
  status: MemberStatus;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type MemberStats = {
  totalMembers: number;
  activeMembers: number;
  totalAdmins: number;
};

export type CreateMemberPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  permissions: string[];
};

export type UpdateMemberPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: MemberStatus;
};

export type UpdatePermissionsPayload = {
  permissions: string[];
};