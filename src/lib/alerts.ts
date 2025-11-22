import { BloomSummary, StartupAlertRule, PerfectWeekMatch, PerfectWeekOverview, Severity } from "@/types/bloom";

function severityToLevel(severity: Severity): number {
  const levels = { none: 0, low: 1, medium: 2, high: 3 };
  return levels[severity];
}

export function doesSummaryMatchRule(
  summary: BloomSummary,
  rule: StartupAlertRule
): { matches: boolean; reason: string | null } {
  const { conditions } = rule;
  const reasons: string[] = [];
  
  // Check min overall risk
  if (conditions.minOverallRisk) {
    const requiredLevel = severityToLevel(conditions.minOverallRisk);
    const actualLevel = severityToLevel(summary.overallRiskLevel);
    if (actualLevel < requiredLevel) {
      return { matches: false, reason: null };
    }
    reasons.push(`${summary.overallRiskLevel} overall risk`);
  }
  
  // Check max overall risk
  if (conditions.maxOverallRisk) {
    const maxLevel = severityToLevel(conditions.maxOverallRisk);
    const actualLevel = severityToLevel(summary.overallRiskLevel);
    if (actualLevel > maxLevel) {
      return { matches: false, reason: null };
    }
  }
  
  // Check min high severity hotspots
  if (conditions.minHighSeverityHotspots !== undefined) {
    const highSeverityCount = summary.hotspots.filter(h => h.severity === "high").length;
    if (highSeverityCount < conditions.minHighSeverityHotspots) {
      return { matches: false, reason: null };
    }
    reasons.push(`${highSeverityCount} high-severity hotspot${highSeverityCount > 1 ? 's' : ''}`);
  }
  
  // Check increasing trend requirement
  if (conditions.requireIncreasingTrend) {
    const hasIncreasing = summary.hotspots.some(h => h.trend === "increasing");
    if (!hasIncreasing) {
      return { matches: false, reason: null };
    }
    reasons.push("risk trending upwards");
  }
  
  // Check tourist areas hint
  if (conditions.requireTouristAreasHint) {
    const touristKeywords = ["beach", "harbour", "harbor", "marina", "camping", "resort", "bay"];
    const hasTouristArea = summary.hotspots.some(h => 
      touristKeywords.some(keyword => h.areaName.toLowerCase().includes(keyword))
    );
    if (!hasTouristArea) {
      return { matches: false, reason: null };
    }
    reasons.push("affecting tourist areas");
  }
  
  // All conditions passed
  const reason = reasons.length > 0 
    ? reasons.join(", ") + "."
    : "Matches alert conditions.";
    
  return { matches: true, reason };
}

export function findPerfectWeeksForStartup(
  summaries: BloomSummary[],
  rules: StartupAlertRule[],
  startupId: string,
  region: string
): PerfectWeekOverview {
  const matches: PerfectWeekMatch[] = [];
  const activeRules = rules.filter(r => r.isActive);
  
  for (const summary of summaries) {
    for (const rule of activeRules) {
      const result = doesSummaryMatchRule(summary, rule);
      if (result.matches) {
        matches.push({
          region: summary.region,
          week: summary.week,
          ruleId: rule.id,
          ruleName: rule.name,
          reason: result.reason || "Matches alert conditions"
        });
      }
    }
  }
  
  return {
    startupId,
    region,
    matches
  };
}
