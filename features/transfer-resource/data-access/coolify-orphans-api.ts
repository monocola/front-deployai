import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type { AdminResource } from "@/features/dashboards/models/admin-resource.model";
import type {
  AdminCoolifyOrphanResource,
  AdminCoolifyOrphansOverview,
} from "@/features/transfer-resource/models/coolify-orphan.model";

export async function listCoolifyOrphans(
  search?: string
): Promise<AdminCoolifyOrphansOverview> {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  const qs = params.toString();
  const path = qs
    ? `${apiEndpoints.adminResources.coolifyOrphans()}?${qs}`
    : apiEndpoints.adminResources.coolifyOrphans();
  return apiClient.get(path);
}

export async function claimCoolifyOrphan(payload: {
  coolifyUuid: string;
  kind: string;
  targetUserId?: string;
  targetUserEmail?: string;
  projectId?: string;
  environmentId?: string;
}): Promise<AdminResource> {
  return apiClient.post(apiEndpoints.adminResources.claimCoolifyOrphan(), {
    coolifyUuid: payload.coolifyUuid,
    kind: payload.kind,
    targetUserId: payload.targetUserId?.trim() || null,
    targetUserEmail: payload.targetUserEmail?.trim() || null,
    projectId: payload.projectId?.trim() || null,
    environmentId: payload.environmentId?.trim() || null,
  });
}

export type { AdminCoolifyOrphanResource };
