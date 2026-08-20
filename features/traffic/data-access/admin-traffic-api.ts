import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type { AdminApplicationTrafficOverview } from "@/features/traffic/models/admin-traffic.model";

export async function listAdminApplicationTraffic(
  search?: string
): Promise<AdminApplicationTrafficOverview> {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  const qs = params.toString();
  const path = qs
    ? `${apiEndpoints.adminResources.traffic()}?${qs}`
    : apiEndpoints.adminResources.traffic();
  return apiClient.get(path);
}
