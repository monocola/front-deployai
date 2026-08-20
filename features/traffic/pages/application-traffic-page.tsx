"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Globe,
  Loader2,
  Moon,
  Search,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/core/errors/api-error.model";
import { useAdminApplicationTraffic, useSetAdminApplicationAutoStop } from "@/features/traffic/data-access/use-admin-traffic";
import type {
  AdminApplicationTraffic,
  TrafficActivity,
} from "@/features/traffic/models/admin-traffic.model";
import {
  autoStopMinutes,
  isAutoStopEligibleRow,
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
  return formatClock(seconds);
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(r).padStart(2, "0");
  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

function secondsSinceFetch(fetchedAt: number, nowMs: number): number {
  if (!fetchedAt) return 0;
  return Math.max(0, Math.floor((nowMs - fetchedAt) / 1000));
}

function liveIdleSeconds(
  item: AdminApplicationTraffic,
  fetchedAt: number,
  nowMs: number
): number | null {
  if (item.activity === "ACTIVE") {
    return 0;
  }
  if (item.idleForSeconds == null) {
    return null;
  }
  return item.idleForSeconds + secondsSinceFetch(fetchedAt, nowMs);
}

function useNowTick(enabled: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}

function stopCountdown(
  item: AdminApplicationTraffic,
  fetchedAt: number,
  nowMs: number
): {
  remainingLabel: string;
  tone: "muted" | "warning" | "danger" | "live";
} | null {
  if (!isAutoStopEligibleRow(item)) return null;
  if (item.activity === "SLEEPING") {
    return { remainingLabel: "Dormida", tone: "muted" };
  }
  if (item.activity === "STOPPED") {
    return { remainingLabel: "Detenida", tone: "muted" };
  }
  if (!item.autoStopEnabled) {
    return { remainingLabel: "Off", tone: "muted" };
  }
  if (item.activity === "ACTIVE") {
    return {
      remainingLabel: formatClock(autoStopMinutes(item) * 60),
      tone: "live",
    };
  }
  const remaining =
    autoStopMinutes(item) * 60 -
    (item.idleForSeconds ?? 0) -
    secondsSinceFetch(fetchedAt, nowMs);
  const label = formatClock(remaining);
  if (remaining <= 60) {
    return { remainingLabel: label, tone: "danger" };
  }
  return {
    remainingLabel: label,
    tone: remaining <= 5 * 60 ? "warning" : "muted",
  };
}

function activityStyle(activity: TrafficActivity): {
  label: string;
  className: string;
  dot: string;
} {
  switch (activity) {
    case "ACTIVE":
      return {
        label: "Activa",
        className: "border-success/20 bg-success/10 text-success",
        dot: "bg-success animate-pulse",
      };
    case "IDLE":
      return {
        label: "Inactiva",
        className: "border-warning/20 bg-warning/10 text-warning",
        dot: "bg-warning",
      };
    case "SLEEPING":
      return {
        label: "Dormida",
        className: "border-primary/20 bg-primary/10 text-primary",
        dot: "bg-primary",
      };
    case "STOPPED":
      return {
        label: "Detenida",
        className: "border-border bg-card-elevated text-muted",
        dot: "bg-muted-foreground",
      };
    default:
      return {
        label: "Sin datos",
        className: "border-border bg-card-elevated text-muted",
        dot: "bg-muted-foreground",
      };
  }
}

export function ApplicationTrafficPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState<"" | TrafficActivity>("");
  const { data, isLoading, isError, error, dataUpdatedAt, refetch, isFetching } =
    useAdminApplicationTraffic(search);
  const setAutoStop = useSetAdminApplicationAutoStop(search);
  const nowMs = useNowTick(true);

  const applications = data?.applications ?? [];
  const filtered = useMemo(() => {
    if (!activity) return applications;
    return applications.filter((item) => item.activity === activity);
  }, [applications, activity]);

  const maxReceive = useMemo(() => {
    return filtered.reduce((max, item) => Math.max(max, item.receiveBytesPerSecond ?? 0), 0);
  }, [filtered]);

  const threshold = data?.activeThresholdBytesPerSecond ?? 256;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Observabilidad
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Tráfico de aplicaciones
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Actividad en vivo por red. Auto-stop On cuenta 30:00 desde el último
            consumo y duerme a 00:00. Umbral: {formatBytesPerSecond(threshold)}.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          {dataUpdatedAt ? (
            <span className="rounded-full border border-border/80 bg-card px-3 py-1.5">
              Medido {new Date(dataUpdatedAt).toLocaleTimeString("es-PE")}
            </span>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            Medir ahora
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryStat label="Aplicaciones" value={data?.totalApplications ?? 0} />
        <SummaryStat label="Activas" value={data?.activeCount ?? 0} accent="success" />
        <SummaryStat label="Inactivas" value={data?.idleCount ?? 0} accent="warning" />
        <SummaryStat label="Dormidas" value={data?.sleepingCount ?? 0} accent="primary" />
        <SummaryStat
          label="RX total"
          valueLabel={formatBytesPerSecond(data?.totalReceiveBytesPerSecond ?? 0)}
        />
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") setSearch(q.trim());
              }}
              placeholder="Buscar por nombre, dominio o cliente"
              className="h-10 rounded-xl border-border/80 bg-background/60 pl-9"
            />
          </div>
          <Button type="button" className="h-10 rounded-xl" onClick={() => setSearch(q.trim())}>
            Buscar
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {ACTIVITY_FILTERS.map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              onClick={() => setActivity(filter.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activity === filter.value
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "bg-background/70 text-muted ring-1 ring-border hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {data?.metricsWarning ? (
          <p className="mt-3 rounded-xl border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-foreground">
            {data.metricsWarning}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <p className="rounded-2xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {getErrorMessage(error)}
        </p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <Moon className="mx-auto mb-3 h-8 w-8 text-muted" />
          <p className="font-medium text-foreground">No hay aplicaciones para mostrar</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-card-elevated/40 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  <th className="px-5 py-3.5">Aplicación</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Entrada</th>
                  <th className="px-5 py-3.5">Salida</th>
                  <th className="px-5 py-3.5">
                    Sin tráfico
                    <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
                      min:seg
                    </span>
                  </th>
                  <th className="px-5 py-3.5">
                    Se detiene en
                    <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
                      min:seg
                    </span>
                  </th>
                  <th className="px-5 py-3.5">Auto-stop</th>
                  <th className="px-5 py-3.5">Plan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <TrafficRow
                    key={item.id}
                    item={item}
                    maxReceive={maxReceive}
                    fetchedAt={dataUpdatedAt}
                    nowMs={nowMs}
                    autoStopPending={setAutoStop.isPending && setAutoStop.variables?.resourceId === item.id}
                    onAutoStopChange={(enabled) =>
                      setAutoStop.mutate({ resourceId: item.id, enabled })
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  valueLabel,
  accent,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  accent?: "success" | "warning" | "primary";
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card px-4 py-4">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px",
          accent === "success" && "bg-success/70",
          accent === "warning" && "bg-warning/70",
          accent === "primary" && "bg-primary/70",
          !accent && "bg-border"
        )}
      />
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {valueLabel ?? value}
      </p>
    </div>
  );
}

function TrafficRow({
  item,
  maxReceive,
  fetchedAt,
  nowMs,
  autoStopPending,
  onAutoStopChange,
}: {
  item: AdminApplicationTraffic;
  maxReceive: number;
  fetchedAt: number;
  nowMs: number;
  autoStopPending: boolean;
  onAutoStopChange: (enabled: boolean) => void;
}) {
  const status = activityStyle(item.activity);
  const receive = item.receiveBytesPerSecond ?? 0;
  const width = maxReceive > 0 ? Math.max(6, Math.round((receive / maxReceive) * 100)) : 0;
  const eligible = isAutoStopEligibleRow(item);
  const countdown = stopCountdown(item, fetchedAt, nowMs);
  const idleClock = formatIdle(liveIdleSeconds(item, fetchedAt, nowMs));
  const domain = item.primaryDomain?.replace(/^https?:\/\//, "") ?? null;

  return (
    <tr className="border-b border-border/40 transition-colors last:border-0 hover:bg-white/[0.025]">
      <td className="px-5 py-4">
        <p className="max-w-[280px] truncate font-medium tracking-tight text-foreground">{item.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {item.userDisplayName || item.userEmail || "—"}
          {item.projectName ? ` · ${item.projectName}` : ""}
        </p>
        {domain ? (
          <span className="mt-2 inline-flex max-w-[280px] items-center gap-1 truncate rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-muted ring-1 ring-border/70">
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{domain}</span>
          </span>
        ) : null}
      </td>
      <td className="px-5 py-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            status.className
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
        {item.framework ? (
          <p className="mt-1.5 text-[11px] capitalize text-muted-foreground">{item.framework}</p>
        ) : null}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 font-medium tabular-nums text-foreground">
          <ArrowDownToLine className="h-3.5 w-3.5 text-muted" />
          {formatBytesPerSecond(item.receiveBytesPerSecond)}
        </div>
        <div className="mt-2 h-1 w-28 overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 font-medium tabular-nums text-foreground">
          <ArrowUpFromLine className="h-3.5 w-3.5 text-muted" />
          {formatBytesPerSecond(item.transmitBytesPerSecond)}
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-background/70 px-2.5 py-1.5 font-mono text-base font-semibold tabular-nums tracking-tight text-foreground ring-1 ring-border/60">
          <Clock className="h-3.5 w-3.5 text-muted" />
          {idleClock}
        </div>
      </td>
      <td className="px-5 py-4">
        {countdown ? (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-base font-semibold tabular-nums tracking-tight ring-1",
              countdown.tone === "danger" && "bg-error/10 text-error ring-error/20",
              countdown.tone === "warning" && "bg-warning/10 text-warning ring-warning/20",
              countdown.tone === "live" && "bg-success/10 text-success ring-success/20",
              countdown.tone === "muted" && "bg-background/70 text-muted ring-border/60"
            )}
          >
            <TimerReset className="h-3.5 w-3.5 opacity-70" />
            {countdown.remainingLabel}
          </div>
        ) : (
          <p className="text-xs text-muted">—</p>
        )}
      </td>
      <td className="px-5 py-4">
        {eligible ? (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={item.autoStopEnabled}
              aria-label={`Auto-stop ${item.name}`}
              disabled={autoStopPending}
              onClick={() => onAutoStopChange(!item.autoStopEnabled)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
                item.autoStopEnabled ? "bg-primary" : "bg-card-elevated ring-1 ring-inset ring-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                  item.autoStopEnabled ? "left-5" : "left-0.5"
                )}
              />
            </button>
            <span className="text-xs font-medium text-muted">
              {item.autoStopEnabled ? "On" : "Off"}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted">No aplica</p>
        )}
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-foreground">
          {item.planName || item.planCode || "Sin plan"}
        </p>
        <p className="mt-0.5 text-[11px] text-muted">
          {!eligible
            ? item.alwaysOn
              ? "Always on"
              : "Sin auto-sleep"
            : item.autoStopEnabled
              ? `Sleep ${autoStopMinutes(item)} min`
              : "Free / Sin plan"}
        </p>
      </td>
    </tr>
  );
}
