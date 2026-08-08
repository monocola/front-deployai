"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  blockAdminResource,
  listAdminResourcesOverview,
  unblockAdminResource,
} from "@/features/dashboards/data-access/admin-resources-api";
import type { AdminResourcesFilters } from "@/features/dashboards/models/admin-resource.model";

export const adminResourcesKeys = {
  all: ["admin-resources"] as const,
  overview: (filters: AdminResourcesFilters) =>
    [
      ...adminResourcesKeys.all,
      "overview",
      filters.search ?? "",
      filters.userId ?? "",
      filters.planCode ?? "",
      filters.createdWithin ?? "",
    ] as const,
};

export function useAdminResourcesOverview(filters: AdminResourcesFilters = {}) {
  return useQuery({
    queryKey: adminResourcesKeys.overview(filters),
    queryFn: () => listAdminResourcesOverview(filters),
  });
}

export function useBlockAdminResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceId, reason }: { resourceId: string; reason?: string }) =>
      blockAdminResource(resourceId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminResourcesKeys.all });
    },
  });
}

export function useUnblockAdminResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) => unblockAdminResource(resourceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminResourcesKeys.all });
    },
  });
}
