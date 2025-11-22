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

export type EnvironmentType = "coastal" | "lakes" | "rivers" | "ports" | "farms" | "urban";

export interface StartupDetails {
  trlLevel?: number; // 1–9
  targetEnvironments: EnvironmentType[];
  typicalCustomer: string;
  deploymentScale: string;
  priceRange: string; // e.g. "€", "€€", "€€€"
  keyBenefits: string[];
  exampleUseCase: string;
}

export interface Actor {
  id: string;
  name: string;
  type: "startup" | "investor";
  country: string;
  tags: string[];
  description: string;
  url: string;
  startupDetails?: StartupDetails;
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

export interface PitchSlide {
  title: string;
  bullets: string[];
}

export interface PitchSnippet {
  problemSlide: PitchSlide;
  solutionSlide: PitchSlide;
}

export type FitLabel = "Low" | "Medium" | "High";

export interface ProblemFitScore {
  score: number;        // 0–100
  label: FitLabel;
  explanation: string;
  drivers: string[];    // bullet reasons
}

export interface ImpactSimulationInput {
  region: string;
  startWeek: number;
  durationWeeks: number; // e.g. 4, 8, 12
  deploymentIntensity: "low" | "medium" | "high";
}

export interface RiskPoint {
  weekOffset: number;   // 0 = startWeek
  baselineRisk: number; // 0–100 normalized
  withSolutionRisk: number; // 0–100 normalized
}

export interface ImpactSimulationResult {
  region: string;
  startWeek: number;
  durationWeeks: number;
  actorId: string;
  points: RiskPoint[];
  headline: string;       // short summary, e.g. "20% fewer high-risk weeks"
  notes: string[];        // bullet points explaining assumptions
}

export interface BulletinResponse {
  citizenBulletin: string;
  expertNote: string;
}
