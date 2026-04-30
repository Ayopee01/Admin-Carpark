import type { MeResponse } from "@/src/app/type/auth/me";

export type PermissionKey =
    | "dashboard"
    | "transactions"
    | "overview"
    | "pricing"
    | "devices"
    | "theme"
    | "settings";

export type SidebarUser = MeResponse & {
    role?: string | null;
    permissions?: string[] | null;
};

export type SidebarMenuItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number }>;
    permissions: PermissionKey[];
};

export type PermissionUser = {
    role?: string | null;
    permissions?: string[] | null;
};