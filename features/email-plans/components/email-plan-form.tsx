"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type {
  CreateEmailPlanPayload,
  EmailPlan,
  UpdateEmailPlanPayload,
} from "@/features/email-plans/models/email-plan.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailPlanFormProps {
  plan?: EmailPlan;
  isNew: boolean;
  saving: boolean;
  onSubmit: (payload: CreateEmailPlanPayload | UpdateEmailPlanPayload) => Promise<void>;
}

export function EmailPlanForm({ plan, isNew, saving, onSubmit }: EmailPlanFormProps) {
  const [code, setCode] = useState(plan?.code ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [priceCentsMonthly, setPriceCentsMonthly] = useState(
    String(plan?.priceCentsMonthly ?? "0")
  );
  const [currency, setCurrency] = useState(plan?.currency ?? "USD");
  const [customPricing, setCustomPricing] = useState(plan?.customPricing ?? false);
  const [emailsPerMonth, setEmailsPerMonth] = useState(
    plan?.emailsPerMonth == null ? "" : String(plan.emailsPerMonth)
  );
  const [overageCentsPer1000, setOverageCentsPer1000] = useState(
    plan?.overageCentsPer1000 == null ? "" : String(plan.overageCentsPer1000)
  );
  const [aliases, setAliases] = useState(String(plan?.aliases ?? "10"));
  const [mailboxesUnlimited, setMailboxesUnlimited] = useState(
    plan != null && (plan.mailboxes == null || plan.mailboxes <= 0)
  );
  const [mailboxes, setMailboxes] = useState(
    plan != null && plan.mailboxes != null && plan.mailboxes > 0
      ? String(plan.mailboxes)
      : "5"
  );
  const [defquotaMb, setDefquotaMb] = useState(String(plan?.defquotaMb ?? "1024"));
  const [maxquotaMb, setMaxquotaMb] = useState(String(plan?.maxquotaMb ?? "2048"));
  const [quotaMb, setQuotaMb] = useState(String(plan?.quotaMb ?? "5120"));
  const [rlFrame, setRlFrame] = useState(plan?.rlFrame ?? "h");
  const [rlValue, setRlValue] = useState(String(plan?.rlValue ?? "100"));
  const [supportLevel, setSupportLevel] = useState(plan?.supportLevel ?? "ticket");
  const [automationRuns, setAutomationRuns] = useState(
    plan?.automationRuns == null ? "" : String(plan.automationRuns)
  );
  const [featureSendingReceiving, setFeatureSendingReceiving] = useState(
    plan?.featureSendingReceiving ?? true
  );
  const [enabled, setEnabled] = useState(plan?.enabled ?? true);
  const [recommended, setRecommended] = useState(plan?.recommended ?? false);
  const [displayOrder, setDisplayOrder] = useState(String(plan?.displayOrder ?? "1"));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: CreateEmailPlanPayload = {
      code: code.trim().toLowerCase(),
      name: name.trim(),
      description: description.trim() || null,
      priceCentsMonthly: Number(priceCentsMonthly),
      currency: currency.trim().toUpperCase(),
      customPricing,
      emailsPerMonth: emailsPerMonth.trim() === "" ? null : Number(emailsPerMonth),
      overageCentsPer1000:
        overageCentsPer1000.trim() === "" ? null : Number(overageCentsPer1000),
      aliases: Number(aliases),
      mailboxes: mailboxesUnlimited ? null : Number(mailboxes),
      defquotaMb: Number(defquotaMb),
      maxquotaMb: Number(maxquotaMb),
      quotaMb: Number(quotaMb),
      rlFrame: rlFrame.trim().toLowerCase(),
      rlValue: Number(rlValue),
      supportLevel: supportLevel.trim().toLowerCase(),
      automationRuns: automationRuns.trim() === "" ? null : Number(automationRuns),
      featureSendingReceiving,
      enabled,
      recommended,
      displayOrder: Number(displayOrder),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
      <Field label="Código" htmlFor="email-code">
        <Input
          id="email-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="free"
          required
        />
      </Field>
      <Field label="Nombre" htmlFor="email-name">
        <Input
          id="email-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>
      <Field label="Precio mensual (centavos)" htmlFor="email-price">
        <Input
          id="email-price"
          type="number"
          min="0"
          step="1"
          value={priceCentsMonthly}
          onChange={(e) => setPriceCentsMonthly(e.target.value)}
          required
          disabled={customPricing}
        />
        <p className="mt-1 text-xs text-muted">Ej: 2000 = $20.00 USD</p>
      </Field>
      <Field label="Moneda" htmlFor="email-currency">
        <Input
          id="email-currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        />
      </Field>
      <Field label="Emails / mes" htmlFor="email-volume">
        <Input
          id="email-volume"
          type="number"
          min="0"
          value={emailsPerMonth}
          onChange={(e) => setEmailsPerMonth(e.target.value)}
          placeholder="vacío = sin límite / custom"
        />
      </Field>
      <Field label="Overage (centavos / 1.000)" htmlFor="email-overage">
        <Input
          id="email-overage"
          type="number"
          min="0"
          value={overageCentsPer1000}
          onChange={(e) => setOverageCentsPer1000(e.target.value)}
          placeholder="90 = $0.90"
        />
      </Field>
      <Field label="Aliases (Mailcow)" htmlFor="email-aliases">
        <Input
          id="email-aliases"
          type="number"
          min="0"
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          required
        />
      </Field>
      <Field label="Mailboxes (Mailcow)" htmlFor="email-mailboxes">
        <Input
          id="email-mailboxes"
          type="number"
          min="1"
          value={mailboxes}
          onChange={(e) => setMailboxes(e.target.value)}
          required={!mailboxesUnlimited}
          disabled={mailboxesUnlimited}
        />
        <label className="mt-2 flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={mailboxesUnlimited}
            onChange={(e) => setMailboxesUnlimited(e.target.checked)}
          />
          Unlimited
        </label>
      </Field>
      <Field label="defquota (MiB)" htmlFor="email-defquota">
        <Input
          id="email-defquota"
          type="number"
          min="1"
          value={defquotaMb}
          onChange={(e) => setDefquotaMb(e.target.value)}
          required
        />
      </Field>
      <Field label="maxquota (MiB)" htmlFor="email-maxquota">
        <Input
          id="email-maxquota"
          type="number"
          min="1"
          value={maxquotaMb}
          onChange={(e) => setMaxquotaMb(e.target.value)}
          required
        />
      </Field>
      <Field label="quota dominio (MiB)" htmlFor="email-quota">
        <Input
          id="email-quota"
          type="number"
          min="1"
          value={quotaMb}
          onChange={(e) => setQuotaMb(e.target.value)}
          required
        />
      </Field>
      <Field label="rl_frame" htmlFor="email-rl-frame">
        <Input
          id="email-rl-frame"
          value={rlFrame}
          onChange={(e) => setRlFrame(e.target.value)}
          placeholder="h"
          required
        />
      </Field>
      <Field label="rl_value" htmlFor="email-rl-value">
        <Input
          id="email-rl-value"
          type="number"
          min="1"
          value={rlValue}
          onChange={(e) => setRlValue(e.target.value)}
          required
        />
      </Field>
      <Field label="Soporte" htmlFor="email-support">
        <select
          id="email-support"
          value={supportLevel}
          onChange={(e) => setSupportLevel(e.target.value)}
          className="flex h-9 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <option value="ticket">ticket</option>
          <option value="slack_ticket">slack_ticket</option>
          <option value="priority">priority</option>
        </select>
      </Field>
      <Field label="Automation runs" htmlFor="email-automation">
        <Input
          id="email-automation"
          type="number"
          min="0"
          value={automationRuns}
          onChange={(e) => setAutomationRuns(e.target.value)}
          placeholder="vacío = flexible"
        />
      </Field>
      <Field label="Orden" htmlFor="email-order">
        <Input
          id="email-order"
          type="number"
          min="1"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          required
        />
      </Field>
      <div className="lg:col-span-2">
        <Field label="Descripción" htmlFor="email-description">
          <textarea
            id="email-description"
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
          checked={customPricing}
          onChange={(e) => setCustomPricing(e.target.checked)}
        />
        Precio custom (Enterprise — sin pago online)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={featureSendingReceiving}
          onChange={(e) => setFeatureSendingReceiving(e.target.checked)}
        />
        Envío y recepción
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
          {isNew ? "Crear plan de correo" : "Guardar cambios"}
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
