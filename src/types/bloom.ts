export type Severity = "none" | "low" | "medium" | "high";

export interface BloomObservation {
  id: string;
  region: string;
  areaName: string;
  lat: number;
  lon: number;
  date: string;
  week: number;
  severity: Severity;
}

export interface BloomSummary {
  region: string;
  week: number;
  totalObservations: number;
  hotspots: {
    areaName: string;
    severity: Severity;
    observationCount: number;
    trend: "increasing" | "decreasing" | "stable" | "unknown";
  }[];
  safeAreas: string[];
  overallRiskLevel: Severity;
  keyMessages: string[];
}

export interface Actor {
  id: string;
  name: string;
  type: "startup" | "investor";
  country: string;
  tags: string[];
  description: string;
  url: string;
}

export interface Recommendation {
  theme: string;
  explanation: string;
  actors: Actor[];
}

export interface PilotOpportunity {
  pilotTitle: string;
  objective: string;
  whyNow: string;
  keySteps: string[];
  successMetrics: string[];
}

export interface BulletinResponse {
  citizenBulletin: string;
  expertNote: string;
}
