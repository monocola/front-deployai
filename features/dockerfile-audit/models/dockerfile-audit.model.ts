export interface DockerfileAuditSettings {
  id: string;
  enabled: boolean;
  rulesText: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDockerfileAuditSettingsPayload {
  enabled: boolean;
  rulesText: string;
}

export function mapDockerfileAuditSettings(
  raw: DockerfileAuditSettings
): DockerfileAuditSettings {
  return {
    id: raw.id,
    enabled: !!raw.enabled,
    rulesText: raw.rulesText ?? "",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
