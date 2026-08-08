import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminDatabasePlan,
  deleteAdminDatabasePlan,
  duplicateAdminDatabasePlan,
  getAdminDatabasePlan,
  listAdminDatabasePlans,
  updateAdminDatabasePlan,
} from "@/features/database-plans/data-access/admin-database-plans-api";
import type {
  CreateDatabasePlanPayload,
  UpdateDatabasePlanPayload,
} from "@/features/database-plans/models/database-plan.model";

export const adminDatabasePlanKeys = {
  all: ["admin-database-plans"] as const,
  list: () => [...adminDatabasePlanKeys.all, "list"] as const,
  detail: (planId: string) => [...adminDatabasePlanKeys.all, "detail", planId] as const,
};

export function useAdminDatabasePlans() {
  return useQuery({
    queryKey: adminDatabasePlanKeys.list(),
    queryFn: listAdminDatabasePlans,
  });
}

export function useAdminDatabasePlan(planId: string) {
  return useQuery({
    queryKey: adminDatabasePlanKeys.detail(planId),
    queryFn: () => getAdminDatabasePlan(planId),
    enabled: !!planId && planId !== "new",
  });
}

export function useCreateAdminDatabasePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDatabasePlanPayload) => createAdminDatabasePlan(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminDatabasePlanKeys.all }),
  });
}

export function useUpdateAdminDatabasePlan(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDatabasePlanPayload) =>
      updateAdminDatabasePlan(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminDatabasePlanKeys.all });
      queryClient.invalidateQueries({ queryKey: adminDatabasePlanKeys.detail(planId) });
    },
  });
}

export function useDeleteAdminDatabasePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => deleteAdminDatabasePlan(planId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminDatabasePlanKeys.all }),
  });
}

export function useDuplicateAdminDatabasePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => duplicateAdminDatabasePlan(planId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminDatabasePlanKeys.all }),
  });
}
