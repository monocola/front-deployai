import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import {
  mapDockerfileAuditSettings,
  type DockerfileAuditSettings,
  type UpdateDockerfileAuditSettingsPayload,
} from "@/features/dockerfile-audit/models/dockerfile-audit.model";

export async function getDockerfileAuditSettings(): Promise<DockerfileAuditSettings> {
  const raw = await apiClient.get<DockerfileAuditSettings>(
    apiEndpoints.adminDockerfileAudit.get()
  );
  return mapDockerfileAuditSettings(raw);
}

export async function updateDockerfileAuditSettings(
  payload: UpdateDockerfileAuditSettingsPayload
): Promise<DockerfileAuditSettings> {
  const raw = await apiClient.put<DockerfileAuditSettings>(
    apiEndpoints.adminDockerfileAudit.update(),
    payload
  );
  return mapDockerfileAuditSettings(raw);
}
