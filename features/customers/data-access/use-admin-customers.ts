"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listAdminCustomerResources,
  listAdminCustomers,
} from "@/features/customers/data-access/admin-customers-api";

export const adminCustomerKeys = {
  all: ["admin-customers"] as const,
  list: (query: string) => [...adminCustomerKeys.all, "list", query] as const,
  resources: (userId: string) => [...adminCustomerKeys.all, "resources", userId] as const,
};

export function useAdminCustomers(query = "") {
  const trimmed = query.trim();
  return useQuery({
    queryKey: adminCustomerKeys.list(trimmed),
    queryFn: () => listAdminCustomers(trimmed || undefined),
  });
}

export function useAdminCustomerResources(userId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: adminCustomerKeys.resources(userId ?? ""),
    queryFn: () => listAdminCustomerResources(userId!),
    enabled: enabled && !!userId,
  });
}
