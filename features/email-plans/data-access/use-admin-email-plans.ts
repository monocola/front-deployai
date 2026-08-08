import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminEmailPlan,
  deleteAdminEmailPlan,
  duplicateAdminEmailPlan,
  getAdminEmailPlan,
  listAdminEmailPlans,
  updateAdminEmailPlan,
} from "@/features/email-plans/data-access/admin-email-plans-api";
import type {
  CreateEmailPlanPayload,
  UpdateEmailPlanPayload,
} from "@/features/email-plans/models/email-plan.model";

export const adminEmailPlanKeys = {
  all: ["admin-email-plans"] as const,
  list: () => [...adminEmailPlanKeys.all, "list"] as const,
  detail: (planId: string) => [...adminEmailPlanKeys.all, "detail", planId] as const,
};

export function useAdminEmailPlans() {
  return useQuery({
    queryKey: adminEmailPlanKeys.list(),
    queryFn: listAdminEmailPlans,
  });
}

export function useAdminEmailPlan(planId: string) {
  return useQuery({
    queryKey: adminEmailPlanKeys.detail(planId),
    queryFn: () => getAdminEmailPlan(planId),
    enabled: !!planId && planId !== "new",
  });
}

export function useCreateAdminEmailPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmailPlanPayload) => createAdminEmailPlan(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminEmailPlanKeys.all }),
  });
}

export function useUpdateAdminEmailPlan(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEmailPlanPayload) =>
      updateAdminEmailPlan(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminEmailPlanKeys.all });
      queryClient.invalidateQueries({ queryKey: adminEmailPlanKeys.detail(planId) });
    },
  });
}

export function useDeleteAdminEmailPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => deleteAdminEmailPlan(planId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminEmailPlanKeys.all }),
  });
}

export function useDuplicateAdminEmailPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => duplicateAdminEmailPlan(planId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminEmailPlanKeys.all }),
  });
}
