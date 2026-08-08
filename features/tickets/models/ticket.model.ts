export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type SupportTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface SupportTicketAttachment {
  id: string;
  messageId: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  downloadPath: string;
}

export interface SupportTicketMessage {
  id: string;
  authorUserId: string;
  authorRole: "USER" | "MANAGER";
  authorDisplayName: string;
  body: string;
  createdAt: string;
  attachments: SupportTicketAttachment[];
}

export interface SupportTicketSummary {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  messageCount: number;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketDetail extends SupportTicketSummary {
  description: string;
  closedAt: string | null;
  messages: SupportTicketMessage[];
  attachments: SupportTicketAttachment[];
}

export interface PaginatedTickets {
  items: SupportTicketSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
