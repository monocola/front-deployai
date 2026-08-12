"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  Mail,
  Pencil,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getErrorMessage } from "@/core/errors/api-error.model";
import {
  useAdminInvoiceCustomers,
  useAdminInvoicePreview,
  useAdminInvoices,
  useCreateAdminInvoices,
  useSendAdminInvoiceReceipt,
  useUpdateAdminInvoice,
} from "@/features/invoices/data-access/use-admin-invoices";
import type {
  AdminInvoice,
  AdminInvoiceCustomer,
  InvoiceBillableResource,
  InvoiceStatusFilter,
} from "@/features/invoices/models/admin-invoice.model";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
);

const textareaClassName = cn(
  "min-h-[88px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
);

function formatMoney(amountCents: number, currency = "PEN"): string {
  try {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency || "PEN",
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency}`;
  }
}

function formatUsdCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function InvoicePrice({
  usdCents,
  penCents,
}: {
  usdCents: number | null | undefined;
  penCents: number;
}) {
  if (usdCents != null && usdCents > 0) {
    return (
      <span className="inline-flex flex-col leading-tight">
        <span className="tabular-nums text-foreground">{formatUsdCents(usdCents)}</span>
        <span className="text-[11px] tabular-nums text-muted">≈ {formatMoney(penCents)}</span>
      </span>
    );
  }
  return <span className="tabular-nums">{formatMoney(penCents)}</span>;
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function solesToCents(raw: string): number {
  const normalized = raw.trim().replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 100);
}

function centsToSolesInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

function statusVariant(status: string): "default" | "success" | "warning" | "muted" {
  switch (status.toUpperCase()) {
    case "PAID":
      return "success";
    case "CANCELLED":
      return "muted";
    default:
      return "warning";
  }
}

function userLabel(user: AdminInvoiceCustomer): string {
  if (user.displayName?.trim()) {
    return `${user.displayName.trim()} · ${user.email}`;
  }
  return user.email;
}

function kindLabel(kind: string | null): string {
  switch (kind) {
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

export function InvoicesPage() {
  const [status, setStatus] = useState<InvoiceStatusFilter>("");
  const [userId, setUserId] = useState("");
  const customersQuery = useAdminInvoiceCustomers(true);
  const { data, isLoading, isError, error } = useAdminInvoices({
    status,
    userId: userId || undefined,
  });
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminInvoice | null>(null);
  const [sending, setSending] = useState<AdminInvoice | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const invoices = data?.invoices ?? [];
  const customers = customersQuery.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Facturación</h1>
          <p className="mt-1 text-sm text-muted">
            Genera una factura por cada recurso de pago contratado, marca los que ya vencieron según
            su fecha de creación y envía el comprobante.
          </p>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Plus className="h-4 w-4" />
          Generar factura
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Pendientes de generar"
          value={String(data?.dueResourceCount ?? 0)}
          hint="Recursos de pago que ya deben facturarse"
        />
        <SummaryCard
          label="Facturas generadas"
          value={String(data?.generatedInvoiceCount ?? 0)}
          hint={`${data?.paidResourceCount ?? 0} recursos de pago contratados`}
        />
        <SummaryCard
          label="Facturas pagadas"
          value={String(data?.paidInvoiceCount ?? 0)}
          hint="Comprobantes ya cobrados"
        />
      </div>

      {successMessage ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {successMessage}
        </p>
      ) : null}
      {actionError ? (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {actionError}
        </p>
      ) : null}

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-3">
          <label className="min-w-[220px] flex-1 space-y-1.5 text-sm sm:max-w-sm">
            <span className="text-muted">Cliente</span>
            <select
              className={selectClassName}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">Todos los clientes</option>
              {customers.map((user) => (
                <option key={user.id} value={user.id}>
                  {userLabel(user)}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-[160px] space-y-1.5 text-sm sm:max-w-xs">
            <span className="text-muted">Estado</span>
            <select
              className={selectClassName}
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatusFilter)}
            >
              <option value="">Todas</option>
              <option value="PENDING">Pendientes</option>
              <option value="PAID">Pagadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando facturas…
          </div>
        ) : null}

        {isError ? (
          <p className="text-sm text-error">{getErrorMessage(error)}</p>
        ) : null}

        {!isLoading && !isError && invoices.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No hay facturas con este filtro.</p>
        ) : null}

        {!isLoading && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="w-12 px-2 py-2 font-medium">#</th>
                  <th className="px-2 py-2 font-medium">Factura</th>
                  <th className="px-2 py-2 font-medium">Cliente</th>
                  <th className="px-2 py-2 font-medium">Concepto</th>
                  <th className="px-2 py-2 font-medium">Monto (USD)</th>
                  <th className="px-2 py-2 font-medium">Estado</th>
                  <th className="px-2 py-2 font-medium">Emitida</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr key={invoice.id} className="border-b border-border/70 last:border-0">
                    <td className="px-2 py-3 tabular-nums text-muted">{index + 1}</td>
                    <td className="px-2 py-3 font-medium text-foreground">{invoice.invoiceNumber}</td>
                    <td className="px-2 py-3">
                      <p className="text-foreground">
                        {invoice.userDisplayName || invoice.userEmail || "—"}
                      </p>
                      <p className="text-xs text-muted">{invoice.userEmail}</p>
                    </td>
                    <td className="max-w-[280px] px-2 py-3 text-muted">
                      <p className="truncate">{invoice.concept}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.resourceName
                          ? `${kindLabel(invoice.resourceKind)} · ${invoice.resourceName}`
                          : invoice.planName}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <InvoicePrice
                        usdCents={invoice.sourceAmountUsdCents}
                        penCents={invoice.amountCents}
                      />
                    </td>
                    <td className="px-2 py-3">
                      <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
                    </td>
                    <td className="px-2 py-3 text-muted">{formatDateTime(invoice.issuedAt)}</td>
                    <td className="px-2 py-3">
                      <div className="flex justify-end gap-1">
                        {invoice.status === "PENDING" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActionError(null);
                              setEditing(invoice);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                        ) : null}
                        {invoice.status === "PENDING" || invoice.status === "PAID" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActionError(null);
                              setSending(invoice);
                            }}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Enviar
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <GenerateInvoiceModal
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onCreated={(count) => {
          setSuccessMessage(
            count === 1
              ? "1 factura generada. El cliente ya puede pagarla."
              : `${count} facturas generadas. El cliente ya puede pagarlas.`
          );
          setGenerateOpen(false);
        }}
        onError={setActionError}
      />

      <EditInvoiceModal
        invoice={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSaved={(number) => {
          setSuccessMessage(`Factura ${number} actualizada.`);
          setEditing(null);
        }}
        onError={setActionError}
      />

      <SendReceiptModal
        invoice={sending}
        onOpenChange={(open) => {
          if (!open) setSending(null);
        }}
        onSent={(email) => {
          setSuccessMessage(
            sending?.status === "PAID"
              ? `Comprobante enviado a ${email}.`
              : `Factura enviada a ${email}.`
          );
          setSending(null);
        }}
        onError={setActionError}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function GenerateInvoiceModal({
  open,
  onOpenChange,
  onCreated,
  onError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (count: number) => void;
  onError: (message: string) => void;
}) {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setUserId("");
      setEmail("");
      setSelectedIds([]);
    }
  }, [open]);

  const customersQuery = useAdminInvoiceCustomers(open);
  const preview = useAdminInvoicePreview(userId, open && userId.length > 0);
  const createMutation = useCreateAdminInvoices();
  const customers = customersQuery.data ?? [];
  const resources = preview.data?.resources ?? [];
  const emails = preview.data?.emails ?? [];

  useEffect(() => {
    if (!preview.data) {
      setEmail("");
      setSelectedIds([]);
      return;
    }
    setEmail(preview.data.emails[0] ?? preview.data.userEmail ?? "");
    setSelectedIds(
      preview.data.resources.filter((resource) => resource.needsInvoice).map((resource) => resource.resourceId)
    );
  }, [preview.data]);

  const toggle = (resource: InvoiceBillableResource) => {
    setSelectedIds((current) =>
      current.includes(resource.resourceId)
        ? current.filter((id) => id !== resource.resourceId)
        : [...current, resource.resourceId]
    );
  };

  const selected = resources.filter((resource) => selectedIds.includes(resource.resourceId));

  const submit = async () => {
    if (!userId || selected.length === 0) return;
    try {
      const created = await createMutation.mutateAsync({
        userId,
        items: selected.map((resource) => ({
          resourceId: resource.resourceId,
          resourceKind: resource.resourceKind,
          concept: resource.suggestedConcept,
          amountCents: resource.suggestedAmountCents,
        })),
      });
      onCreated(created.length);
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Generar factura"
      description="Selecciona el correo del cliente y los recursos de pago. Se emite una factura independiente por cada recurso."
      icon={<FileText className="h-4 w-4" />}
      className="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={!userId || !email || selected.length === 0 || createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Generar {selected.length > 0 ? `${selected.length} factura${selected.length === 1 ? "" : "s"}` : ""}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted">Cliente</span>
          <select
            className={selectClassName}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">Selecciona un cliente</option>
            {customers.map((user) => (
              <option key={user.id} value={user.id}>
                {userLabel(user)}
              </option>
            ))}
          </select>
        </label>

        {userId ? (
          <label className="block space-y-1.5 text-sm">
            <span className="text-muted">Correo del usuario</span>
            <select
              className={selectClassName}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            >
              <option value="">Selecciona un correo</option>
              {emails.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {preview.isFetching ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando recursos contratados…
          </div>
        ) : null}

        {preview.data ? (
          <div className="space-y-2">
            <p className="text-sm text-muted">
              {preview.data.paidResourceCount} recurso{preview.data.paidResourceCount === 1 ? "" : "s"} de
              pago · {preview.data.dueResourceCount} por facturar según fecha de creación
            </p>
            {resources.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
                Este cliente no tiene recursos de pago contratados.
              </p>
            ) : (
              <>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setSelectedIds(
                      resources
                        .filter((resource) => resource.needsInvoice)
                        .map((resource) => resource.resourceId)
                    )
                  }
                >
                  Solo pendientes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setSelectedIds(
                      resources
                        .filter((resource) => !resource.existingInvoiceNumber)
                        .map((resource) => resource.resourceId)
                    )
                  }
                >
                  Todos sin factura
                </Button>
              </div>
              <ul className="max-h-72 space-y-2 overflow-y-auto">
                {resources.map((resource, index) => {
                  const checked = selectedIds.includes(resource.resourceId);
                  return (
                    <li key={resource.resourceId}>
                      <label
                        className={cn(
                          "flex cursor-pointer gap-3 rounded-lg border p-3 text-sm",
                          resource.needsInvoice
                            ? "border-warning/40 bg-warning/10"
                            : "border-border bg-card"
                        )}
                      >
                        <span className="mt-1 w-5 shrink-0 text-right text-xs tabular-nums text-muted">
                          {index + 1}
                        </span>
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={checked}
                          disabled={!!resource.existingInvoiceNumber}
                          onChange={() => toggle(resource)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">{resource.resourceName}</span>
                            <Badge variant={resource.needsInvoice ? "warning" : "muted"}>
                              {kindLabel(resource.resourceKind)}
                            </Badge>
                            {resource.needsInvoice ? (
                              <Badge variant="warning">Debe facturarse</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            {resource.planName} ·{" "}
                            {resource.sourceAmountUsdCents
                              ? `${formatUsdCents(resource.sourceAmountUsdCents)} · ≈ ${formatMoney(resource.suggestedAmountCents)}`
                              : formatMoney(resource.suggestedAmountCents)}{" "}
                            · creado {formatDateTime(resource.createdAt)}
                          </p>
                          <p className="mt-1 text-xs text-muted">{resource.billingStatus}</p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
              </>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function EditInvoiceModal({
  invoice,
  onOpenChange,
  onSaved,
  onError,
}: {
  invoice: AdminInvoice | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (invoiceNumber: string) => void;
  onError: (message: string) => void;
}) {
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const updateMutation = useUpdateAdminInvoice();

  const pricedInUsd = (invoice?.sourceAmountUsdCents ?? 0) > 0;

  useEffect(() => {
    if (!invoice) return;
    setConcept(invoice.concept);
    setAmount(
      centsToSolesInput(
        pricedInUsd ? (invoice.sourceAmountUsdCents ?? invoice.amountCents) : invoice.amountCents
      )
    );
  }, [invoice, pricedInUsd]);

  const amountCents = solesToCents(amount);

  const submit = async () => {
    if (!invoice || amountCents <= 0 || !concept.trim()) return;
    try {
      const saved = await updateMutation.mutateAsync({
        invoiceId: invoice.id,
        payload: pricedInUsd
          ? { concept: concept.trim(), sourceAmountUsdCents: amountCents }
          : { concept: concept.trim(), amountCents },
      });
      onSaved(saved.invoiceNumber);
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={invoice != null}
      onOpenChange={onOpenChange}
      title={`Editar ${invoice?.invoiceNumber ?? ""}`}
      description={
        pricedInUsd
          ? "Solo facturas pendientes. Editas el monto en USD; al pagar se cobra en soles al tipo de cambio del día."
          : "Solo facturas pendientes. El cliente verá el nuevo monto al pagar con Izipay."
      }
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={amountCents <= 0 || !concept.trim() || updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted">Concepto</span>
          <textarea
            className={textareaClassName}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted">{pricedInUsd ? "Monto (USD)" : "Monto (PEN)"}</span>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
      </div>
    </Modal>
  );
}

function SendReceiptModal({
  invoice,
  onOpenChange,
  onSent,
  onError,
}: {
  invoice: AdminInvoice | null;
  onOpenChange: (open: boolean) => void;
  onSent: (email: string) => void;
  onError: (message: string) => void;
}) {
  const [to, setTo] = useState("");
  const sendMutation = useSendAdminInvoiceReceipt();
  const emails = invoice?.userEmail ? [invoice.userEmail] : [];

  useEffect(() => {
    if (!invoice) return;
    setTo(invoice.userEmail ?? "");
  }, [invoice]);

  const submit = async () => {
    if (!invoice || !to) return;
    try {
      const saved = await sendMutation.mutateAsync({
        invoiceId: invoice.id,
        to,
      });
      onSent(saved.receiptSentTo || to);
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={invoice != null}
      onOpenChange={onOpenChange}
      title={invoice?.status === "PAID" ? "Enviar comprobante" : "Enviar factura"}
      description={
        invoice?.status === "PAID"
          ? `Se enviará el comprobante de ${invoice?.invoiceNumber ?? "la factura"} por correo, con el logo de Devployer.`
          : `Se enviará la factura ${invoice?.invoiceNumber ?? ""} por correo al cliente, con el logo de Devployer.`
      }
      icon={<Mail className="h-4 w-4" />}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={sendMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} disabled={sendMutation.isPending || !to}>
            {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Enviar correo
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <div className="flex flex-wrap items-start gap-2 text-muted">
          {invoice ? (
            <InvoicePrice usdCents={invoice.sourceAmountUsdCents} penCents={invoice.amountCents} />
          ) : null}
          <span>· {invoice?.concept}</span>
        </div>
        <label className="block space-y-1.5">
          <span className="text-muted">Correo del usuario</span>
          <select className={selectClassName} value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">Selecciona un correo</option>
            {emails.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        {invoice?.receiptSentAt ? (
          <p className="text-xs text-muted">
            Último envío: {formatDateTime(invoice.receiptSentAt)}
            {invoice.receiptSentTo ? ` → ${invoice.receiptSentTo}` : ""}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
