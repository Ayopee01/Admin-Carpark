import { apiRequest } from "./apiClient";
import type { LoginRequest, LoginResponse, LogoutResponse, MeResponse } from "@/src/app/type/auth/auth";

export const authApi = {
  login: (body: LoginRequest) => apiRequest<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => apiRequest<MeResponse>("/api/auth/me"),
  logout: () => apiRequest<LogoutResponse>("/api/auth/logout", { method: "POST" }),
};
