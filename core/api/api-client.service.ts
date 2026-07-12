import { environment } from "@/core/config/environment";
import { handleUnauthorizedRedirect, getAccessToken } from "@/core/auth/auth-api";
import { ApiClientError, type ApiError } from "@/core/errors/api-error.model";
import type { ApiResponse } from "@/core/api/api-response.model";

type RequestOptions = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
};

function buildUrl(path: string): string {
  const base = environment.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function parseError(response: Response): Promise<ApiClientError> {
  let apiError: ApiError;
  try {
    const body = (await response.json()) as { error?: ApiError };
    apiError = body.error ?? {
      code: `HTTP_${response.status}`,
      message: response.statusText || "Request failed",
      timestamp: new Date().toISOString(),
    };
  } catch {
    apiError = {
      code: `HTTP_${response.status}`,
      message: response.statusText || "Request failed",
      timestamp: new Date().toISOString(),
    };
  }
  return new ApiClientError(response.status, apiError);
}

export class ApiClient {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, signal } = options;
    const token = getAccessToken();

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        handleUnauthorizedRedirect();
      }
      throw await parseError(response);
    }

    if (response.status === 204) return undefined as T;

    const json = (await response.json()) as ApiResponse<T> | T;
    if (json && typeof json === "object" && "data" in json) {
      return (json as ApiResponse<T>).data;
    }
    return json as T;
  }

  get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(path, { method: "GET", signal });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PUT", body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
