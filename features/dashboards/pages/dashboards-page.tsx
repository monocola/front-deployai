"use client";

import { useState } from "react";
import {
  AppWindow,
  Building2,
  Clock,
  Cpu,
  Database,
  Globe,
  LayoutDashboard,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/core/errors/api-error.model";
import { useAdminResourcesOverview } from "@/features/dashboards/data-access/use-admin-resources";
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

export function DashboardsPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [planCode, setPlanCode] = useState("");
  const [createdWithin, setCreatedWithin] = useState<CreatedWithinFilter>("");

  const { data, isLoading, isError, error } = useAdminResourcesOverview({
    search,
    userId: userId || undefined,
    planCode: planCode || undefined,
    createdWithin: createdWithin || undefined,
  });

  const applications = data?.applications ?? [];
  const databases = data?.databases ?? [];
  const users = data?.users ?? [];
  const plans = data?.plans ?? [];
  const hasActiveFilters = Boolean(search || userId || planCode || createdWithin);

  const clearFilters = () => {
    setQ("");
    setSearch("");
    setUserId("");
    setPlanCode("");
    setCreatedWithin("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboards</h1>
        <p className="mt-1 text-sm text-muted">
          Vista global de recursos: aplicaciones y bases de datos con plan y cliente.
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

      {isError && (
        <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {getErrorMessage(error)}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          <ResourceSection
            title="Aplicaciones"
            description="Recursos de tipo application"
            icon={<AppWindow className="h-5 w-5 text-primary" />}
            emptyIcon={<LayoutDashboard className="mb-3 h-8 w-8 text-muted" />}
            emptyTitle="No hay aplicaciones"
            emptyDescription={
              hasActiveFilters
                ? "Ninguna aplicación coincide con los filtros."
                : "Cuando los clientes desplieguen apps aparecerán aquí."
            }
            resources={applications}
            variant="application"
          />

          <ResourceSection
            title="Bases de datos"
            description="Recursos de tipo database"
            icon={<Database className="h-5 w-5 text-primary" />}
            emptyIcon={<Database className="mb-3 h-8 w-8 text-muted" />}
            emptyTitle="No hay bases de datos"
            emptyDescription={
              hasActiveFilters
                ? "Ninguna base de datos coincide con los filtros."
                : "Cuando los clientes creen bases de datos aparecerán aquí."
            }
            resources={databases}
            variant="database"
          />
        </>
      )}
    </div>
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
  emptyIcon,
  emptyTitle,
  emptyDescription,
  resources,
  variant,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  resources: AdminResource[];
  variant: "application" | "database";
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
          {emptyIcon}
          <p className="font-medium text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-sm text-muted">{emptyDescription}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} variant={variant} />
          ))}
        </div>
      )}
    </section>
  );
}

function ResourceCard({
  resource,
  variant,
}: {
  resource: AdminResource;
  variant: "application" | "database";
}) {
  const limits = limitsLabel(resource);
  const tech = variant === "database" ? resource.databaseEngine : resource.framework;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-hover hover:bg-card-elevated/40 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">{resource.name}</h3>
            <p className="mt-0.5 truncate text-xs text-muted">
              {resource.projectName}
              {resource.environmentName ? ` · ${resource.environmentName}` : ""}
            </p>
          </div>
          <Badge variant={statusVariant(resource.status)} className="sm:hidden">
            {resource.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="default">{planLabel(resource)}</Badge>
          {tech && <Badge variant="muted">{tech}</Badge>}
          {resource.planCode && resource.planName && resource.planCode !== resource.planName && (
            <Badge variant="muted">{resource.planCode}</Badge>
          )}
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
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-border pt-4 sm:w-64 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
        <Badge variant={statusVariant(resource.status)} className="hidden w-fit sm:inline-flex">
          {resource.status}
        </Badge>
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
      </div>
    </article>
  );
}
