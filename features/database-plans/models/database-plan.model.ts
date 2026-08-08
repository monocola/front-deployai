export interface DatabasePlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceCentsMonthly: number;
  currency: string;
  limitsMemory: string;
  limitsCpus: string;
  storageGb: number;
  maxConnections: number;
  backupsEnabled: boolean;
  backupFrequency: string;
  enabled: boolean;
  recommended: boolean;
  displayOrder: number;
}

export interface CreateDatabasePlanPayload {
  code: string;
  name: string;
  description?: string | null;
  priceCentsMonthly: number;
  currency: string;
  limitsMemory: string;
  limitsCpus: string;
  storageGb: number;
  maxConnections: number;
  backupsEnabled: boolean;
  backupFrequency: string;
  enabled: boolean;
  recommended: boolean;
  displayOrder: number;
}

export type UpdateDatabasePlanPayload = Partial<CreateDatabasePlanPayload>;

export function mapDatabasePlan(raw: DatabasePlan): DatabasePlan {
  return {
    ...raw,
    description: raw.description ?? null,
    currency: raw.currency || "USD",
    backupFrequency: raw.backupFrequency || "none",
  };
}

export function formatDatabasePlanPrice(cents: number, currency = "USD"): string {
  if (cents <= 0) return `$0 ${currency}`;
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)} ${currency}`;
}
