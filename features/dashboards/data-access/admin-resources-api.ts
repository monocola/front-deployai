import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type {
  AdminResource,
  AdminResourcesFilters,
  AdminResourcesOverview,
} from "@/features/dashboards/models/admin-resource.model";

export async function listAdminResourcesOverview(
  params?: AdminResourcesFilters
): Promise<AdminResourcesOverview> {
  const search = new URLSearchParams();
  if (params?.search) search.set("search", params.search);
  if (params?.userId) search.set("userId", params.userId);
  if (params?.planCode) search.set("planCode", params.planCode);
  if (params?.createdWithin) search.set("createdWithin", params.createdWithin);
  const qs = search.toString();
  const path = qs
    ? `${apiEndpoints.adminResources.overview()}?${qs}`
    : apiEndpoints.adminResources.overview();
  return apiClient.get(path);
}

export async function blockAdminResource(
  resourceId: string,
  reason?: string
): Promise<AdminResource> {
  return apiClient.post(apiEndpoints.adminResources.block(resourceId), {
    reason: reason?.trim() || null,
  });
}

export async function unblockAdminResource(
  resourceId: string
): Promise<AdminResource> {
  return apiClient.post(apiEndpoints.adminResources.unblock(resourceId));
}
