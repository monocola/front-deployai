export interface AdminCustomer {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  country: string | null;
  enabled: boolean;
  emailVerified: boolean;
  authProvider: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AdminCustomerResourceKind = "application" | "database" | "email" | string;

export interface AdminCustomerResource {
  id: string;
  kind: AdminCustomerResourceKind;
  name: string;
  framework: string | null;
  databaseEngine: string | null;
  planCode: string | null;
  planName: string | null;
  status: string | null;
  blocked: boolean;
  cpu: number | null;
  memoryMb: number | null;
  createdAt: string | null;
}

export interface AdminCustomersOverview {
  customers: AdminCustomer[];
  totalCpu: number;
  totalMemoryMb: number;
  totalResources: number;
}
