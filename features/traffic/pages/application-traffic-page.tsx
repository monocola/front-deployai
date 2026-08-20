"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Globe,
  Loader2,
  Moon,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/core/errors/api-error.model";
import { useAdminApplicationTraffic } from "@/features/traffic/data-access/use-admin-traffic";
import type {
  AdminApplicationTraffic,
  TrafficActivity,
} from "@/features/traffic/models/admin-traffic.model";
import { cn } from "@/lib/utils";

const ACTIVITY_FILTERS: Array<{ value: "" | TrafficActivity; label: string }> = [
  { value: "", label: "Todas" },
  { value: "ACTIVE", label: "Activas" },
  { value: "IDLE", label: "Inactivas" },
  { value: "SLEEPING", label: "Dormidas" },
  { value: "STOPPED", label: "Detenidas" },
  { value: "NO_DATA", label: "Sin datos" },
];

function formatBytesPerSecond(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value < 1024) return `${Math.round(value)} B/s`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB/s`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB/s`;
}

function formatIdle(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

function activityBadge(activity: TrafficActivity): {
  variant: "default" | "success" | "warning" | "muted";
  label: string;
} {
  switch (activity) {
    case "ACTIVE":
      return { variant: "success", label: "Activa" };
    case "IDLE":
      return { variant: "warning", label: "Inactiva" };
    case "SLEEPING":
      return { variant: "muted", label: "Dormida" };
    case "STOPPED":
      return { variant: "muted", label: "Detenida" };
    default:
      return { variant: "default", label: "Sin datos" };
  }
}

export function ApplicationTrafficPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState<"" | TrafficActivity>("");
  const { data, isLoading, isError, error, dataUpdatedAt, refetch, isFetching } =
    useAdminApplicationTraffic(search);

  const applications = data?.applications ?? [];
  const filtered = useMemo(() => {
    if (!activity) return applications;
    return applications.filter((item) => item.activity === activity);
  }, [applications, activity]);

  const maxReceive = useMemo(() => {
    return filtered.reduce((max, item) => Math.max(max, item.receiveBytesPerSecond ?? 0), 0);
  }, [filtered]);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tráfico de aplicaciones</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Entrada y salida de red de cada aplicación (Prometheus). Se actualiza
            cada 20 s. Umbral de actividad:{" "}
            {formatBytesPerSecond(data?.activeThresholdBytesPerSecond ?? 2048)}.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") setSearch(q.trim());
              }}
              placeholder="Buscar por nombre, dominio o cliente"
              className="pl-9"
            />
          </div>
          <Button type="button" onClick={() => setSearch(q.trim())}>
            Buscar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Medir ahora
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_FILTERS.map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              onClick={() => setActivity(filter.value)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                activity === filter.value
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {dataUpdatedAt ? (
          <p className="text-[11px] text-muted">
            Última medición: {new Date(dataUpdatedAt).toLocaleString("es-PE")}
          </p>
        ) : null}
        {data?.metricsWarning ? (
          <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-foreground">
            {data.metricsWarning}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryStat label="Aplicaciones" value={data?.totalApplications ?? 0} />
        <SummaryStat label="Activas" value={data?.activeCount ?? 0} />
        <SummaryStat label="Inactivas" value={data?.idleCount ?? 0} />
        <SummaryStat label="Dormidas" value={data?.sleepingCount ?? 0} />
        <SummaryStat
          label="RX total"
          valueLabel={formatBytesPerSecond(data?.totalReceiveBytesPerSecond ?? 0)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {getErrorMessage(error)}
        </p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <Moon className="mx-auto mb-3 h-8 w-8 text-muted" />
          <p className="font-medium text-foreground">No hay aplicaciones para mostrar</p>
          <p className="mt-1 text-sm text-muted">
            Cuando existan apps desplegadas verás su tráfico de red aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/70 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Aplicación</th>
                <th className="px-4 py-3 font-medium">Actividad</th>
                <th className="px-4 py-3 font-medium">Entrada</th>
                <th className="px-4 py-3 font-medium">Salida</th>
                <th className="px-4 py-3 font-medium">Sin tráfico</th>
                <th className="px-4 py-3 font-medium">Plan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <TrafficRow key={item.id} item={item} maxReceive={maxReceive} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  valueLabel,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {valueLabel ?? value}
      </p>
    </div>
  );
}

function TrafficRow({
  item,
  maxReceive,
}: {
  item: AdminApplicationTraffic;
  maxReceive: number;
}) {
  const badge = activityBadge(item.activity);
  const receive = item.receiveBytesPerSecond ?? 0;
  const width = maxReceive > 0 ? Math.max(4, Math.round((receive / maxReceive) * 100)) : 0;

  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{item.name}</p>
        <p className="truncate text-xs text-muted">
          {item.userDisplayName || item.userEmail || "—"}
          {item.projectName ? ` · ${item.projectName}` : ""}
        </p>
        {item.primaryDomain ? (
          <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-xs text-muted">
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.primaryDomain.replace(/^https?:\/\//, "")}</span>
          </p>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        {item.framework ? (
          <p className="mt-1 text-[11px] text-muted">{item.framework}</p>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 tabular-nums text-foreground">
          <ArrowDownToLine className="h-3.5 w-3.5 text-muted" />
          {formatBytesPerSecond(item.receiveBytesPerSecond)}
        </div>
        <div className="mt-1.5 h-1.5 w-36 overflow-hidden rounded-full bg-card-elevated">
          <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 tabular-nums text-foreground">
          <ArrowUpFromLine className="h-3.5 w-3.5 text-muted" />
          {formatBytesPerSecond(item.transmitBytesPerSecond)}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-muted">
          <Clock className="h-3.5 w-3.5" />
          {formatIdle(item.idleForSeconds)}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-foreground">{item.planName || item.planCode || "Sin plan"}</p>
        <p className="text-[11px] text-muted">
          {item.alwaysOn
            ? "Always on"
            : item.sleepAfterMinutes
              ? `Sleep ${item.sleepAfterMinutes} min`
              : "—"}
        </p>
      </td>
    </tr>
  );
}
