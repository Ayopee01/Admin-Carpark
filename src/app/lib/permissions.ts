export type PermissionKey =
    | "dashboard"
    | "transactions"
    | "overview"
    | "pricing"
    | "devices"
    | "theme"
    | "settings";

export type PermissionUser = {
    role?: string | null;
    permissions?: string[] | null;
};

export function hasPermission(
    user: PermissionUser | null | undefined,
    permission?: PermissionKey
) {
    if (!permission) return true;
    if (!user) return false;

    if (user.role === "super_admin") return true;

    return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

export function hasAnyPermission(
    user: PermissionUser | null | undefined,
    permissions: PermissionKey[]
) {
    if (!user) return false;

    if (user.role === "super_admin") return true;

    if (!Array.isArray(user.permissions)) return false;

    return permissions.some((permission) =>
        user.permissions?.includes(permission)
    );
}

export function getStoredUser(): PermissionUser | null {
    if (typeof window === "undefined") return null;

    const rawUser = localStorage.getItem("user");

    if (!rawUser) return null;

    try {
        return JSON.parse(rawUser) as PermissionUser;
    } catch {
        return null;
    }
}