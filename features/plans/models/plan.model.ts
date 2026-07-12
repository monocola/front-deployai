export const PLAN_FEATURES = [
  "SSL",
  "CUSTOM_DOMAINS",
  "AUTO_DEPLOY",
  "ROLLING_DEPLOYMENTS",
  "ZERO_DOWNTIME",
  "PREVIEW_DEPLOYMENTS",
  "BACKUPS",
  "CRON_JOBS",
  "ENVIRONMENT_VARIABLES",
  "SECRETS",
  "LOGS",
  "ADVANCED_METRICS",
  "ALERTS",
  "WEBHOOKS",
  "API_ACCESS",
  "MANAGED_DATABASES",
  "VERTICAL_SCALING",
  "HORIZONTAL_SCALING",
  "TEAMS",
  "MULTI_USER",
  "PRIORITY_SUPPORT",
  "RESTART",
  "STOP",
  "HEALTH_CHECKS",
  "ROLLBACK",
] as const;

export type PlanFeatureKey = (typeof PLAN_FEATURES)[number];

export interface PlanResourceLimits {
  cpu: number;
  memoryMb: number;
  diskGb: number;
  maxApplications: number | null;
  maxDatabases: number | null;
  maxDomains: number | null;
  maxUsers: number | null;
  maxTeams: number | null;
  monthlyExecutionHours: number | null;
  sleepAfterMinutes: number | null;
  alwaysOn: boolean;
}

export interface PlanFeaturesPayload {
  features: Record<string, boolean>;
  values: Record<string, string>;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  currency: string;
  enabled: boolean;
  recommended: boolean;
  displayOrder: number;
  limits: PlanResourceLimits;
  features: PlanFeaturesPayload;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePlanPayload {
  code?: string;
  name?: string;
  description?: string | null;
  monthlyPrice?: number;
  currency?: string;
  enabled?: boolean;
  recommended?: boolean;
  displayOrder?: number;
}

export interface CreatePlanPayload {
  code: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  currency?: string;
  enabled: boolean;
  recommended: boolean;
  displayOrder: number;
}

export interface UpdatePlanLimitsPayload {
  cpu: number;
  memoryMb: number;
  diskGb: number;
  maxApplications: number | null;
  maxDatabases: number | null;
  maxDomains: number | null;
  maxUsers: number | null;
  maxTeams: number | null;
  monthlyExecutionHours: number | null;
  sleepAfterMinutes: number | null;
  alwaysOn: boolean;
}

export interface PlanFeatureEntry {
  feature: PlanFeatureKey;
  enabled: boolean;
  value: string | null;
}

export interface UpdatePlanFeaturesPayload {
  features: PlanFeatureEntry[];
}

type RawPlan = Omit<Plan, "monthlyPrice" | "features" | "description"> & {
  monthlyPrice: number | string;
  description?: string | null;
  features?: {
    features?: Record<string, boolean>;
    values?: Record<string, string>;
  };
};

export function mapPlan(raw: RawPlan): Plan {
  return {
    ...raw,
    monthlyPrice: Number(raw.monthlyPrice),
    description: raw.description ?? null,
    features: {
      features: raw.features?.features ?? {},
      values: raw.features?.values ?? {},
    },
  };
}
