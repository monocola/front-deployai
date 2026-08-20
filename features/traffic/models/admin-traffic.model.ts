export type TrafficActivity = "ACTIVE" | "IDLE" | "SLEEPING" | "STOPPED" | "NO_DATA";

const PLATFORM_NAME_MARKERS = [
  "backend-devployer",
  "front-devployer",
  "front-admin",
  "front-deployai",
];

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

export function isPlatformTrafficName(name: string | null | undefined): boolean {
  const lower = (name ?? "").toLowerCase();
  return PLATFORM_NAME_MARKERS.some((marker) => lower.includes(marker));
}

export function isAutoStopEligibleRow(item: AdminApplicationTraffic): boolean {
  if (isPlatformTrafficName(item.name)) return false;
  if (item.autoStopEligible) return true;
  const code = item.planCode?.trim().toUpperCase() ?? "";
  return code === "" || code === "FREE";
}

export function autoStopMinutes(item: AdminApplicationTraffic): number {
  return item.sleepAfterMinutes && item.sleepAfterMinutes > 0
    ? item.sleepAfterMinutes
    : 30;
}
