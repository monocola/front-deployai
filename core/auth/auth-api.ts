import { environment } from "@/core/config/environment";
import type { AuthResponse, AuthUser, LoginRequest } from "@/core/auth/auth.model";
import type { ApiResponse } from "@/core/api/api-response.model";

const AUTH_BASE = `${environment.apiBaseUrl}/auth`;
const TOKEN_KEY = "admin_token";
const REFRESH_KEY = "admin_refresh_token";
const USER_KEY = "admin_user";

async function parseAuthResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      body?.error?.message ?? response.statusText ?? "Authentication failed";
    throw new Error(message);
  }
  const json = (await response.json()) as ApiResponse<T>;
  return json.data;
}

export async function adminLogin(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(request),
  });
  return parseAuthResponse<AuthResponse>(response);
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const token = getAccessToken();
  const response = await fetch(`${AUTH_BASE}/me`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return parseAuthResponse<AuthUser>(response);
}

export function persistAuthSession(auth: AuthResponse): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, auth.accessToken);
  sessionStorage.setItem(REFRESH_KEY, auth.refreshToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isManagerAuthenticated(): boolean {
  const user = getStoredUser();
  return !!getAccessToken() && user?.role === "MANAGER";
}

export function handleUnauthorizedRedirect(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  clearAuthSession();
  window.location.assign("/login");
}
