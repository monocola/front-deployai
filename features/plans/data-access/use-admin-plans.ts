import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminPlan,
  deleteAdminPlan,
  duplicateAdminPlan,
  getAdminPlan,
  listAdminPlans,
  updateAdminPlan,
  updateAdminPlanFeatures,
  updateAdminPlanLimits,
} from "@/features/plans/data-access/admin-plans-api";
import type {
  CreatePlanPayload,
  UpdatePlanFeaturesPayload,
  UpdatePlanLimitsPayload,
  UpdatePlanPayload,
} from "@/features/plans/models/plan.model";

export const adminPlanKeys = {
  all: ["admin-plans"] as const,
  list: () => [...adminPlanKeys.all, "list"] as const,
  detail: (planId: string) => [...adminPlanKeys.all, "detail", planId] as const,
};

export function useAdminPlans() {
  return useQuery({
    queryKey: adminPlanKeys.list(),
    queryFn: listAdminPlans,
  });
}

export function useAdminPlan(planId: string) {
  return useQuery({
    queryKey: adminPlanKeys.detail(planId),
    queryFn: () => getAdminPlan(planId),
    enabled: !!planId,
  });
}

export function useCreateAdminPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => createAdminPlan(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPlanKeys.all }),
  });
}

export function useUpdateAdminPlan(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePlanPayload) => updateAdminPlan(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.detail(planId) });
    },
  });
}

export function useUpdateAdminPlanLimits(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePlanLimitsPayload) => updateAdminPlanLimits(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.detail(planId) });
    },
  });
}

export function useUpdateAdminPlanFeatures(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePlanFeaturesPayload) =>
      updateAdminPlanFeatures(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.detail(planId) });
    },
  });
}

export function useDeleteAdminPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => deleteAdminPlan(planId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPlanKeys.all }),
  });
}

export function useDuplicateAdminPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => duplicateAdminPlan(planId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminPlanKeys.all }),
  });
}
