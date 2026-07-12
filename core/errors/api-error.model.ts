export interface ApiError {
  code: string;
  message: string;
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
  if (error instanceof ApiClientError) return error.apiError.message;
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}
