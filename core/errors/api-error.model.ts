export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
  timestamp: string;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly apiError: ApiError;

  constructor(status: number, apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiClientError";
    this.status = status;
    this.apiError = apiError;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    const details = error.apiError.details;
    if (details && typeof details === "object") {
      const parts = Object.entries(details)
        .map(([field, message]) => `${field}: ${String(message)}`)
        .filter(Boolean);
      if (parts.length > 0) {
        return `${error.apiError.message} (${parts.join("; ")})`;
      }
    }
    return error.apiError.message;
  }
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}
