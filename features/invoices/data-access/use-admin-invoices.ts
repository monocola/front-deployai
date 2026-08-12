"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminInvoices,
  listAdminInvoiceCustomers,
  listAdminInvoices,
  previewAdminInvoice,
  sendAdminInvoiceReceipt,
  updateAdminInvoice,
} from "@/features/invoices/data-access/admin-invoices-api";
import type {
  AdminInvoicesFilters,
  CreateInvoicePayload,
  UpdateInvoicePayload,
} from "@/features/invoices/models/admin-invoice.model";

export const adminInvoiceKeys = {
  all: ["admin-invoices"] as const,
  customers: () => [...adminInvoiceKeys.all, "customers"] as const,
  list: (filters: AdminInvoicesFilters) =>
    [
      ...adminInvoiceKeys.all,
      "list",
      filters.status ?? "",
      filters.userId ?? "",
      filters.fromDate ?? "",
      filters.toDate ?? "",
    ] as const,
  preview: (userId: string) => [...adminInvoiceKeys.all, "preview", userId] as const,
};

export function useAdminInvoices(filters: AdminInvoicesFilters = {}) {
  return useQuery({
    queryKey: adminInvoiceKeys.list(filters),
    queryFn: () => listAdminInvoices(filters),
  });
}

export function useAdminInvoiceCustomers(enabled: boolean) {
  return useQuery({
    queryKey: adminInvoiceKeys.customers(),
    queryFn: listAdminInvoiceCustomers,
    enabled,
    staleTime: 30_000,
  });
}

export function useAdminInvoicePreview(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: adminInvoiceKeys.preview(userId),
    queryFn: () => previewAdminInvoice(userId),
    enabled: enabled && userId.length > 0,
  });
}

export function useCreateAdminInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createAdminInvoices(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminInvoiceKeys.all });
    },
  });
}

export function useUpdateAdminInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, payload }: { invoiceId: string; payload: UpdateInvoicePayload }) =>
      updateAdminInvoice(invoiceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminInvoiceKeys.all });
    },
  });
}

export function useSendAdminInvoiceReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, to }: { invoiceId: string; to?: string }) =>
      sendAdminInvoiceReceipt(invoiceId, to),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminInvoiceKeys.all });
    },
  });
}
