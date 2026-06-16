import type { ISODateString, Permission } from "@/src/app/type/common";
import type { UserRole, UserStatus } from "@/src/app/type/auth/auth";

export type MemberStatus = UserStatus;
export type MemberRole = UserRole;

export type Member = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  role: MemberRole;
  status: MemberStatus;
  permissions: Permission[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type MemberStats = {
  totalMembers: number;
  activeMembers: number;
  totalAdmins: number;
};

export type CreateMemberPayload = {
  username?: string;
  password: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: MemberRole;
  status?: MemberStatus;
  permissions: Permission[];
};

export type UpdateMemberPayload = Partial<Omit<CreateMemberPayload, "password">> & {
  password?: string;
};

export type UpdatePermissionsPayload = { permissions: Permission[] };
export type MemberPermissionsUpdateResponse = { message: string; member: Member };
export type MemberDeleteResponse = { message: string };
