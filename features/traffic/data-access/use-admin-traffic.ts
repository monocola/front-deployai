"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminApplicationTraffic } from "@/features/traffic/data-access/admin-traffic-api";

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
