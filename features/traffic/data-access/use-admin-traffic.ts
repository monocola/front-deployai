"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAdminApplicationTraffic,
  setAdminApplicationAutoStop,
} from "@/features/traffic/data-access/admin-traffic-api";
import type { AdminApplicationTrafficOverview } from "@/features/traffic/models/admin-traffic.model";

export const adminTrafficKeys = {
  all: ["admin-traffic"] as const,
  list: (search: string) => [...adminTrafficKeys.all, search] as const,
};

export function useAdminApplicationTraffic(search = "") {
  return useQuery({
    queryKey: adminTrafficKeys.list(search),
    queryFn: () => listAdminApplicationTraffic(search),
    refetchInterval: 20_000,
  });
}

export function useSetAdminApplicationAutoStop(search = "") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceId, enabled }: { resourceId: string; enabled: boolean }) =>
      setAdminApplicationAutoStop(resourceId, enabled),
    onSuccess: (result) => {
      queryClient.setQueriesData(
        { queryKey: adminTrafficKeys.all },
        (current: AdminApplicationTrafficOverview | undefined) => {
          if (!current) return current;
          return {
            ...current,
            applications: current.applications.map((item) =>
              item.id === result.resourceId
                ? {
                    ...item,
                    autoStopEnabled: result.autoStopEnabled,
                    autoStopEligible: result.autoStopEligible,
                    sleepAfterMinutes: result.sleepAfterMinutes,
                  }
                : item
            ),
          };
        }
      );
      void queryClient.invalidateQueries({ queryKey: adminTrafficKeys.list(search) });
    },
  });
}
