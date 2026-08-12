import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type {
  AdminInvoice,
  AdminInvoiceCustomer,
  AdminInvoicePreview,
  AdminInvoicesFilters,
  AdminInvoicesOverview,
  CreateInvoicePayload,
  UpdateInvoicePayload,
} from "@/features/invoices/models/admin-invoice.model";

export async function listAdminInvoices(
  params?: AdminInvoicesFilters
): Promise<AdminInvoicesOverview> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.userId) search.set("userId", params.userId);
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  const qs = search.toString();
  const path = qs
    ? `${apiEndpoints.adminInvoices.list()}?${qs}`
    : apiEndpoints.adminInvoices.list();
  return apiClient.get(path);
}

export function listAdminInvoiceCustomers(): Promise<AdminInvoiceCustomer[]> {
  return apiClient.get(apiEndpoints.adminInvoices.customers());
}

export async function previewAdminInvoice(userId: string): Promise<AdminInvoicePreview> {
  const search = new URLSearchParams();
  search.set("userId", userId);
  return apiClient.get(`${apiEndpoints.adminInvoices.preview()}?${search.toString()}`);
}

export function createAdminInvoices(payload: CreateInvoicePayload): Promise<AdminInvoice[]> {
  return apiClient.post(apiEndpoints.adminInvoices.create(), payload);
}

export function updateAdminInvoice(
  invoiceId: string,
  payload: UpdateInvoicePayload
): Promise<AdminInvoice> {
  return apiClient.patch(apiEndpoints.adminInvoices.update(invoiceId), payload);
}

export function sendAdminInvoiceReceipt(
  invoiceId: string,
  to?: string
): Promise<AdminInvoice> {
  return apiClient.post(apiEndpoints.adminInvoices.sendReceipt(invoiceId), to ? { to } : {});
}
