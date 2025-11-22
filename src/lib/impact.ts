import { BloomSummary, Actor, ImpactSimulationInput, ImpactSimulationResult, RiskPoint, Severity } from "@/types/bloom";

function severityToBaselineRisk(severity: Severity): number {
  switch (severity) {
    case "none": return 10;
    case "low": return 30;
    case "medium": return 60;
    case "high": return 80;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function simulateImpact(
  summary: BloomSummary,
  actor: Actor,
  input: ImpactSimulationInput
): ImpactSimulationResult {
  const { region, startWeek, durationWeeks, deploymentIntensity } = input;
  
  // Base risk from current summary
  const baseRisk = severityToBaselineRisk(summary.overallRiskLevel);
  
  // Determine if hotspots are trending up
  const increasingTrend = summary.hotspots.filter(h => h.trend === "increasing").length > summary.hotspots.length / 2;
  
  // Max reduction based on deployment intensity
  const maxReductionMap = {
    low: 0.1,      // up to 10% reduction
    medium: 0.25,  // up to 25% reduction
    high: 0.4      // up to 40% reduction
  };
  
  let maxReduction = maxReductionMap[deploymentIntensity];
  
  // Adjust based on startup tags
  const tags = actor.tags || [];
  const hasRemediation = tags.some(t => t.toLowerCase().includes("remediation") || t.toLowerCase().includes("nutrient"));
  const hasMonitoring = tags.some(t => t.toLowerCase().includes("monitoring") || t.toLowerCase().includes("sensor"));
  
  if (hasRemediation) {
    maxReduction += 0.05; // remediation has stronger long-term effect
  }
  
  // Generate risk points
  const points: RiskPoint[] = [];
  
  for (let weekOffset = 0; weekOffset < durationWeeks; weekOffset++) {
    // Baseline risk with slight variation
    let baselineRisk = baseRisk;
    
    if (increasingTrend && weekOffset < durationWeeks / 2) {
      // Risk increasing in early weeks
      baselineRisk += weekOffset * 3;
    } else if (!increasingTrend) {
      // Stable or decreasing, add small random variation
      baselineRisk += Math.sin(weekOffset) * 5;
    }
    
    baselineRisk = clamp(baselineRisk, 0, 100);
    
    // With-solution risk
    let reductionFactor = 0;
    
    if (durationWeeks > 1) {
      // Gradual effect over time
      reductionFactor = maxReduction * (weekOffset / (durationWeeks - 1));
    } else {
      reductionFactor = maxReduction;
    }
    
    // For monitoring solutions, reduce peaks more strongly
    let withSolutionRisk: number;
    if (hasMonitoring) {
      // Monitoring helps more when risk is high
      const peakReductionBonus = baselineRisk > 60 ? 0.1 : 0;
      withSolutionRisk = baselineRisk * (1 - reductionFactor - peakReductionBonus);
    } else {
      withSolutionRisk = baselineRisk * (1 - reductionFactor);
    }
    
    withSolutionRisk = clamp(withSolutionRisk, 0, 100);
    
    points.push({
      weekOffset,
      baselineRisk: Math.round(baselineRisk),
      withSolutionRisk: Math.round(withSolutionRisk)
    });
  }
  
  // Calculate stats
  const avgBaseline = points.reduce((sum, p) => sum + p.baselineRisk, 0) / points.length;
  const avgWithSolution = points.reduce((sum, p) => sum + p.withSolutionRisk, 0) / points.length;
  const reductionPercent = Math.round(((avgBaseline - avgWithSolution) / avgBaseline) * 100);
  
  const significantReductionWeeks = points.filter(p => p.baselineRisk - p.withSolutionRisk >= 15).length;
  
  // Generate headline
  let headline: string;
  if (reductionPercent >= 25) {
    headline = `~${reductionPercent}% lower average risk over ${durationWeeks} weeks`;
  } else if (significantReductionWeeks > 0) {
    headline = `${deploymentIntensity.charAt(0).toUpperCase() + deploymentIntensity.slice(1)}-intensity deployment avoids ${significantReductionWeeks} high-risk week${significantReductionWeeks > 1 ? 's' : ''} in this scenario`;
  } else {
    headline = `Modest ~${reductionPercent}% risk reduction over ${durationWeeks} weeks`;
  }
  
  // Generate notes
  const notes: string[] = [
    "Toy model based on current risk level and startup focus (monitoring/remediation).",
    "Assumes gradual effect over the chosen duration.",
    "Designed for comparative storytelling, not scientific forecasting."
  ];
  
  if (hasRemediation) {
    notes.push("Remediation solutions show stronger long-term cumulative effects.");
  }
  
  if (hasMonitoring) {
    notes.push("Monitoring solutions are especially effective at reducing peak risk periods.");
  }
  
  return {
    region,
    startWeek,
    durationWeeks,
    actorId: actor.id,
    points,
    headline,
    notes
  };
}
