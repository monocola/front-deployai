import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type {
  CreatePlanPayload,
  Plan,
  UpdatePlanFeaturesPayload,
  UpdatePlanLimitsPayload,
  UpdatePlanPayload,
} from "@/features/plans/models/plan.model";
import { mapPlan } from "@/features/plans/models/plan.model";

export async function listAdminPlans(): Promise<Plan[]> {
  const plans = await apiClient.get<Plan[]>(apiEndpoints.adminPlans.list());
  return plans.map((plan) => mapPlan(plan));
}

export async function getAdminPlan(planId: string): Promise<Plan> {
  const plan = await apiClient.get<Plan>(apiEndpoints.adminPlans.get(planId));
  return mapPlan(plan);
}

export async function createAdminPlan(payload: CreatePlanPayload): Promise<Plan> {
  const plan = await apiClient.post<Plan>(apiEndpoints.adminPlans.create(), payload);
  return mapPlan(plan);
}

export async function updateAdminPlan(planId: string, payload: UpdatePlanPayload): Promise<Plan> {
  const plan = await apiClient.put<Plan>(apiEndpoints.adminPlans.update(planId), payload);
  return mapPlan(plan);
}

export async function updateAdminPlanLimits(
  planId: string,
  payload: UpdatePlanLimitsPayload
): Promise<Plan> {
  const plan = await apiClient.put<Plan>(apiEndpoints.adminPlans.limits(planId), payload);
  return mapPlan(plan);
}

export async function updateAdminPlanFeatures(
  planId: string,
  payload: UpdatePlanFeaturesPayload
): Promise<Plan> {
  const plan = await apiClient.put<Plan>(apiEndpoints.adminPlans.features(planId), payload);
  return mapPlan(plan);
}

export async function deleteAdminPlan(planId: string): Promise<void> {
  await apiClient.delete(apiEndpoints.adminPlans.delete(planId));
}

export async function duplicateAdminPlan(planId: string): Promise<Plan> {
  const plan = await apiClient.post<Plan>(apiEndpoints.adminPlans.duplicate(planId));
  return mapPlan(plan);
}
