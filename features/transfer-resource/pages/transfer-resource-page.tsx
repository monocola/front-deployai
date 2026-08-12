"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AppWindow,
  ArrowRightLeft,
  Database,
  GitBranch,
  Globe,
  Loader2,
  Search,
  Server,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getErrorMessage } from "@/core/errors/api-error.model";
import {
  useAdminUserProjects,
  useAdminUserSearch,
} from "@/features/transfer-resource/data-access/use-admin-users";
import {
  useClaimCoolifyOrphan,
  useCoolifyOrphans,
} from "@/features/transfer-resource/data-access/use-coolify-orphans";
import type { AdminCoolifyOrphanResource } from "@/features/transfer-resource/models/coolify-orphan.model";
import type { AdminUserOption } from "@/features/transfer-resource/models/admin-user.model";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
);

function statusVariant(status: string | null): "default" | "success" | "warning" | "muted" {
  const normalized = (status ?? "").toLowerCase();
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

function userLabel(user: AdminUserOption): string {
  if (user.displayName?.trim()) {
    return `${user.displayName.trim()} · ${user.email}`;
  }
  return user.email;
}

export function TransferResourcePage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminCoolifyOrphanResource | null>(null);
  const [emailQuery, setEmailQuery] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [targetUser, setTargetUser] = useState<AdminUserOption | null>(null);
  const [projectId, setProjectId] = useState("");
  const [environmentId, setEnvironmentId] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedEmail(emailQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [emailQuery]);

  const { data, isLoading, isError, error, refetch, isFetching } = useCoolifyOrphans(search);
  const claimMutation = useClaimCoolifyOrphan();
  const userSearch = useAdminUserSearch(debouncedEmail, selected != null && !targetUser);
  const userProjects = useAdminUserProjects(targetUser?.id, selected != null && targetUser != null);

  const applications = data?.applications ?? [];
  const databases = data?.databases ?? [];
  const projects = userProjects.data ?? [];

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId) ?? null,
    [projects, projectId]
  );
  const environments = selectedProject?.environments ?? [];

  useEffect(() => {
    if (!targetUser || !userProjects.data) return;
    const list = userProjects.data;
    if (list.length === 0) {
      setProjectId("");
      setEnvironmentId("");
      return;
    }
    const nextProject = list.find((p) => p.id === projectId) ?? list[0];
    setProjectId(nextProject.id);
    const envs = nextProject.environments ?? [];
    const nextEnv = envs.find((env) => env.id === environmentId) ?? envs[0] ?? null;
    setEnvironmentId(nextEnv?.id ?? "");
    // Intentionally depend on user + loaded projects only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUser?.id, userProjects.data]);

  const closeModal = () => {
    if (claimMutation.isPending) return;
    setSelected(null);
    setEmailQuery("");
    setDebouncedEmail("");
    setTargetUser(null);
    setProjectId("");
    setEnvironmentId("");
    setConfirmError(null);
  };

  const openClaim = (resource: AdminCoolifyOrphanResource) => {
    setActionError(null);
    setSuccessMessage(null);
    setConfirmError(null);
    setSelected(resource);
    setEmailQuery("");
    setDebouncedEmail("");
    setTargetUser(null);
    setProjectId("");
    setEnvironmentId("");
  };

  const canSubmit =
    !!selected &&
    !!targetUser &&
    !claimMutation.isPending &&
    !userProjects.isLoading &&
    (projects.length === 0 || (!!projectId && !!environmentId));

  const submitClaim = async () => {
    if (!selected || !targetUser) return;
    if (projects.length > 0 && (!projectId || !environmentId)) return;
    setConfirmError(null);
    setActionError(null);
    try {
      const claimed = await claimMutation.mutateAsync({
        coolifyUuid: selected.coolifyUuid,
        kind: selected.kind,
        targetUserEmail: targetUser.email,
        projectId: projects.length > 0 ? projectId : undefined,
        environmentId: projects.length > 0 ? environmentId : undefined,
      });
      const projectName = selectedProject?.name;
      const envName = environments.find((env) => env.id === environmentId)?.name;
      setSuccessMessage(
        `«${claimed.name}» asignado a ${claimed.userEmail || targetUser.email}` +
          (projectName && envName ? ` · ${projectName} / ${envName}` : "")
      );
      closeModal();
    } catch (err) {
      const message = getErrorMessage(err);
      setConfirmError(message);
      setActionError(message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Transferir recurso huérfano
        </h1>
        <p className="mt-1 text-sm text-muted">
          Solo recursos que existen en Coolify y aún no están vinculados en DeployAI. Elige el
          usuario, proyecto y ambiente destino para darle control total.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-foreground">
          {successMessage}
        </div>
      )}
      {actionError && !selected && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {actionError}
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
          }}
        >
          <label className="min-w-0 flex-1 space-y-1.5 text-sm">
            <span className="text-muted">Buscar en Coolify (huérfanos)</span>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, uuid, dominio o repo…"
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isFetching}>
              <Search className="h-4 w-4" />
              Filtrar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isFetching}
              onClick={() => {
                setQ("");
                setSearch("");
                void refetch();
              }}
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar"}
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted">
          Huérfanos: {(data?.totalApplications ?? 0) + (data?.totalDatabases ?? 0)} · Apps{" "}
          {data?.totalApplications ?? 0} · DBs {data?.totalDatabases ?? 0}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Consultando Coolify…
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {getErrorMessage(error)}
        </div>
      ) : (
        <div className="space-y-8">
          <OrphanSection
            title="Aplicaciones huérfanas"
            icon={<AppWindow className="h-5 w-5 text-primary" />}
            resources={applications}
            onClaim={openClaim}
          />
          <OrphanSection
            title="Bases de datos huérfanas"
            icon={<Database className="h-5 w-5 text-primary" />}
            resources={databases}
            onClaim={openClaim}
          />
        </div>
      )}

      <Modal
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        disableClose={claimMutation.isPending}
        icon={<ArrowRightLeft className="h-5 w-5" />}
        title="Asignar huérfano a usuario"
        description="Se creará el recurso en DeployAI en el proyecto y ambiente seleccionados."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={claimMutation.isPending}
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button type="button" disabled={!canSubmit} onClick={() => void submitClaim()}>
              {claimMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="h-4 w-4" />
              )}
              Asignar y transferir
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card-elevated/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{selected.name}</p>
                  <p className="mt-0.5 truncate font-mono text-xs text-muted">
                    {selected.coolifyUuid}
                  </p>
                </div>
                <Badge variant={statusVariant(selected.status)}>
                  {selected.status || "unknown"}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
                <Badge variant="muted">{selected.kind}</Badge>
                {selected.buildPack && <Badge variant="muted">{selected.buildPack}</Badge>}
                {selected.databaseEngine && (
                  <Badge variant="muted">{selected.databaseEngine}</Badge>
                )}
                {selected.primaryDomain && (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Globe className="h-3.5 w-3.5" />
                    {selected.primaryDomain}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Correo del usuario destino</span>
                <Input
                  value={emailQuery}
                  onChange={(e) => {
                    setEmailQuery(e.target.value);
                    setTargetUser(null);
                    setProjectId("");
                    setEnvironmentId("");
                  }}
                  placeholder="usuario@empresa.com"
                  disabled={claimMutation.isPending}
                  autoFocus
                />
              </label>

              {targetUser ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm">
                  <p className="truncate font-medium text-foreground">{userLabel(targetUser)}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={claimMutation.isPending}
                    onClick={() => {
                      setTargetUser(null);
                      setProjectId("");
                      setEnvironmentId("");
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                  {debouncedEmail.length < 2 ? (
                    <p className="px-3 py-4 text-sm text-muted">
                      Escribe al menos 2 caracteres para buscar usuarios.
                    </p>
                  ) : userSearch.isLoading ? (
                    <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando…
                    </div>
                  ) : userSearch.isError ? (
                    <p className="px-3 py-4 text-sm text-error">
                      {getErrorMessage(userSearch.error)}
                    </p>
                  ) : (userSearch.data?.length ?? 0) === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted">
                      Sin usuarios para «{debouncedEmail}».
                    </p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {(userSearch.data ?? []).map((user) => (
                        <li key={user.id}>
                          <button
                            type="button"
                            className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm hover:bg-card-elevated"
                            onClick={() => {
                              setTargetUser(user);
                              setEmailQuery(user.email);
                              setProjectId("");
                              setEnvironmentId("");
                            }}
                          >
                            <span className="font-medium text-foreground">{userLabel(user)}</span>
                            {user.companyName && (
                              <span className="text-xs text-muted">{user.companyName}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {targetUser && (
              <div className="space-y-3 rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-foreground">Destino en DeployAI</p>
                {userProjects.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando proyectos…
                  </div>
                ) : userProjects.isError ? (
                  <p className="text-sm text-error">{getErrorMessage(userProjects.error)}</p>
                ) : projects.length === 0 ? (
                  <p className="text-sm text-muted">
                    Este usuario no tiene proyectos. Al asignar se creará un proyecto y ambiente
                    automáticamente.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm">
                      <span className="text-muted">Proyecto</span>
                      <select
                        className={selectClassName}
                        value={projectId}
                        disabled={claimMutation.isPending}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setProjectId(nextId);
                          const project = projects.find((p) => p.id === nextId);
                          const firstEnv = project?.environments?.[0];
                          setEnvironmentId(firstEnv?.id ?? "");
                        }}
                      >
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1.5 text-sm">
                      <span className="text-muted">Ambiente</span>
                      <select
                        className={selectClassName}
                        value={environmentId}
                        disabled={claimMutation.isPending || environments.length === 0}
                        onChange={(e) => setEnvironmentId(e.target.value)}
                      >
                        {environments.length === 0 ? (
                          <option value="">Sin ambientes</option>
                        ) : (
                          environments.map((env) => (
                            <option key={env.id} value={env.id}>
                              {env.name}
                            </option>
                          ))
                        )}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            )}

            {confirmError && (
              <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
                {confirmError}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function OrphanSection({
  title,
  icon,
  resources,
  onClaim,
}: {
  title: string;
  icon: ReactNode;
  resources: AdminCoolifyOrphanResource[];
  onClaim: (resource: AdminCoolifyOrphanResource) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <Badge variant="muted">{resources.length}</Badge>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">
          No hay huérfanos en esta categoría.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {resources.map((resource) => (
            <article
              key={resource.coolifyUuid}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">{resource.name}</h3>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted">
                      {resource.coolifyUuid}
                    </p>
                  </div>
                  <Badge variant={statusVariant(resource.status)}>
                    {resource.status || "unknown"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
                  {resource.primaryDomain && (
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{resource.primaryDomain}</span>
                    </span>
                  )}
                  {resource.gitRepository && (
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <GitBranch className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {resource.gitRepository}
                        {resource.gitBranch ? ` @ ${resource.gitBranch}` : ""}
                      </span>
                    </span>
                  )}
                  {(resource.buildPack || resource.databaseEngine || resource.portsExposes) && (
                    <span className="inline-flex items-center gap-2">
                      <Server className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {[resource.buildPack, resource.databaseEngine, resource.portsExposes]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 sm:w-48">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => onClaim(resource)}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Asignar
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
