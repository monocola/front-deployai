"use client";

import { useEffect, useState } from "react";
import {
  AppWindow,
  Building2,
  Clock,
  Cpu,
  Database,
  Globe,
  Loader2,
  Lock,
  LockOpen,
  Mail,
  ShieldAlert,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getErrorMessage } from "@/core/errors/api-error.model";
import {
  useAdminResourcesOverview,
  useBlockAdminResource,
  useUnblockAdminResource,
} from "@/features/dashboards/data-access/use-admin-resources";
import type {
  AdminResource,
  CreatedWithinFilter,
} from "@/features/dashboards/models/admin-resource.model";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
);

const CREATED_WITHIN_OPTIONS: Array<{ value: CreatedWithinFilter; label: string }> = [
  { value: "", label: "Cualquier fecha" },
  { value: "1d", label: "Últimas 24 horas" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
];

const DEFAULT_BLOCK_REASON = "Pago del mes pendiente";

type ConfirmAction =
  | { type: "block"; resource: AdminResource }
  | { type: "unblock"; resource: AdminResource };

function statusVariant(status: string): "default" | "success" | "warning" | "muted" {
  const normalized = status.toLowerCase();
  if (normalized.includes("running") || normalized === "active" || normalized === "healthy") {
    return "success";
  }
  if (normalized.includes("error") || normalized.includes("failed") || normalized.includes("exited")) {
    return "muted";
  }
  if (
    normalized.includes("deploy") ||
    normalized.includes("provision") ||
    normalized.includes("starting") ||
    normalized.includes("building")
  ) {
    return "warning";
  }
  return "default";
}

function planLabel(resource: AdminResource): string {
  if (resource.planName) return resource.planName;
  if (resource.planCode) return resource.planCode;
  return "Sin plan";
}

function limitsLabel(resource: AdminResource): string | null {
  const parts: string[] = [];
  if (resource.cpu != null) parts.push(`${resource.cpu} vCPU`);
  if (resource.memoryMb != null) parts.push(`${resource.memoryMb} MB`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function clientName(resource: AdminResource): string {
  return resource.userDisplayName || resource.userEmail || "Cliente desconocido";
}

function formatCreatedAt(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function ManagerResourcePage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [planCode, setPlanCode] = useState("");
  const [createdWithin, setCreatedWithin] = useState<CreatedWithinFilter>("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [blockReason, setBlockReason] = useState(DEFAULT_BLOCK_REASON);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useAdminResourcesOverview({
    search,
    userId: userId || undefined,
    planCode: planCode || undefined,
    createdWithin: createdWithin || undefined,
  });
  const blockMutation = useBlockAdminResource();
  const unblockMutation = useUnblockAdminResource();

  const applications = data?.applications ?? [];
  const databases = data?.databases ?? [];
  const users = data?.users ?? [];
  const plans = data?.plans ?? [];
  const hasActiveFilters = Boolean(search || userId || planCode || createdWithin);
  const blockedCount =
    applications.filter((r) => r.blocked).length + databases.filter((r) => r.blocked).length;
  const confirmLoading = pendingId != null;

  useEffect(() => {
    if (!confirmAction) return;
    if (confirmAction.type === "block") {
      setBlockReason(confirmAction.resource.blockedReason || DEFAULT_BLOCK_REASON);
    }
    setConfirmError(null);
  }, [confirmAction]);

  const clearFilters = () => {
    setQ("");
    setSearch("");
    setUserId("");
    setPlanCode("");
    setCreatedWithin("");
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmAction(null);
    setConfirmError(null);
  };

  const submitConfirm = async () => {
    if (!confirmAction) return;
    setActionError(null);
    setConfirmError(null);
    setPendingId(confirmAction.resource.id);
    try {
      if (confirmAction.type === "block") {
        await blockMutation.mutateAsync({
          resourceId: confirmAction.resource.id,
          reason: blockReason.trim() || undefined,
        });
      } else {
        await unblockMutation.mutateAsync(confirmAction.resource.id);
      }
      setConfirmAction(null);
    } catch (err) {
      const message = getErrorMessage(err);
      setConfirmError(message);
      setActionError(message);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Manager Resource
        </h1>
        <p className="mt-1 text-sm text-muted">
          Bloqueo manual por impago: detiene el recurso, impide reinicio/redeploy/stop desde el
          panel y MCP, y bloquea la creación de nuevos recursos del cliente.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <form
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
          }}
        >
          <label className="space-y-1.5 text-sm">
            <span className="text-muted">Buscar</span>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, framework o dominio…"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-muted">Usuario</span>
            <select
              className={selectClassName}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName}
                  {user.email && user.email !== user.displayName ? ` (${user.email})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-muted">Plan</span>
            <select
              className={selectClassName}
              value={planCode}
              onChange={(e) => setPlanCode(e.target.value)}
            >
              <option value="">Todos los planes</option>
              {plans.map((plan) => (
                <option key={`${plan.kind}-${plan.code}`} value={plan.code}>
                  {plan.name}
                  {plan.code !== plan.name ? ` (${plan.code})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-muted">Creado</span>
            <select
              className={selectClassName}
              value={createdWithin}
              onChange={(e) => setCreatedWithin(e.target.value as CreatedWithinFilter)}
            >
              {CREATED_WITHIN_OPTIONS.map((option) => (
                <option key={option.value || "any"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
            <Button type="submit" variant="secondary">
              Aplicar búsqueda
            </Button>
            {hasActiveFilters && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </form>
      </div>

      {(isError || actionError) && (
        <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {actionError || getErrorMessage(error)}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryStat
              icon={<AppWindow className="h-4 w-4" />}
              label="Aplicaciones"
              value={data?.totalApplications ?? 0}
            />
            <SummaryStat
              icon={<Database className="h-4 w-4" />}
              label="Bases de datos"
              value={data?.totalDatabases ?? 0}
            />
            <SummaryStat
              icon={<ShieldAlert className="h-4 w-4" />}
              label="Bloqueados"
              value={blockedCount}
            />
          </div>

          <ResourceSection
            title="Aplicaciones"
            description="Bloqueo / desbloqueo de aplicaciones"
            icon={<AppWindow className="h-5 w-5 text-primary" />}
            resources={applications}
            variant="application"
            pendingId={pendingId}
            onBlock={(resource) => setConfirmAction({ type: "block", resource })}
            onUnblock={(resource) => setConfirmAction({ type: "unblock", resource })}
          />

          <ResourceSection
            title="Bases de datos"
            description="Bloqueo / desbloqueo de bases de datos"
            icon={<Database className="h-5 w-5 text-primary" />}
            resources={databases}
            variant="database"
            pendingId={pendingId}
            onBlock={(resource) => setConfirmAction({ type: "block", resource })}
            onUnblock={(resource) => setConfirmAction({ type: "unblock", resource })}
          />
        </>
      )}

      <ResourceBlockConfirmModal
        action={confirmAction}
        reason={blockReason}
        onReasonChange={setBlockReason}
        loading={confirmLoading}
        error={confirmError}
        onOpenChange={(open) => {
          if (!open) closeConfirm();
        }}
        onConfirm={submitConfirm}
      />
    </div>
  );
}

function ResourceBlockConfirmModal({
  action,
  reason,
  onReasonChange,
  loading,
  error,
  onOpenChange,
  onConfirm,
}: {
  action: ConfirmAction | null;
  reason: string;
  onReasonChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const isBlock = action?.type === "block";
  const resource = action?.resource;

  return (
    <Modal
      open={!!action}
      onOpenChange={onOpenChange}
      disableClose={loading}
      icon={isBlock ? <Lock className="h-5 w-5" /> : <LockOpen className="h-5 w-5" />}
      iconTone={isBlock ? "danger" : "success"}
      title={isBlock ? "Bloquear recurso" : "Desbloquear recurso"}
      description={
        isBlock
          ? "El recurso se detendrá. El cliente no podrá reiniciarlo, hacer redeploy ni crear nuevos recursos."
          : "El recurso se reiniciará y el cliente recuperará redeploy, restart y stop."
      }
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={isBlock ? "destructive" : "default"}
            disabled={loading || !resource}
            onClick={onConfirm}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isBlock ? (
              <Lock className="h-4 w-4" />
            ) : (
              <LockOpen className="h-4 w-4" />
            )}
            {isBlock ? "Bloquear y detener" : "Desbloquear y reiniciar"}
          </Button>
        </>
      }
    >
      {resource && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card-elevated/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{resource.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {resource.projectName}
                  {resource.environmentName ? ` · ${resource.environmentName}` : ""}
                </p>
              </div>
              <Badge variant={statusVariant(resource.status)}>{resource.status}</Badge>
            </div>
            <div className="mt-3 space-y-1.5 text-sm text-muted">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{clientName(resource)}</span>
              </div>
              {resource.userEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{resource.userEmail}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="muted">{planLabel(resource)}</Badge>
                <Badge variant="muted">{resource.kind}</Badge>
              </div>
            </div>
          </div>

          {isBlock && (
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium text-foreground">Motivo del bloqueo</span>
              <Input
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Ej. Pago del mes pendiente"
                disabled={loading}
                autoFocus
              />
              <span className="text-xs text-muted">
                Visible para el equipo de soporte. Opcional pero recomendado.
              </span>
            </label>
          )}

          {!isBlock && (
            <div className="rounded-lg border border-success/20 bg-success/5 px-3 py-2.5 text-sm text-muted">
              Tras confirmar, Coolify reiniciará el recurso y se levantarán las restricciones del
              cliente.
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

function SummaryStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function ResourceSection({
  title,
  description,
  icon,
  resources,
  variant,
  pendingId,
  onBlock,
  onUnblock,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  resources: AdminResource[];
  variant: "application" | "database";
  pendingId: string | null;
  onBlock: (resource: AdminResource) => void;
  onUnblock: (resource: AdminResource) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <p className="font-medium text-foreground">Sin recursos</p>
          <p className="mt-1 text-sm text-muted">Ningún resultado con los filtros actuales.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              variant={variant}
              pending={pendingId === resource.id}
              onBlock={() => onBlock(resource)}
              onUnblock={() => onUnblock(resource)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ResourceCard({
  resource,
  variant,
  pending,
  onBlock,
  onUnblock,
}: {
  resource: AdminResource;
  variant: "application" | "database";
  pending: boolean;
  onBlock: () => void;
  onUnblock: () => void;
}) {
  const limits = limitsLabel(resource);
  const tech = variant === "database" ? resource.databaseEngine : resource.framework;

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors sm:flex-row sm:items-start sm:justify-between sm:gap-8",
        resource.blocked
          ? "border-error/40 bg-error/5"
          : "border-border hover:border-border-hover hover:bg-card-elevated/40"
      )}
    >
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">{resource.name}</h3>
            <p className="mt-0.5 truncate text-xs text-muted">
              {resource.projectName}
              {resource.environmentName ? ` · ${resource.environmentName}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5 sm:hidden">
            {resource.blocked && <Badge variant="muted">Bloqueado</Badge>}
            <Badge variant={statusVariant(resource.status)}>{resource.status}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="default">{planLabel(resource)}</Badge>
          {tech && <Badge variant="muted">{tech}</Badge>}
          {resource.blocked && <Badge variant="muted">Pago / bloqueo manual</Badge>}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
          {limits && (
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 shrink-0" />
              <span>{limits}</span>
            </div>
          )}
          {resource.primaryDomain && (
            <div className="flex min-w-0 items-center gap-2">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{resource.primaryDomain}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatCreatedAt(resource.createdAt)}</span>
          </div>
        </div>

        {resource.blocked && resource.blockedReason && (
          <p className="text-sm text-error">Motivo: {resource.blockedReason}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-border pt-4 sm:w-72 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {resource.blocked && <Badge variant="muted">Bloqueado</Badge>}
          <Badge variant={statusVariant(resource.status)}>{resource.status}</Badge>
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="truncate font-medium">{clientName(resource)}</span>
          </div>
          {resource.userEmail && (
            <div className="flex items-center gap-2 text-muted">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{resource.userEmail}</span>
            </div>
          )}
          {resource.companyName && (
            <div className="flex items-center gap-2 text-muted">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{resource.companyName}</span>
            </div>
          )}
        </div>

        {resource.blocked ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={onUnblock}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockOpen className="h-4 w-4" />}
            Desbloquear y reiniciar
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={onBlock}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Bloquear y detener
          </Button>
        )}
      </div>
    </article>
  );
}
