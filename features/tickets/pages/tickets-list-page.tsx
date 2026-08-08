"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, LifeBuoy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/core/errors/api-error.model";
import { useAdminTickets } from "@/features/tickets/data-access/use-admin-tickets";
import type { SupportTicketStatus } from "@/features/tickets/models/ticket.model";

const STATUSES: Array<SupportTicketStatus | ""> = [
  "",
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];

const STATUS_LABEL: Record<string, string> = {
  "": "Todos",
  OPEN: "Abierto",
  IN_PROGRESS: "En progreso",
  WAITING_CUSTOMER: "Espera cliente",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

function statusVariant(status: string): "default" | "success" | "warning" | "muted" {
  switch (status) {
    case "RESOLVED":
      return "success";
    case "CLOSED":
      return "muted";
    case "IN_PROGRESS":
    case "WAITING_CUSTOMER":
      return "warning";
    default:
      return "default";
  }
}

export function TicketsListPage() {
  const [status, setStatus] = useState<SupportTicketStatus | "">("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAdminTickets({
    status,
    q: search,
    page,
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Tickets de soporte</h1>
        <p className="mt-1 text-sm text-muted">
          Administra solicitudes de usuarios, responde y cambia el estado.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
            setPage(1);
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por asunto o número…"
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
            className={
              status === value
                ? "rounded-md bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary"
                : "rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
            }
          >
            {STATUS_LABEL[value]}
          </button>
        ))}
      </div>

      {isError && (
        <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {getErrorMessage(error)}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <LifeBuoy className="mb-3 h-8 w-8 text-muted" />
          <p className="font-medium text-foreground">No hay tickets</p>
          <p className="mt-1 text-sm text-muted">Cuando los usuarios creen tickets aparecerán aquí.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-card-elevated text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Asunto</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Prioridad</th>
                <th className="px-4 py-3 font-medium">Msgs</th>
                <th className="px-4 py-3 font-medium">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((ticket) => (
                <tr key={ticket.id} className="border-b border-border/70 hover:bg-card-elevated/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {ticket.ticketNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground">{ticket.subject}</td>
                  <td className="px-4 py-3 text-muted">{ticket.userEmail}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(ticket.status)}>{STATUS_LABEL[ticket.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{ticket.priority}</td>
                  <td className="px-4 py-3 text-muted">{ticket.messageCount}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
