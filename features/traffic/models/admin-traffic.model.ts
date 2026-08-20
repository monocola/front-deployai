export type TrafficActivity = "ACTIVE" | "IDLE" | "SLEEPING" | "STOPPED" | "NO_DATA";

export interface AdminApplicationTraffic {
  id: string;
  name: string;
  status: string;
  activity: TrafficActivity;
  framework: string | null;
  primaryDomain: string | null;
  planCode: string | null;
  planName: string | null;
  alwaysOn: boolean;
  sleepAfterMinutes: number | null;
  userEmail: string | null;
  userDisplayName: string | null;
  projectName: string;
  environmentName: string | null;
  receiveBytesPerSecond: number | null;
  transmitBytesPerSecond: number | null;
  lastTrafficAt: string | null;
  trafficSampledAt: string | null;
  sleptAt: string | null;
  idleForSeconds: number | null;
  autoStopEnabled: boolean;
  autoStopEligible: boolean;
}

export interface AdminApplicationTrafficOverview {
  applications: AdminApplicationTraffic[];
  totalApplications: number;
  activeCount: number;
  idleCount: number;
  sleepingCount: number;
  stoppedCount: number;
  noDataCount: number;
  totalReceiveBytesPerSecond: number;
  totalTransmitBytesPerSecond: number;
  activeThresholdBytesPerSecond: number;
  metricsWarning: string | null;
}
