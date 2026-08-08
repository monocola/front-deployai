"use client";

import { useState } from "react";
import {
  Banknote,
  Building2,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/core/errors/api-error.model";
import { useAdminPayments } from "@/features/payments/data-access/use-admin-payments";
import type {
  AdminPayment,
  PaymentStatusFilter,
} from "@/features/payments/models/admin-payment.model";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
);

function statusVariant(status: string): "default" | "success" | "warning" | "muted" {
  switch (status.toUpperCase()) {
    case "PAID":
      return "success";
    case "FAILED":
      return "muted";
    default:
      return "warning";
  }
}

function formatMoney(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  try {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency || "PEN",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function clientName(payment: AdminPayment): string {
  return payment.userDisplayName || payment.userEmail || "Cliente desconocido";
}

function planLabel(payment: AdminPayment): string {
  if (payment.planName) return payment.planName;
  if (payment.planCode) return payment.planCode;
  if (payment.emailPlanCode) return payment.emailPlanCode;
  if (payment.databasePlanCode) return payment.databasePlanCode;
  return "Sin plan";
}

export function PaymentsPage() {
  const [status, setStatus] = useState<PaymentStatusFilter>("PAID");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const { data, isLoading, isError, error } = useAdminPayments({
    status,
    fromDate: appliedFrom || undefined,
    toDate: appliedTo || undefined,
  });

  const payments = data?.payments ?? [];
  const hasDateFilter = Boolean(appliedFrom || appliedTo);

  const applyDates = () => {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const clearFilters = () => {
    setStatus("PAID");
    setFromDate("");
    setToDate("");
    setAppliedFrom("");
    setAppliedTo("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pagos</h1>
        <p className="mt-1 text-sm text-muted">
          Listado de pagos realizados por clientes, con resumen y filtro por fechas.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5 text-sm">
            <span className="text-muted">Estado</span>
            <select
              className={selectClassName}
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatusFilter)}
            >
              <option value="">Todos</option>
              <option value="PAID">Pagados</option>
              <option value="FAILED">Fallidos</option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-muted">Desde</span>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-muted">Hasta</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>

          <div className="flex items-end gap-2">
            <Button type="button" variant="secondary" onClick={applyDates}>
              Filtrar fechas
            </Button>
            {(hasDateFilter || status !== "PAID") && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                Limpiar
              </Button>
            )}
          </div>
        </div>
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryStat
              icon={<Banknote className="h-4 w-4" />}
              label="Sumatoria (pagados)"
              value={formatMoney(data?.totalAmountCents ?? 0, data?.currency ?? "PEN")}
            />
            <SummaryStat
              icon={<CreditCard className="h-4 w-4" />}
              label="Pagos listados"
              value={String(data?.totalCount ?? 0)}
            />
            <SummaryStat
              icon={<CreditCard className="h-4 w-4 text-success" />}
              label="Pagados"
              value={String(data?.paidCount ?? 0)}
            />
            <SummaryStat
              icon={<CreditCard className="h-4 w-4 text-muted" />}
              label="Fallidos"
              value={String(data?.failedCount ?? 0)}
            />
          </div>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Historial</h2>
              <p className="text-sm text-muted">
                Cada card muestra el cliente, fecha/hora y detalle del cobro.
              </p>
            </div>

            {payments.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
                <CreditCard className="mb-3 h-8 w-8 text-muted" />
                <p className="font-medium text-foreground">No hay pagos</p>
                <p className="mt-1 text-sm text-muted">
                  {hasDateFilter || status
                    ? "Ningún pago coincide con los filtros."
                    : "Cuando los clientes paguen aparecerán aquí."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {payments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            )}
          </section>
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
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function PaymentCard({ payment }: { payment: AdminPayment }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-hover hover:bg-card-elevated/40 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">
              {formatMoney(payment.amountCents, payment.currency)}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted">
              {planLabel(payment)}
              {payment.intendedResourceName ? ` · ${payment.intendedResourceName}` : ""}
            </p>
          </div>
          <Badge variant={statusVariant(payment.status)} className="sm:hidden">
            {payment.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant={statusVariant(payment.status)} className="hidden sm:inline-flex">
            {payment.status}
          </Badge>
          {payment.provisioningStatus && (
            <Badge variant="muted">{payment.provisioningStatus}</Badge>
          )}
          {payment.planCode && payment.planName && payment.planCode !== payment.planName && (
            <Badge variant="muted">{payment.planCode}</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDateTime(payment.createdAt)}</span>
          </div>
          {payment.gatewayTransactionId && (
            <div className="flex min-w-0 items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-mono text-xs" title="Izipay transaction">
                {payment.gatewayTransactionId}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-border pt-4 sm:w-64 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
        <p className="text-xs uppercase tracking-wide text-muted">Cliente</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="truncate font-medium">{clientName(payment)}</span>
          </div>
          {payment.userEmail && (
            <div className="flex items-center gap-2 text-muted">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{payment.userEmail}</span>
            </div>
          )}
          {payment.companyName && (
            <div className="flex items-center gap-2 text-muted">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{payment.companyName}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
