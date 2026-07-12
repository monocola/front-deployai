export const environment = {
  production: process.env.NODE_ENV === "production",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1",
} as const;
