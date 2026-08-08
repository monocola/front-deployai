import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type {
  CreateDatabasePlanPayload,
  DatabasePlan,
  UpdateDatabasePlanPayload,
} from "@/features/database-plans/models/database-plan.model";
import { mapDatabasePlan } from "@/features/database-plans/models/database-plan.model";

export async function listAdminDatabasePlans(): Promise<DatabasePlan[]> {
  const plans = await apiClient.get<DatabasePlan[]>(apiEndpoints.adminDatabasePlans.list());
  return plans.map(mapDatabasePlan);
}

export async function getAdminDatabasePlan(planId: string): Promise<DatabasePlan> {
  const plan = await apiClient.get<DatabasePlan>(apiEndpoints.adminDatabasePlans.get(planId));
  return mapDatabasePlan(plan);
}

export async function createAdminDatabasePlan(
  payload: CreateDatabasePlanPayload
): Promise<DatabasePlan> {
  const plan = await apiClient.post<DatabasePlan>(
    apiEndpoints.adminDatabasePlans.create(),
    payload
  );
  return mapDatabasePlan(plan);
}

export async function updateAdminDatabasePlan(
  planId: string,
  payload: UpdateDatabasePlanPayload
): Promise<DatabasePlan> {
  const plan = await apiClient.put<DatabasePlan>(
    apiEndpoints.adminDatabasePlans.update(planId),
    payload
  );
  return mapDatabasePlan(plan);
}

export async function deleteAdminDatabasePlan(planId: string): Promise<void> {
  await apiClient.delete(apiEndpoints.adminDatabasePlans.delete(planId));
}

export async function duplicateAdminDatabasePlan(planId: string): Promise<DatabasePlan> {
  const plan = await apiClient.post<DatabasePlan>(
    apiEndpoints.adminDatabasePlans.duplicate(planId)
  );
  return mapDatabasePlan(plan);
}
