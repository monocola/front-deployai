import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDockerfileAuditSettings,
  updateDockerfileAuditSettings,
} from "@/features/dockerfile-audit/data-access/admin-dockerfile-audit-api";
import type { UpdateDockerfileAuditSettingsPayload } from "@/features/dockerfile-audit/models/dockerfile-audit.model";

export const adminDockerfileAuditKeys = {
  all: ["admin-dockerfile-audit"] as const,
  settings: () => [...adminDockerfileAuditKeys.all, "settings"] as const,
};

export function useDockerfileAuditSettings() {
  return useQuery({
    queryKey: adminDockerfileAuditKeys.settings(),
    queryFn: getDockerfileAuditSettings,
  });
}

export function useUpdateDockerfileAuditSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDockerfileAuditSettingsPayload) =>
      updateDockerfileAuditSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(adminDockerfileAuditKeys.settings(), data);
    },
  });
}
