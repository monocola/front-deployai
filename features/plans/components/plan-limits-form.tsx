"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { PlanResourceLimits, UpdatePlanLimitsPayload } from "@/features/plans/models/plan.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlanLimitsFormProps {
  limits: PlanResourceLimits;
  saving: boolean;
  onSubmit: (payload: UpdatePlanLimitsPayload) => Promise<void>;
}

function nullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null") return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export function PlanLimitsForm({ limits, saving, onSubmit }: PlanLimitsFormProps) {
  const [cpu, setCpu] = useState(String(limits.cpu));
  const [memoryMb, setMemoryMb] = useState(String(limits.memoryMb));
  const [diskGb, setDiskGb] = useState(String(limits.diskGb));
  const [maxApplications, setMaxApplications] = useState(
    limits.maxApplications === null ? "" : String(limits.maxApplications)
  );
  const [maxDatabases, setMaxDatabases] = useState(
    limits.maxDatabases === null ? "" : String(limits.maxDatabases)
  );
  const [maxDomains, setMaxDomains] = useState(
    limits.maxDomains === null ? "" : String(limits.maxDomains)
  );
  const [maxUsers, setMaxUsers] = useState(
    limits.maxUsers === null ? "" : String(limits.maxUsers)
  );
  const [maxTeams, setMaxTeams] = useState(
    limits.maxTeams === null ? "" : String(limits.maxTeams)
  );
  const [monthlyExecutionHours, setMonthlyExecutionHours] = useState(
    limits.monthlyExecutionHours === null ? "" : String(limits.monthlyExecutionHours)
  );
  const [sleepAfterMinutes, setSleepAfterMinutes] = useState(
    limits.sleepAfterMinutes === null ? "" : String(limits.sleepAfterMinutes)
  );
  const [alwaysOn, setAlwaysOn] = useState(limits.alwaysOn);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      cpu: Number(cpu),
      memoryMb: Number(memoryMb),
      diskGb: Number(diskGb),
      maxApplications: nullableNumber(maxApplications),
      maxDatabases: nullableNumber(maxDatabases),
      maxDomains: nullableNumber(maxDomains),
      maxUsers: nullableNumber(maxUsers),
      maxTeams: nullableNumber(maxTeams),
      monthlyExecutionHours: nullableNumber(monthlyExecutionHours),
      sleepAfterMinutes: nullableNumber(sleepAfterMinutes),
      alwaysOn,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted">
        Deja vacío un campo numérico opcional para indicar ilimitado (null).
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LimitField label="vCPU" value={cpu} onChange={setCpu} />
        <LimitField label="RAM (MB)" value={memoryMb} onChange={setMemoryMb} />
        <LimitField label="Disco (GB)" value={diskGb} onChange={setDiskGb} />
        <LimitField label="Máx. aplicaciones" value={maxApplications} onChange={setMaxApplications} optional />
        <LimitField label="Máx. bases de datos" value={maxDatabases} onChange={setMaxDatabases} optional />
        <LimitField label="Máx. dominios" value={maxDomains} onChange={setMaxDomains} optional />
        <LimitField label="Máx. usuarios" value={maxUsers} onChange={setMaxUsers} optional />
        <LimitField label="Máx. equipos" value={maxTeams} onChange={setMaxTeams} optional />
        <LimitField label="Horas mensuales" value={monthlyExecutionHours} onChange={setMonthlyExecutionHours} optional />
        <LimitField label="Sleep tras (min)" value={sleepAfterMinutes} onChange={setSleepAfterMinutes} optional />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={alwaysOn} onChange={(e) => setAlwaysOn(e.target.checked)} />
        Always On (sin sleep automático)
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar límites
        </Button>
      </div>
    </form>
  );
}

function LimitField({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1 text-xs text-muted">(vacío = ∞)</span>}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
