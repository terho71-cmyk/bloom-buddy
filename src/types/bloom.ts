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

export type StageFocus = "pre-seed" | "seed" | "series-a" | "growth";
export type GeographyFocus = "nordics" | "europe" | "global";

export interface StartupDetails {
  trlLevel?: number; // 1–9
  targetEnvironments: EnvironmentType[];
  typicalCustomer: string;
  deploymentScale: string;
  priceRange: string; // e.g. "€", "€€", "€€€"
  keyBenefits: string[];
  exampleUseCase: string;
}

export interface InvestorDetails {
  stageFocus: StageFocus[];
  geographyFocus: GeographyFocus[];
  focusTags: string[];        // e.g. ["blue-economy", "water-tech", "climate", "deeptech"]
  portfolioTags: string[];    // themes they already have in portfolio
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
  investorDetails?: InvestorDetails;
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

export type RelevanceLabel = "Low" | "Medium" | "High";

export interface InvestorSituationRelevance {
  score: number;           // 0–100
  label: RelevanceLabel;
  explanation: string;     // 1–3 sentences
}

export interface DealFlowItem {
  startup: Actor;          // type === "startup"
  fitScore: number;        // reuse Problem Fit Score or similar
  fitLabel: RelevanceLabel;
  reasons: string[];       // short bullet reasons
}

export interface PortfolioFitInsight {
  text: string;            // e.g. "Complements your portfolio focus on sensors with citizen communication tools."
}

export interface UnderServedTheme {
  theme: string;           // e.g. "Nutrient sequestration for farms"
  description: string;
  reason: string;          // why it's under-served (few/no startups, high risk)
}

export interface InvestorViewSummary {
  situationRelevance: InvestorSituationRelevance;
  topDealFlow: DealFlowItem[];
  portfolioInsights: PortfolioFitInsight[];
  underServedThemes: UnderServedTheme[];
}

export type AlertUseCase = "pilot" | "sales" | "investor";

export interface StartupAlertConditions {
  minOverallRisk?: Severity;             // e.g. at least "medium"
  maxOverallRisk?: Severity;             // optional upper bound
  minHighSeverityHotspots?: number;      // e.g. ≥ 3 high severity hotspots
  requireIncreasingTrend?: boolean;      // at least one hotspot with trend === "increasing"
  requireTouristAreasHint?: boolean;     // use areaName heuristics
}

export interface StartupAlertRule {
  id: string;
  name: string;
  description: string;
  useCase: AlertUseCase;
  conditions: StartupAlertConditions;
  isActive: boolean;
}

export interface PerfectWeekMatch {
  region: string;
  week: number;
  ruleId: string;
  ruleName: string;
  reason: string;
}

export interface PerfectWeekOverview {
  startupId: string;
  region: string;
  matches: PerfectWeekMatch[];
}

export interface BulletinResponse {
  citizenBulletin: string;
  expertNote: string;
}
