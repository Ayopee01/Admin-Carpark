import type { ApiErrorResponse, Permission } from "@/src/app/type/common";
import type { RefreshResponse } from "@/src/app/type/auth/auth";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: ApiErrorResponse | null = null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ForbiddenError extends ApiError {
  readonly requiredPermission?: Permission;
  readonly yourPermissions?: Permission[];

  constructor(data: ApiErrorResponse | null) {
    super(data?.message || "Forbidden", 403, data);
    this.name = "ForbiddenError";
    this.requiredPermission = data?.requiredPermission;
    this.yourPermissions = data?.yourPermissions;
  }
}

let refreshPromise: Promise<string> | null = null;

function getStoredToken(key: "token" | "refreshToken") {
  return typeof window === "undefined" ? null : localStorage.getItem(key);
}

function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const currentPath = `${window.location.pathname}${window.location.search}`;
  clearAuth();
  if (window.location.pathname !== "/landing/login") {
    window.location.assign(`/landing/login?redirect=${encodeURIComponent(currentPath)}`);
  }
}

async function parseJson(response: Response) {
  if (response.status === 204) return null;
  return response.json().catch(() => null) as Promise<unknown>;
}

async function refreshAccessToken() {
  const refreshToken = getStoredToken("refreshToken");
  if (!refreshToken) throw new Error("Missing refresh token");

  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  const data = (await parseJson(response)) as RefreshResponse | null;

  if (!response.ok || !data?.token) {
    throw new Error("Refresh token failed");
  }

  localStorage.setItem("token", data.token);
  if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
  return data.token;
}

function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function buildHeaders(options: RequestInit, token: string | null) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function request(path: string, options: RequestInit, retry: boolean) {
  const response = await fetch(path, {
    ...options,
    headers: buildHeaders(options, getStoredToken("token")),
    cache: options.cache ?? "no-store",
  });

  if (response.status === 401 && retry) {
    try {
      const token = await refreshOnce();
      return fetch(path, {
        ...options,
        headers: buildHeaders(options, token),
        cache: options.cache ?? "no-store",
      });
    } catch {
      redirectToLogin();
    }
  }

  return response;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await request(path, options, true);
  const data = await parseJson(response);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;
    if (response.status === 401) redirectToLogin();
    if (response.status === 403) throw new ForbiddenError(errorData);
    throw new ApiError(errorData?.message || "API request failed", response.status, errorData);
  }

  return data as T;
}
