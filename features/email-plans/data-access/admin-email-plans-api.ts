import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type {
  CreateEmailPlanPayload,
  EmailPlan,
  UpdateEmailPlanPayload,
} from "@/features/email-plans/models/email-plan.model";
import { mapEmailPlan } from "@/features/email-plans/models/email-plan.model";

export async function listAdminEmailPlans(): Promise<EmailPlan[]> {
  const plans = await apiClient.get<EmailPlan[]>(apiEndpoints.adminEmailPlans.list());
  return plans.map(mapEmailPlan);
}

export async function getAdminEmailPlan(planId: string): Promise<EmailPlan> {
  const plan = await apiClient.get<EmailPlan>(apiEndpoints.adminEmailPlans.get(planId));
  return mapEmailPlan(plan);
}

export async function createAdminEmailPlan(
  payload: CreateEmailPlanPayload
): Promise<EmailPlan> {
  const plan = await apiClient.post<EmailPlan>(
    apiEndpoints.adminEmailPlans.create(),
    payload
  );
  return mapEmailPlan(plan);
}

export async function updateAdminEmailPlan(
  planId: string,
  payload: UpdateEmailPlanPayload
): Promise<EmailPlan> {
  const plan = await apiClient.put<EmailPlan>(
    apiEndpoints.adminEmailPlans.update(planId),
    payload
  );
  return mapEmailPlan(plan);
}

export async function deleteAdminEmailPlan(planId: string): Promise<void> {
  await apiClient.delete(apiEndpoints.adminEmailPlans.delete(planId));
}

export async function duplicateAdminEmailPlan(planId: string): Promise<EmailPlan> {
  const plan = await apiClient.post<EmailPlan>(
    apiEndpoints.adminEmailPlans.duplicate(planId)
  );
  return mapEmailPlan(plan);
}
