export interface AdminCoolifyOrphanResource {
  coolifyUuid: string;
  kind: "application" | "database" | string;
  name: string;
  status: string | null;
  primaryDomain: string | null;
  gitRepository: string | null;
  gitBranch: string | null;
  buildPack: string | null;
  databaseEngine: string | null;
  portsExposes: string | null;
}

export interface AdminCoolifyOrphansOverview {
  applications: AdminCoolifyOrphanResource[];
  databases: AdminCoolifyOrphanResource[];
  totalApplications: number;
  totalDatabases: number;
}
