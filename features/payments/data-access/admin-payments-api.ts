import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type {
  AdminPaymentsFilters,
  AdminPaymentsOverview,
} from "@/features/payments/models/admin-payment.model";

export async function listAdminPayments(
  params?: AdminPaymentsFilters
): Promise<AdminPaymentsOverview> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  const qs = search.toString();
  const path = qs
    ? `${apiEndpoints.adminPayments.overview()}?${qs}`
    : apiEndpoints.adminPayments.overview();
  return apiClient.get(path);
}
