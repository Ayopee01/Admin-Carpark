import type { ISODateString, Permission } from "@/src/app/type/common";

export type UserRole = "super_admin" | "staff" | "system" | string;
export type UserStatus = "active" | "inactive" | string;

export type User = {
  id: string;
  username: string;
  name: string;
  email: string | null;
  phone?: string | null;
  role: UserRole;
  permissions: Permission[];
  status: UserStatus;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type RefreshResponse = {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
};

export type MeResponse = {
  user: User;
};

export type LogoutResponse = {
  message: string;
};
