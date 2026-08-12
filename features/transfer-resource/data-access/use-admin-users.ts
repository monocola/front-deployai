"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listAdminUserProjects,
  searchAdminUsers,
} from "@/features/transfer-resource/data-access/admin-users-api";

export const adminUsersKeys = {
  all: ["admin-users"] as const,
  search: (query: string) => [...adminUsersKeys.all, "search", query] as const,
  projects: (userId: string) => [...adminUsersKeys.all, "projects", userId] as const,
};

export function useAdminUserSearch(query: string, enabled: boolean) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: adminUsersKeys.search(trimmed),
    queryFn: () => searchAdminUsers(trimmed),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30_000,
  });
}

export function useAdminUserProjects(userId: string | null | undefined, enabled: boolean) {
  const id = userId?.trim() ?? "";
  return useQuery({
    queryKey: adminUsersKeys.projects(id),
    queryFn: () => listAdminUserProjects(id),
    enabled: enabled && id.length > 0,
    staleTime: 30_000,
  });
}
