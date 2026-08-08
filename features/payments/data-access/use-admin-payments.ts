"use client";

import { useQuery } from "@tanstack/react-query";
import { listAdminPayments } from "@/features/payments/data-access/admin-payments-api";
import type { AdminPaymentsFilters } from "@/features/payments/models/admin-payment.model";

export const adminPaymentsKeys = {
  all: ["admin-payments"] as const,
  overview: (filters: AdminPaymentsFilters) =>
    [
      ...adminPaymentsKeys.all,
      "overview",
      filters.status ?? "",
      filters.fromDate ?? "",
      filters.toDate ?? "",
    ] as const,
};

export function useAdminPayments(filters: AdminPaymentsFilters = {}) {
  return useQuery({
    queryKey: adminPaymentsKeys.overview(filters),
    queryFn: () => listAdminPayments(filters),
  });
}
