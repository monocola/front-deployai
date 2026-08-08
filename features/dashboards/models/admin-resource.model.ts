export interface AdminResource {
  id: string;
  name: string;
  kind: string;
  framework: string | null;
  databaseEngine: string | null;
  status: string;
  blocked: boolean;
  blockedAt: string | null;
  blockedReason: string | null;
  planCode: string | null;
  planName: string | null;
  cpu: number | null;
  memoryMb: number | null;
  primaryDomain: string | null;
  projectId: string;
  projectName: string;
  environmentId: string | null;
  environmentName: string | null;
  userId: string | null;
  userEmail: string | null;
  userDisplayName: string | null;
  companyName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminResourceUserOption {
  id: string;
  email: string;
  displayName: string;
}

export interface AdminResourcePlanOption {
  code: string;
  name: string;
  kind: string;
}

export type CreatedWithinFilter = "" | "1d" | "7d" | "30d";

export interface AdminResourcesOverview {
  applications: AdminResource[];
  databases: AdminResource[];
  totalApplications: number;
  totalDatabases: number;
  users: AdminResourceUserOption[];
  plans: AdminResourcePlanOption[];
}

export interface AdminResourcesFilters {
  search?: string;
  userId?: string;
  planCode?: string;
  createdWithin?: CreatedWithinFilter;
}
