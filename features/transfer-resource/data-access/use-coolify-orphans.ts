"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  claimCoolifyOrphan,
  listCoolifyOrphans,
} from "@/features/transfer-resource/data-access/coolify-orphans-api";
import { adminResourcesKeys } from "@/features/dashboards/data-access/use-admin-resources";

export const coolifyOrphansKeys = {
  all: ["admin-coolify-orphans"] as const,
  list: (search: string) => [...coolifyOrphansKeys.all, "list", search] as const,
};

export function useCoolifyOrphans(search = "") {
  return useQuery({
    queryKey: coolifyOrphansKeys.list(search),
    queryFn: () => listCoolifyOrphans(search || undefined),
  });
}

export function useClaimCoolifyOrphan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimCoolifyOrphan,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coolifyOrphansKeys.all });
      void queryClient.invalidateQueries({ queryKey: adminResourcesKeys.all });
    },
  });
}
