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

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!text) return null;

  if (contentType.includes("application/json") || text.trimStart().startsWith("{") || text.trimStart().startsWith("[")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new ApiClientError(response.status || 502, {
        code: "INVALID_JSON",
        message: "La API devolvió una respuesta inválida",
        timestamp: new Date().toISOString(),
      });
    }
  }

  if (text.includes("<!DOCTYPE") || text.includes("<html")) {
    throw new ApiClientError(response.status || 502, {
      code: "HTML_RESPONSE",
      message:
        response.status === 401 || response.status === 403
          ? "Sesión expirada o sin permisos. Vuelve a iniciar sesión."
          : "El backend no respondió JSON. ¿Está corriendo en el puerto 8080?",
      timestamp: new Date().toISOString(),
    });
  }

  throw new ApiClientError(response.status || 502, {
    code: `HTTP_${response.status || 502}`,
    message: text.slice(0, 200) || response.statusText || "Request failed",
    timestamp: new Date().toISOString(),
  });
}

async function parseError(response: Response): Promise<ApiClientError> {
  try {
    const body = await readResponseBody(response);
    if (body && typeof body === "object" && "error" in body) {
      const apiError = (body as { error?: ApiError }).error;
      if (apiError) {
        return new ApiClientError(response.status, apiError);
      }
    }
  } catch (error) {
    if (error instanceof ApiClientError) return error;
  }

  return new ApiClientError(response.status, {
    code: `HTTP_${response.status}`,
    message: response.statusText || "Request failed",
    timestamp: new Date().toISOString(),
  });
}

function unwrapData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiResponse<T>).data;
  }
  return json as T;
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
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      handleUnauthorizedRedirect();
      throw new ApiClientError(401, {
        code: "UNAUTHORIZED",
        message: "Sesión expirada o sin permisos. Vuelve a iniciar sesión.",
        timestamp: new Date().toISOString(),
      });
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        handleUnauthorizedRedirect();
      }
      throw await parseError(response);
    }

    if (response.status === 204) return undefined as T;

    const json = await readResponseBody(response);
    return unwrapData<T>(json);
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

  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    const token = getAccessToken();
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(buildUrl(path), {
      method: "POST",
      headers,
      body: formData,
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      handleUnauthorizedRedirect();
      throw new ApiClientError(401, {
        code: "UNAUTHORIZED",
        message: "Sesión expirada o sin permisos. Vuelve a iniciar sesión.",
        timestamp: new Date().toISOString(),
      });
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        handleUnauthorizedRedirect();
      }
      throw await parseError(response);
    }

    const json = await readResponseBody(response);
    return unwrapData<T>(json);
  }

  async downloadBlob(path: string): Promise<{ blob: Blob; fileName: string | null }> {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(buildUrl(path), {
      method: "GET",
      headers,
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      handleUnauthorizedRedirect();
      throw new ApiClientError(401, {
        code: "UNAUTHORIZED",
        message: "Sesión expirada o sin permisos. Vuelve a iniciar sesión.",
        timestamp: new Date().toISOString(),
      });
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        handleUnauthorizedRedirect();
      }
      throw await parseError(response);
    }

    const disposition = response.headers.get("Content-Disposition");
    let fileName: string | null = null;
    if (disposition) {
      const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
      const plainMatch = /filename="?([^";]+)"?/i.exec(disposition);
      if (utfMatch?.[1]) fileName = decodeURIComponent(utfMatch[1]);
      else if (plainMatch?.[1]) fileName = plainMatch[1];
    }

    return { blob: await response.blob(), fileName };
  }
}

export const apiClient = new ApiClient();
