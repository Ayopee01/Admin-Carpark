import type { ComponentType } from "react";
import type { Permission } from "@/src/app/type/common";
import type { User } from "@/src/app/type/auth/auth";

export type PermissionKey = Permission;

export type SidebarUser = User;

export type SidebarMenuItem = {
    label: string;
    href: string;
    icon: ComponentType<{ size?: number }>;
    permissions: PermissionKey[];
};

export type PermissionUser = Pick<User, "permissions">;
