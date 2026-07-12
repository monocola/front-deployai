export type UserRole = "USER" | "MANAGER";

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  authProvider: "LOCAL" | "GITHUB" | "GOOGLE";
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  issuedAt: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}
