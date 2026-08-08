"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type {
  CreateDatabasePlanPayload,
  DatabasePlan,
  UpdateDatabasePlanPayload,
} from "@/features/database-plans/models/database-plan.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DatabasePlanFormProps {
  plan?: DatabasePlan;
  isNew: boolean;
  saving: boolean;
  onSubmit: (
    payload: CreateDatabasePlanPayload | UpdateDatabasePlanPayload
  ) => Promise<void>;
}

export function DatabasePlanForm({
  plan,
  isNew,
  saving,
  onSubmit,
}: DatabasePlanFormProps) {
  const [code, setCode] = useState(plan?.code ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [priceCentsMonthly, setPriceCentsMonthly] = useState(
    String(plan?.priceCentsMonthly ?? "0")
  );
  const [currency, setCurrency] = useState(plan?.currency ?? "USD");
  const [limitsMemory, setLimitsMemory] = useState(plan?.limitsMemory ?? "256m");
  const [limitsCpus, setLimitsCpus] = useState(plan?.limitsCpus ?? "0.25");
  const [storageGb, setStorageGb] = useState(String(plan?.storageGb ?? "1"));
  const [maxConnections, setMaxConnections] = useState(
    String(plan?.maxConnections ?? "10")
  );
  const [backupsEnabled, setBackupsEnabled] = useState(plan?.backupsEnabled ?? false);
  const [backupFrequency, setBackupFrequency] = useState(
    plan?.backupFrequency ?? "none"
  );
  const [enabled, setEnabled] = useState(plan?.enabled ?? true);
  const [recommended, setRecommended] = useState(plan?.recommended ?? false);
  const [displayOrder, setDisplayOrder] = useState(String(plan?.displayOrder ?? "1"));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: CreateDatabasePlanPayload = {
      code: code.trim().toLowerCase(),
      name: name.trim(),
      description: description.trim() || null,
      priceCentsMonthly: Number(priceCentsMonthly),
      currency: currency.trim().toUpperCase(),
      limitsMemory: limitsMemory.trim(),
      limitsCpus: limitsCpus.trim(),
      storageGb: Number(storageGb),
      maxConnections: Number(maxConnections),
      backupsEnabled,
      backupFrequency: backupFrequency.trim().toLowerCase(),
      enabled,
      recommended,
      displayOrder: Number(displayOrder),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
      <Field label="Código" htmlFor="db-code">
        <Input
          id="db-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="free"
          required
        />
      </Field>
      <Field label="Nombre" htmlFor="db-name">
        <Input
          id="db-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>
      <Field label="Precio mensual (centavos)" htmlFor="db-price">
        <Input
          id="db-price"
          type="number"
          min="0"
          step="1"
          value={priceCentsMonthly}
          onChange={(e) => setPriceCentsMonthly(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-muted">Ej: 200 = $2.00 USD</p>
      </Field>
      <Field label="Moneda" htmlFor="db-currency">
        <Input
          id="db-currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        />
      </Field>
      <Field label="Límite memoria (Coolify)" htmlFor="db-memory">
        <Input
          id="db-memory"
          value={limitsMemory}
          onChange={(e) => setLimitsMemory(e.target.value)}
          placeholder="256m / 1g"
          required
        />
      </Field>
      <Field label="Límite vCPU (Coolify)" htmlFor="db-cpu">
        <Input
          id="db-cpu"
          value={limitsCpus}
          onChange={(e) => setLimitsCpus(e.target.value)}
          placeholder="0.25"
          required
        />
      </Field>
      <Field label="Almacenamiento (GB)" htmlFor="db-storage">
        <Input
          id="db-storage"
          type="number"
          min="1"
          value={storageGb}
          onChange={(e) => setStorageGb(e.target.value)}
          required
        />
      </Field>
      <Field label="Máx. conexiones" htmlFor="db-connections">
        <Input
          id="db-connections"
          type="number"
          min="1"
          value={maxConnections}
          onChange={(e) => setMaxConnections(e.target.value)}
          required
        />
      </Field>
      <Field label="Frecuencia de backups" htmlFor="db-backup-freq">
        <select
          id="db-backup-freq"
          value={backupFrequency}
          onChange={(e) => setBackupFrequency(e.target.value)}
          className="flex h-9 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <option value="none">none</option>
          <option value="daily">daily</option>
          <option value="every_6_hours">every_6_hours</option>
        </select>
      </Field>
      <Field label="Orden de visualización" htmlFor="db-order">
        <Input
          id="db-order"
          type="number"
          min="1"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          required
        />
      </Field>
      <div className="lg:col-span-2">
        <Field label="Descripción" htmlFor="db-description">
          <textarea
            id="db-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={backupsEnabled}
          onChange={(e) => setBackupsEnabled(e.target.checked)}
        />
        Backups habilitados
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Plan activo (visible en DeployAI)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={recommended}
          onChange={(e) => setRecommended(e.target.checked)}
        />
        Marcar como más popular
      </label>
      <div className="lg:col-span-2 flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isNew ? "Crear plan de DB" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
