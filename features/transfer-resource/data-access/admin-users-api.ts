import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type { AdminUserOption } from "@/features/transfer-resource/models/admin-user.model";
import type { AdminUserProject } from "@/features/transfer-resource/models/admin-user-project.model";

export async function searchAdminUsers(query: string): Promise<AdminUserOption[]> {
  const q = query.trim();
  const search = new URLSearchParams();
  search.set("q", q);
  return apiClient.get(`${apiEndpoints.adminUsers.search()}?${search.toString()}`);
}

export async function listAdminUserProjects(userId: string): Promise<AdminUserProject[]> {
  return apiClient.get(apiEndpoints.adminUsers.projects(userId));
}
