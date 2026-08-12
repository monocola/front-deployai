export interface AdminUserEnvironment {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  status: string | null;
}

export interface AdminUserProject {
  id: string;
  name: string;
  slug: string;
  status: string | null;
  environments: AdminUserEnvironment[];
}
