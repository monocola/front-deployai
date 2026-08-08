"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/core/errors/api-error.model";
import {
  useAdminTicket,
  useReplyAdminTicket,
  useUpdateAdminTicket,
} from "@/features/tickets/data-access/use-admin-tickets";
import { TicketAttachmentList } from "@/features/tickets/components/ticket-attachment-list";
import { TicketFilePicker } from "@/features/tickets/components/ticket-file-picker";
import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/features/tickets/models/ticket.model";

const STATUS_OPTIONS: SupportTicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];

const PRIORITY_OPTIONS: SupportTicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function TicketDetailPage({ ticketId }: { ticketId: string }) {
  const { data: ticket, isLoading, isError, error } = useAdminTicket(ticketId);
  const updateTicket = useUpdateAdminTicket(ticketId);
  const replyTicket = useReplyAdminTicket(ticketId);

  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const handleReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!body.trim()) {
      setFormError("La respuesta no puede estar vacía.");
      return;
    }
    setFormError(null);
    try {
      await replyTicket.mutateAsync({ body: body.trim(), files });
      setBody("");
      setFiles([]);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
        {getErrorMessage(error)}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
          <Link href="/tickets">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{ticket.ticketNumber}</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">{ticket.subject}</h1>
            <p className="mt-2 text-sm text-muted">
              {ticket.userDisplayName} · {ticket.userEmail}
            </p>
          </div>
          <Badge>{ticket.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="text-muted">Estado</span>
          <select
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground"
            value={ticket.status}
            disabled={updateTicket.isPending}
            onChange={(e) =>
              void updateTicket.mutateAsync({
                status: e.target.value as SupportTicketStatus,
              })
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted">Prioridad</span>
          <select
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground"
            value={ticket.priority}
            disabled={updateTicket.isPending}
            onChange={(e) =>
              void updateTicket.mutateAsync({
                priority: e.target.value as SupportTicketPriority,
              })
            }
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-4">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={
              message.authorRole === "MANAGER"
                ? "rounded-xl border border-primary/25 bg-primary/5 p-4"
                : "rounded-xl border border-border bg-card p-4"
            }
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {message.authorDisplayName}
                <span className="ml-2 text-xs font-normal text-muted">
                  {message.authorRole === "MANAGER" ? "Soporte" : "Usuario"}
                </span>
              </p>
              <p className="text-xs text-muted">{new Date(message.createdAt).toLocaleString()}</p>
            </div>
            <p className="whitespace-pre-wrap text-sm text-foreground">{message.body}</p>
            {message.attachments.length > 0 && (
              <TicketAttachmentList
                ticketId={ticket.id}
                attachments={message.attachments}
              />
            )}
          </div>
        ))}
      </div>

      {ticket.attachments.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Adjuntos ({ticket.attachments.length})
          </h2>
          <TicketAttachmentList ticketId={ticket.id} attachments={ticket.attachments} />
        </div>
      )}

      <form onSubmit={handleReply} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Responder como soporte</h2>
        {formError && (
          <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
            {formError}
          </p>
        )}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Escribe la respuesta al usuario…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <TicketFilePicker files={files} onChange={setFiles} />
        <div className="flex justify-end">
          <Button type="submit" disabled={replyTicket.isPending}>
            {replyTicket.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar respuesta
            {files.length > 0 ? ` (${files.length})` : ""}
          </Button>
        </div>
      </form>
    </div>
  );
}
