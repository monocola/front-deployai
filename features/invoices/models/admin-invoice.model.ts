export type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED";
export type InvoiceStatusFilter = "" | InvoiceStatus;
export type InvoiceResourceKind = "application" | "database" | "email";

export interface AdminInvoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userEmail: string | null;
  userDisplayName: string | null;
  companyName: string | null;
  organizationId: string | null;
  planId: string | null;
  planCode: string | null;
  planName: string | null;
  resourceId: string | null;
  resourceName: string | null;
  resourceKind: InvoiceResourceKind | null;
  concept: string;
  amountCents: number;
  currency: string;
  sourceAmountUsdCents: number | null;
  exchangeRateDate: string | null;
  usdToPenRate: number | null;
  status: InvoiceStatus;
  paymentId: string | null;
  paymentOrderNumber: string | null;
  dueDate: string | null;
  issuedAt: string;
  paidAt: string | null;
  receiptSentAt: string | null;
  receiptSentTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceBillableResource {
  resourceId: string;
  resourceKind: InvoiceResourceKind;
  resourceName: string;
  planCode: string | null;
  planName: string | null;
  suggestedAmountCents: number;
  sourceAmountUsdCents: number | null;
  suggestedConcept: string;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
  needsInvoice: boolean;
  billingStatus: string;
  existingInvoiceNumber: string | null;
}

export interface AdminInvoicePreview {
  userId: string;
  userEmail: string;
  userDisplayName: string | null;
  companyName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  emails: string[];
  currency: string;
  exchangeRateDate: string | null;
  usdToPenRate: number | null;
  paidResourceCount: number;
  dueResourceCount: number;
  resources: InvoiceBillableResource[];
}

export interface AdminInvoiceCustomer {
  id: string;
  email: string;
  displayName: string | null;
  companyName: string | null;
}

export interface AdminInvoicesOverview {
  invoices: AdminInvoice[];
  totalCount: number;
  pendingCount: number;
  paidCount: number;
  pendingAmountCents: number;
  paidAmountCents: number;
  currency: string;
  paidResourceCount: number;
  dueResourceCount: number;
  generatedInvoiceCount: number;
  paidInvoiceCount: number;
}

export interface AdminInvoicesFilters {
  status?: InvoiceStatusFilter;
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CreateInvoiceItemPayload {
  resourceId: string;
  resourceKind: InvoiceResourceKind;
  concept?: string;
  amountCents?: number;
}

export interface CreateInvoicePayload {
  userId: string;
  items: CreateInvoiceItemPayload[];
  dueDate?: string;
}

export interface UpdateInvoicePayload {
  concept?: string;
  amountCents?: number;
  sourceAmountUsdCents?: number;
  dueDate?: string;
}
