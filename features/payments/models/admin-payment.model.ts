export type PaymentStatusFilter = "" | "PAID" | "FAILED" | "PENDING";

export interface AdminPaymentsFilters {
  status?: PaymentStatusFilter;
  fromDate?: string;
  toDate?: string;
}

export interface AdminPayment {
  id: string;
  status: string;
  provisioningStatus: string;
  amountCents: number;
  currency: string;
  sourceAmountUsdCents: number | null;
  planId: string | null;
  planCode: string | null;
  planName: string | null;
  databasePlanCode: string | null;
  emailPlanCode: string | null;
  intendedResourceName: string | null;
  resourceId: string | null;
  gatewayTransactionId: string | null;
  orderNumber: string | null;
  userId: string;
  userEmail: string | null;
  userDisplayName: string | null;
  companyName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentsOverview {
  payments: AdminPayment[];
  totalCount: number;
  paidCount: number;
  failedCount: number;
  totalAmountCents: number;
  currency: string;
}
