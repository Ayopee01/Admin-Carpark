import { apiRequest } from "./apiClient";
import type { CreateMemberPayload, Member, MemberDeleteResponse, MemberPermissionsUpdateResponse, MemberStats, UpdateMemberPayload, UpdatePermissionsPayload } from "@/src/app/type/member/member";

export const membersApi = {
  list: () => apiRequest<Member[]>("/api/members"),
  stats: () => apiRequest<MemberStats>("/api/members/stats"),
  create: (body: CreateMemberPayload) => apiRequest<Member>("/api/members", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: UpdateMemberPayload) => apiRequest<Member>(`/api/members/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  updatePermissions: (id: string, body: UpdatePermissionsPayload) => apiRequest<MemberPermissionsUpdateResponse>(`/api/members/${id}/permissions`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<MemberDeleteResponse>(`/api/members/${id}`, { method: "DELETE" }),
};
