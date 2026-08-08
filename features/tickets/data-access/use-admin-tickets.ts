"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTicket,
  listAdminTickets,
  replyAdminTicket,
  updateAdminTicket,
} from "@/features/tickets/data-access/admin-tickets-api";
import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/features/tickets/models/ticket.model";

export const adminTicketsKeys = {
  all: ["admin-support-tickets"] as const,
  list: (status?: string, q?: string, page?: number) =>
    [...adminTicketsKeys.all, "list", status ?? "all", q ?? "", page ?? 1] as const,
  detail: (id: string) => [...adminTicketsKeys.all, "detail", id] as const,
};

export function useAdminTickets(params?: {
  status?: SupportTicketStatus | "";
  q?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: adminTicketsKeys.list(params?.status, params?.q, params?.page),
    queryFn: () => listAdminTickets(params),
  });
}

export function useAdminTicket(ticketId: string) {
  return useQuery({
    queryKey: adminTicketsKeys.detail(ticketId),
    queryFn: () => getAdminTicket(ticketId),
    enabled: !!ticketId,
  });
}

export function useUpdateAdminTicket(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { status?: SupportTicketStatus; priority?: SupportTicketPriority }) =>
      updateAdminTicket(ticketId, payload),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: adminTicketsKeys.all });
      qc.setQueryData(adminTicketsKeys.detail(ticketId), ticket);
    },
  });
}

export function useReplyAdminTicket(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, files }: { body: string; files: File[] }) =>
      replyAdminTicket(ticketId, body, files),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: adminTicketsKeys.all });
      qc.setQueryData(adminTicketsKeys.detail(ticketId), ticket);
    },
  });
}
