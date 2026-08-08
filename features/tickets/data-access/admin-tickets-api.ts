import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type {
  PaginatedTickets,
  SupportTicketDetail,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/features/tickets/models/ticket.model";

export async function listAdminTickets(params?: {
  status?: SupportTicketStatus | "";
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedTickets> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.q) search.set("q", params.q);
  search.set("page", String(params?.page ?? 1));
  search.set("pageSize", String(params?.pageSize ?? 20));
  const qs = search.toString();
  return apiClient.get(`${apiEndpoints.adminSupport.tickets()}?${qs}`);
}

export async function getAdminTicket(ticketId: string): Promise<SupportTicketDetail> {
  return apiClient.get(apiEndpoints.adminSupport.ticket(ticketId));
}

export async function updateAdminTicket(
  ticketId: string,
  payload: { status?: SupportTicketStatus; priority?: SupportTicketPriority }
): Promise<SupportTicketDetail> {
  return apiClient.patch(apiEndpoints.adminSupport.ticket(ticketId), payload);
}

export async function replyAdminTicket(
  ticketId: string,
  body: string,
  files: File[]
): Promise<SupportTicketDetail> {
  const formData = new FormData();
  formData.append("body", body);
  for (const file of files) {
    formData.append("files", file, file.name);
  }
  return apiClient.postFormData(apiEndpoints.adminSupport.messages(ticketId), formData);
}

export async function downloadAdminAttachment(
  ticketId: string,
  attachmentId: string,
  fallbackName: string
): Promise<void> {
  const { blob, fileName } = await fetchAdminAttachmentBlob(ticketId, attachmentId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function fetchAdminAttachmentBlob(
  ticketId: string,
  attachmentId: string
): Promise<{ blob: Blob; fileName: string | null }> {
  return apiClient.downloadBlob(
    apiEndpoints.adminSupport.attachmentDownload(ticketId, attachmentId)
  );
}
