"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

type RefreshResponse = {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
};

type Props = {
    children: ReactNode;
};

let refreshPromise: Promise<string> | null = null;

function getToken() {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("token");
}

function getRefreshToken() {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("refreshToken");
}

function setTokens(data: RefreshResponse) {
    const nextToken = data.token || data.accessToken;
    const nextRefreshToken = data.refreshToken;

    if (nextToken) {
        localStorage.setItem("token", nextToken);
    }

    if (nextRefreshToken) {
        localStorage.setItem("refreshToken", nextRefreshToken);
    }

    return nextToken;
}

function clearAuthStorage() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
}

function shouldRefresh(status: number) {
    return status === 401;
}

function isAuthApiPath(pathname: string) {
    return pathname === "/api/auth/login" || pathname === "/api/auth/refresh";
}

function getRequestPath(input: RequestInfo | URL) {
    if (typeof window === "undefined") return "";

    try {
        const url =
            typeof input === "string"
                ? new URL(input, window.location.origin)
                : input instanceof URL
                    ? input
                    : new URL(input.url, window.location.origin);

        if (url.origin !== window.location.origin) {
            return "";
        }

        return url.pathname;
    } catch {
        return "";
    }
}

function shouldIntercept(input: RequestInfo | URL) {
    const pathname = getRequestPath(input);

    if (!pathname.startsWith("/api/")) return false;
    if (isAuthApiPath(pathname)) return false;

    return true;
}

function redirectToLogin() {
    if (typeof window === "undefined") return;

    clearAuthStorage();

    const currentPath = `${window.location.pathname}${window.location.search}`;
    const loginPath = "/landing/login";

    if (window.location.pathname === loginPath) return;

    window.location.href = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`;
}

function buildInitWithAuth(
    input: RequestInfo | URL,
    init: RequestInit | undefined,
    token: string | null
): RequestInit {
    const requestHeaders = input instanceof Request ? input.headers : undefined;

    const headers = new Headers(requestHeaders);
    const initHeaders = new Headers(init?.headers);

    initHeaders.forEach((value, key) => {
        headers.set(key, value);
    });

    const body = init?.body ?? null;
    const isFormData =
        typeof FormData !== "undefined" && body instanceof FormData;

    if (body && !isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return {
        ...init,
        headers,
        cache: init?.cache ?? "no-store",
    };
}

async function refreshAccessToken(originalFetch: typeof window.fetch) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error("Missing refresh token");
    }

    const response = await originalFetch("/api/auth/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refreshToken,
        }),
        cache: "no-store",
    });

    const result: RefreshResponse | null = await response
        .json()
        .catch(() => null);

    if (!response.ok) {
        throw new Error(result?.message || "Refresh token failed");
    }

    const nextToken = setTokens(result || {});

    if (!nextToken) {
        throw new Error("Refresh success but token not found");
    }

    return nextToken;
}

function getRefreshedTokenOnce(originalFetch: typeof window.fetch) {
    if (!refreshPromise) {
        refreshPromise = refreshAccessToken(originalFetch).finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

function ApiFetchProvider({ children }: Props) {
    useEffect(() => {
        const originalFetch = window.fetch.bind(window);

        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            if (!shouldIntercept(input)) {
                return originalFetch(input, init);
            }

            const currentToken = getToken();

            const firstResponse = await originalFetch(
                input,
                buildInitWithAuth(input, init, currentToken)
            );

            if (!shouldRefresh(firstResponse.status)) {
                return firstResponse;
            }

            try {
                const nextToken = await getRefreshedTokenOnce(originalFetch);

                const retryResponse = await originalFetch(
                    input,
                    buildInitWithAuth(input, init, nextToken)
                );

                if (shouldRefresh(retryResponse.status)) {
                    redirectToLogin();
                }

                return retryResponse;
            } catch (error) {
                console.error("REFRESH_TOKEN_RETRY_FAILED:", error);

                redirectToLogin();

                return firstResponse;
            }
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    return <>{children}</>;
}

export default ApiFetchProvider;