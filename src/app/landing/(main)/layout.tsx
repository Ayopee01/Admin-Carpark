"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/src/app/components/Sidebar";
import ForbiddenState from "@/src/app/components/ForbiddenState";
import { apiRequest, ForbiddenError } from "@/src/app/lib/api/apiClient";
import { hasAnyPermission } from "@/src/app/lib/permissions";
import type { MeResponse, User } from "@/src/app/type/auth/auth";
import type { Permission } from "@/src/app/type/common";

const ROUTE_PERMISSIONS: Array<{ prefix: string; permissions: Permission[] }> = [
    { prefix: "/landing/dashboard", permissions: ["dashboard"] },
    { prefix: "/landing/check-payment", permissions: ["transactions"] },
    { prefix: "/landing/summary", permissions: ["overview"] },
    { prefix: "/landing/member", permissions: ["settings"] },
    { prefix: "/landing/device", permissions: ["devices", "pricing", "theme"] },
    { prefix: "/landing/system", permissions: ["settings"] },
];

function MainLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [forbiddenPermission, setForbiddenPermission] = useState<Permission>();

    useEffect(() => {
        let cancelled = false;

        async function initializeAuth() {
            const token = localStorage.getItem("token");
            if (!token) {
                router.replace("/landing/login");
                return;
            }

            try {
                const response = await apiRequest<MeResponse>("/api/auth/me");
                if (cancelled) return;
                localStorage.setItem("user", JSON.stringify(response.user));
                setUser(response.user);
            } catch (error) {
                if (cancelled) return;
                if (error instanceof ForbiddenError) {
                    setForbiddenPermission(error.requiredPermission);
                }
                const stored = localStorage.getItem("user");
                if (stored) {
                    try {
                        setUser(JSON.parse(stored) as User);
                    } catch {
                        router.replace("/landing/login");
                        return;
                    }
                }
            } finally {
                if (!cancelled) setReady(true);
            }
        }

        void initializeAuth();
        return () => {
            cancelled = true;
        };
    }, [router]);

    useEffect(() => {
        function handleForbidden(event: Event) {
            const detail = (event as CustomEvent<{ requiredPermission?: Permission }>).detail;
            setForbiddenPermission(detail?.requiredPermission);
        }
        window.addEventListener("api-forbidden", handleForbidden);
        return () => window.removeEventListener("api-forbidden", handleForbidden);
    }, []);

    const routePermission = useMemo(
        () => ROUTE_PERMISSIONS.find((item) => pathname.startsWith(item.prefix)),
        [pathname]
    );

    const canAccess = !routePermission || hasAnyPermission(user, routePermission.permissions);

    if (!ready) {
        return null;
    }

    if (!canAccess || forbiddenPermission) {
        return <ForbiddenState requiredPermission={forbiddenPermission ?? routePermission?.permissions[0]} />;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}

export default MainLayout;
