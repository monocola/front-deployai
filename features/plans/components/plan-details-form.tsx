"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { CreatePlanPayload, Plan, UpdatePlanPayload } from "@/features/plans/models/plan.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlanDetailsFormProps {
  plan?: Plan;
  isNew: boolean;
  saving: boolean;
  onSubmit: (payload: CreatePlanPayload | UpdatePlanPayload) => Promise<void>;
}

export function PlanDetailsForm({ plan, isNew, saving, onSubmit }: PlanDetailsFormProps) {
  const [code, setCode] = useState(plan?.code ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [monthlyPrice, setMonthlyPrice] = useState(String(plan?.monthlyPrice ?? "0"));
  const [currency, setCurrency] = useState(plan?.currency ?? "USD");
  const [enabled, setEnabled] = useState(plan?.enabled ?? true);
  const [recommended, setRecommended] = useState(plan?.recommended ?? false);
  const [displayOrder, setDisplayOrder] = useState(String(plan?.displayOrder ?? "1"));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || null,
      monthlyPrice: Number(monthlyPrice),
      currency: currency.trim(),
      enabled,
      recommended,
      displayOrder: Number(displayOrder),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
      <Field label="Código" htmlFor="code">
        <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
      </Field>
      <Field label="Nombre" htmlFor="name">
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Precio mensual" htmlFor="price">
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={monthlyPrice}
          onChange={(e) => setMonthlyPrice(e.target.value)}
          required
        />
      </Field>
      <Field label="Moneda" htmlFor="currency">
        <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required />
      </Field>
      <Field label="Orden de visualización" htmlFor="order">
        <Input
          id="order"
          type="number"
          min="1"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          required
        />
      </Field>
      <div className="lg:col-span-2">
        <Field label="Descripción" htmlFor="description">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Plan activo (visible en catálogo)
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
          {isNew ? "Crear plan" : "Guardar detalles"}
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
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
