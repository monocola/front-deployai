"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Cpu, Loader2, MemoryStick, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/core/errors/api-error.model";
import { ResourceTechIcon } from "@/features/customers/components/resource-tech-icon";
import {
  useAdminCustomerResources,
  useAdminCustomers,
} from "@/features/customers/data-access/use-admin-customers";
import type {
  AdminCustomer,
  AdminCustomerResource,
} from "@/features/customers/models/admin-customer.model";
import { cn } from "@/lib/utils";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatCpu(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—";
  return `${Number(value.toFixed(2))} vCPU`;
}

function formatMemory(mb: number | null | undefined): string {
  if (mb == null || !Number.isFinite(mb) || mb <= 0) return "—";
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${Number(gb.toFixed(gb >= 10 ? 0 : 1))} GB`;
  }
  return `${Math.round(mb)} MB`;
}

function customerName(customer: AdminCustomer): string {
  if (customer.displayName?.trim()) return customer.displayName.trim();
  const first = customer.firstName?.trim() ?? "";
  const last = customer.lastName?.trim() ?? "";
  const combined = `${first} ${last}`.trim();
  return combined || customer.email;
}

function providerLabel(provider: string | null): string {
  if (!provider) return "—";
  switch (provider.toUpperCase()) {
    case "LOCAL":
      return "Email";
    case "GOOGLE":
      return "Google";
    case "GITHUB":
      return "GitHub";
    default:
      return provider;
  }
}

function kindLabel(kind: string): string {
  switch (kind.toLowerCase()) {
    case "database":
      return "Base de datos";
    case "email":
      return "Correo";
    case "application":
      return "Aplicación";
    default:
      return "Recurso";
  }
}

function techLabel(resource: AdminCustomerResource): string | null {
  if (resource.kind === "database") return resource.databaseEngine;
  if (resource.kind === "application") return resource.framework;
  return null;
}

function CustomerResourcesPanel({ userId }: { userId: string }) {
  const { data, isLoading, isError, error } = useAdminCustomerResources(userId, true);
  const resources = data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando recursos contratados…
      </div>
    );
  }

  if (isError) {
    return <p className="px-2 py-3 text-sm text-error">{getErrorMessage(error)}</p>;
  }

  if (resources.length === 0) {
    return (
      <p className="px-2 py-3 text-sm text-muted">Este cliente no tiene recursos contratados.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/70 bg-background/40">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/70 text-xs uppercase tracking-wide text-muted">
            <th className="w-12 px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Recurso</th>
            <th className="px-3 py-2 font-medium">Tipo</th>
            <th className="px-3 py-2 font-medium">Plan</th>
            <th className="px-3 py-2 font-medium">CPU</th>
            <th className="px-3 py-2 font-medium">Memoria</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            <th className="px-3 py-2 font-medium">Creado</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource: AdminCustomerResource, index) => {
            const tech = techLabel(resource);
            return (
              <tr
                key={`${resource.kind}-${resource.id}`}
                className="border-b border-border/50 last:border-0"
              >
                <td className="px-3 py-2 tabular-nums text-muted">{index + 1}</td>
                <td className="px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ResourceTechIcon
                      kind={resource.kind}
                      framework={resource.framework}
                      databaseEngine={resource.databaseEngine}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{resource.name}</p>
                      {tech ? (
                        <p className="truncate text-xs text-muted">{tech}</p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="muted">{kindLabel(resource.kind)}</Badge>
                </td>
                <td className="px-3 py-2 text-muted">
                  {resource.planName || resource.planCode || "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums text-muted">
                  {formatCpu(resource.cpu)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums text-muted">
                  {formatMemory(resource.memoryMb)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={resource.blocked ? "warning" : "default"}>
                      {resource.status || "—"}
                    </Badge>
                    {resource.blocked ? <Badge variant="warning">Bloqueado</Badge> : null}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted">
                  {formatDateTime(resource.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CustomersPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useAdminCustomers(search);
  const customers = data?.customers ?? [];
  const enabledCount = customers.filter((customer) => customer.enabled).length;
  const totalCpu = Number(data?.totalCpu ?? 0);
  const totalMemoryMb = data?.totalMemoryMb ?? 0;
  const totalResources = data?.totalResources ?? 0;

  const toggle = (customerId: string) => {
    setExpandedId((current) => (current === customerId ? null : customerId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clientes</h1>
            <p className="mt-1 text-sm text-muted">
              Usuarios registrados con rol cliente. Expande una fila para ver sus recursos
              contratados.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Registrados</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Activos</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{enabledCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">CPU contratada</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Cpu className="h-4 w-4 text-primary" />
            {totalCpu > 0 ? formatCpu(totalCpu) : "0 vCPU"}
          </p>
          <p className="mt-1 text-xs text-muted">{totalResources} recursos</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Memoria contratada</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
            <MemoryStick className="h-4 w-4 text-primary" />
            {totalMemoryMb > 0 ? formatMemory(totalMemoryMb) : "0 MB"}
          </p>
          <p className="mt-1 text-xs text-muted">Suma de planes activos</p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por correo, nombre o empresa…"
            className="min-w-[220px] flex-1"
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
          {search ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setQ("");
                setSearch("");
              }}
            >
              Limpiar
            </Button>
          ) : null}
        </form>

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando clientes…
          </div>
        ) : null}

        {isError ? <p className="text-sm text-error">{getErrorMessage(error)}</p> : null}

        {!isLoading && !isError && customers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No hay clientes con este filtro.</p>
        ) : null}

        {!isLoading && customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="w-10 px-2 py-2 font-medium" />
                  <th className="w-14 px-2 py-2 font-medium">#</th>
                  <th className="px-2 py-2 font-medium">Cliente</th>
                  <th className="px-2 py-2 font-medium">Empresa</th>
                  <th className="px-2 py-2 font-medium">País</th>
                  <th className="px-2 py-2 font-medium">Acceso</th>
                  <th className="px-2 py-2 font-medium">Estado</th>
                  <th className="px-2 py-2 font-medium">Registro</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => {
                  const expanded = expandedId === customer.id;
                  return (
                    <Fragment key={customer.id}>
                      <tr
                        className={cn(
                          "border-b border-border/70 last:border-0",
                          expanded && "border-b-0 bg-card-elevated/30"
                        )}
                      >
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            aria-expanded={expanded}
                            aria-label={
                              expanded
                                ? "Ocultar recursos contratados"
                                : "Ver recursos contratados"
                            }
                            onClick={() => toggle(customer.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-card-elevated hover:text-foreground"
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-2 py-3 tabular-nums text-muted">{index + 1}</td>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => toggle(customer.id)}
                            className="text-left"
                          >
                            <p className="font-medium text-foreground">{customerName(customer)}</p>
                            <p className="text-xs text-muted">{customer.email}</p>
                          </button>
                        </td>
                        <td className="px-2 py-3 text-muted">{customer.companyName || "—"}</td>
                        <td className="px-2 py-3 text-muted">{customer.country || "—"}</td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="muted">{providerLabel(customer.authProvider)}</Badge>
                            <Badge variant={customer.emailVerified ? "success" : "warning"}>
                              {customer.emailVerified ? "Email verificado" : "Email pendiente"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <Badge variant={customer.enabled ? "success" : "muted"}>
                            {customer.enabled ? "Activo" : "Deshabilitado"}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-2 py-3 text-muted">
                          {formatDateTime(customer.createdAt)}
                        </td>
                      </tr>
                      {expanded ? (
                        <tr className="border-b border-border/70 bg-card-elevated/20 last:border-0">
                          <td colSpan={8} className="px-4 py-3">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                              Recursos contratados
                            </p>
                            <CustomerResourcesPanel userId={customer.id} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
