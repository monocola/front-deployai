"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/core/errors/api-error.model";
import {
  useDockerfileAuditSettings,
  useUpdateDockerfileAuditSettings,
} from "@/features/dockerfile-audit/data-access/use-admin-dockerfile-audit";

export function DockerfileAuditPage() {
  const { data, isLoading, error } = useDockerfileAuditSettings();
  const updateSettings = useUpdateDockerfileAuditSettings();

  const [enabled, setEnabled] = useState(true);
  const [rulesText, setRulesText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setEnabled(data.enabled);
    setRulesText(data.rulesText);
  }, [data]);

  const dirty =
    !!data &&
    (enabled !== data.enabled || rulesText.trim() !== data.rulesText.trim());

  const onSave = async () => {
    const trimmed = rulesText.trim();
    if (!trimmed) {
      setFormError("Las reglas de auditoría no pueden estar vacías.");
      return;
    }
    try {
      setFormError(null);
      await updateSettings.mutateAsync({ enabled, rulesText: trimmed });
      setMessage(
        enabled
          ? "Auditoría activa. Los cambios aplican en portal y MCP."
          : "Auditoría desactivada. Los despliegues no validarán Dockerfile."
      );
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        {error ? getErrorMessage(error) : "No se pudo cargar la configuración de auditoría"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Auditoría</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Controla la validación de seguridad de Dockerfiles en despliegues del
            portal y MCP. El texto se envía a DeepSeek como reglas del auditor.
          </p>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          {message}
        </p>
      ) : null}
      {formError ? (
        <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {formError}
        </p>
      ) : null}

      <div className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Validación de Dockerfile
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Si está desactivada, create/deploy (portal y MCP) no ejecutan la
              auditoría de seguridad.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-3">
            <span className="text-xs font-medium text-muted">
              {enabled ? "Activada" : "Desactivada"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled((v) => !v)}
              className={
                enabled
                  ? "relative h-6 w-11 rounded-full bg-primary transition-colors"
                  : "relative h-6 w-11 rounded-full bg-card-elevated ring-1 ring-inset ring-border transition-colors"
              }
            >
              <span
                className={
                  enabled
                    ? "absolute left-6 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                    : "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-muted-foreground/40 shadow transition-all"
                }
              />
            </button>
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="audit-rules" className="text-sm font-medium text-foreground">
            Reglas textuales de auditoría
          </label>
          <p className="text-xs text-muted">
            Prompt del sistema usado en cada análisis. Incluye el formato JSON de
            respuesta esperado.
          </p>
          <textarea
            id="audit-rules"
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            rows={16}
            spellCheck={false}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-[12px] leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <p className="text-[11px] text-muted">
            Última actualización:{" "}
            {data.updatedAt
              ? new Date(data.updatedAt).toLocaleString("es-PE")
              : "—"}
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
          <Button
            type="button"
            onClick={onSave}
            disabled={updateSettings.isPending || !dirty}
          >
            {updateSettings.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
