import { apiClient } from "@/core/api/api-client.service";
import { apiEndpoints } from "@/core/api/api-endpoints";
import type {
  AdminCustomerResource,
  AdminCustomersOverview,
} from "@/features/customers/models/admin-customer.model";

export async function listAdminCustomers(query?: string): Promise<AdminCustomersOverview> {
  const search = new URLSearchParams();
  if (query?.trim()) search.set("q", query.trim());
  const qs = search.toString();
  const path = qs
    ? `${apiEndpoints.adminCustomers.list()}?${qs}`
    : apiEndpoints.adminCustomers.list();
  return apiClient.get(path);
}

export function listAdminCustomerResources(
  userId: string
): Promise<AdminCustomerResource[]> {
  return apiClient.get(apiEndpoints.adminCustomers.resources(userId));
}
