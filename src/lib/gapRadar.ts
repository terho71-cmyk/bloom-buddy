import { ProblemTheme, ProblemThemeId, BloomSummary, Actor, SolutionGap, Severity } from "@/types/bloom";

const THEMES: ProblemTheme[] = [
  {
    id: "early_warning",
    title: "Early Warning & Monitoring",
    description: "Real-time detection and forecasting systems for cyanobacteria blooms",
    coverageTags: ["monitoring", "sensors", "forecasting", "early warning"]
  },
  {
    id: "citizen_communication",
    title: "Citizen Communication & Alerts",
    description: "Public-facing apps and platforms for bloom status and safety information",
    coverageTags: ["communication", "apps", "alerts", "dashboard", "mobile"]
  },
  {
    id: "tourism_safety",
    title: "Tourism & Beach Safety",
    description: "Solutions focused on protecting tourists and recreational water users",
    coverageTags: ["tourism", "safety", "communication", "beach"]
  },
  {
    id: "nutrient_reduction",
    title: "Nutrient Reduction at Source",
    description: "Technologies to reduce phosphorus and nitrogen runoff before it reaches water bodies",
    coverageTags: ["nutrient", "runoff", "remediation", "prevention"]
  },
  {
    id: "in_situ_remediation",
    title: "In-Situ Bloom Treatment",
    description: "Active technologies to treat blooms directly in affected water bodies",
    coverageTags: ["remediation", "treatment", "cleanup", "filtration"]
  },
  {
    id: "farmer_tools",
    title: "Farmer Decision Support",
    description: "Tools helping farmers optimize nutrient management to prevent runoff",
    coverageTags: ["agriculture", "farms", "nutrient", "decision-support", "precision farming"]
  },
  {
    id: "governance_planning",
    title: "Governance & Planning Tools",
    description: "Systems for policy-makers to coordinate regional bloom management",
    coverageTags: ["planning", "policy", "governance", "coordination"]
  },
  {
    id: "data_integration",
    title: "Data Integration & Platform",
    description: "Platforms aggregating bloom data from multiple sources for unified access",
    coverageTags: ["platform", "data", "integration", "api", "aggregation"]
  }
];

function severityToNumber(severity: Severity): number {
  const map = { none: 0, low: 25, medium: 50, high: 100 };
  return map[severity];
}

export function getAllThemes(): ProblemTheme[] {
  return THEMES;
}

export function computeThemeSeverity(
  theme: ProblemTheme,
  summary: BloomSummary
): number {
  const riskLevel = severityToNumber(summary.overallRiskLevel);
  const hotspotCount = summary.hotspots.length;
  const highSeverityHotspots = summary.hotspots.filter(h => h.severity === "high").length;
  const increasingTrends = summary.hotspots.filter(h => h.trend === "increasing").length;
  
  // Tourist area detection
  const touristKeywords = ["beach", "harbour", "harbor", "marina", "camping", "resort", "bay"];
  const touristHotspots = summary.hotspots.filter(h =>
    touristKeywords.some(keyword => h.areaName.toLowerCase().includes(keyword))
  ).length;
  
  let score = 0;
  
  switch (theme.id) {
    case "early_warning":
      // High need when there's any significant risk
      score = riskLevel * 0.6 + (hotspotCount * 5);
      if (increasingTrends > 0) score += 20;
      break;
      
    case "citizen_communication":
      // High need when there are many affected areas
      score = (hotspotCount * 8) + (riskLevel * 0.4);
      if (touristHotspots > 0) score += 25;
      break;
      
    case "tourism_safety":
      // Specific to tourist areas
      score = (touristHotspots * 20) + (riskLevel * 0.3);
      if (summary.overallRiskLevel === "high") score += 20;
      break;
      
    case "nutrient_reduction":
      // High need when trends are increasing or sustained high risk
      score = (increasingTrends * 15) + (riskLevel * 0.5);
      if (highSeverityHotspots >= 3) score += 25;
      break;
      
    case "in_situ_remediation":
      // Need increases with high severity hotspots
      score = (highSeverityHotspots * 20) + (riskLevel * 0.4);
      break;
      
    case "farmer_tools":
      // Related to prevention - need increases with trends
      score = (increasingTrends * 12) + (riskLevel * 0.3);
      if (summary.totalObservations > 15) score += 20;
      break;
      
    case "governance_planning":
      // Need increases with geographical spread
      score = (hotspotCount * 10) + (summary.totalObservations * 2);
      if (hotspotCount > 4) score += 20;
      break;
      
    case "data_integration":
      // Need increases with complexity (many observations and areas)
      score = (summary.totalObservations * 3) + (hotspotCount * 8);
      break;
  }
  
  return Math.min(100, Math.round(score));
}

export function computeThemeCoverage(
  theme: ProblemTheme,
  startups: Actor[]
): number {
  let coverage = 0;
  let maxPossibleScore = 100;
  
  for (const startup of startups) {
    if (startup.type !== "startup") continue;
    
    // Count matching tags
    const matchingTags = startup.tags.filter(tag =>
      theme.coverageTags.some(coverageTag =>
        tag.toLowerCase().includes(coverageTag.toLowerCase()) ||
        coverageTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
    
    if (matchingTags.length > 0) {
      // Base contribution
      let contribution = matchingTags.length * 10;
      
      // Weight by TRL level if available
      if (startup.startupDetails?.trlLevel) {
        const trlBonus = startup.startupDetails.trlLevel * 2;
        contribution += trlBonus;
      }
      
      coverage += contribution;
    }
  }
  
  // Normalize to 0-100 scale
  // Assume ~3 strong startups = full coverage
  const normalized = Math.min(100, (coverage / maxPossibleScore) * 100);
  
  return Math.round(normalized);
}

export function buildSolutionGap(
  theme: ProblemTheme,
  summary: BloomSummary,
  startups: Actor[]
): SolutionGap {
  const severityScore = computeThemeSeverity(theme, summary);
  const coverageScore = computeThemeCoverage(theme, startups);
  const gapScore = Math.round(severityScore * (1 - coverageScore / 100));
  
  // Build summary text
  let summaryText = "";
  if (gapScore > 70) {
    summaryText = `Critical gap: ${theme.title.toLowerCase()} is urgently needed in ${summary.region}, but startup coverage is minimal (${coverageScore}%). `;
  } else if (gapScore > 40) {
    summaryText = `Significant opportunity: ${summary.region} shows strong need for ${theme.title.toLowerCase()}, with limited current solutions (${coverageScore}% coverage). `;
  } else {
    summaryText = `Moderate gap: ${theme.title.toLowerCase()} could strengthen the ecosystem in ${summary.region}. `;
  }
  
  summaryText += `Current bloom severity is ${summary.overallRiskLevel} with ${summary.hotspots.length} affected areas.`;
  
  // Build drivers
  const drivers: string[] = [];
  
  if (severityScore > 70) {
    drivers.push(`High need indicated: severity score ${severityScore}/100 based on current bloom situation`);
  } else if (severityScore > 40) {
    drivers.push(`Moderate need: severity score ${severityScore}/100 from bloom analysis`);
  }
  
  if (coverageScore < 30) {
    const matchingStartups = startups.filter(s => 
      s.type === "startup" && s.tags.some(tag =>
        theme.coverageTags.some(ct => tag.toLowerCase().includes(ct.toLowerCase()))
      )
    );
    if (matchingStartups.length === 0) {
      drivers.push(`No startups currently addressing this theme`);
    } else {
      drivers.push(`Only ${matchingStartups.length} startup${matchingStartups.length > 1 ? 's' : ''} with relevant capabilities`);
    }
  } else if (coverageScore < 60) {
    drivers.push(`Limited startup coverage (${coverageScore}%) - room for additional solutions`);
  }
  
  // Add specific drivers based on bloom situation
  const highSeverityHotspots = summary.hotspots.filter(h => h.severity === "high").length;
  if (highSeverityHotspots >= 2) {
    drivers.push(`${highSeverityHotspots} high-severity hotspots require attention: ${summary.hotspots.filter(h => h.severity === "high").map(h => h.areaName).slice(0, 2).join(", ")}`);
  }
  
  const increasingTrends = summary.hotspots.filter(h => h.trend === "increasing").length;
  if (increasingTrends > 0) {
    drivers.push(`${increasingTrends} area${increasingTrends > 1 ? 's show' : ' shows'} increasing bloom trends`);
  }
  
  // Theme-specific drivers
  const touristKeywords = ["beach", "harbour", "harbor", "marina", "camping", "resort", "bay"];
  const touristHotspots = summary.hotspots.filter(h =>
    touristKeywords.some(keyword => h.areaName.toLowerCase().includes(keyword))
  );
  
  if ((theme.id === "tourism_safety" || theme.id === "citizen_communication") && touristHotspots.length > 0) {
    drivers.push(`Tourist and recreational areas affected: ${touristHotspots.map(h => h.areaName).slice(0, 2).join(", ")}`);
  }
  
  return {
    theme,
    severityScore,
    coverageScore,
    gapScore,
    summary: summaryText,
    drivers: drivers.slice(0, 5) // Max 5 drivers
  };
}

export function buildGapRadar(
  summary: BloomSummary,
  startups: Actor[]
): SolutionGap[] {
  const allThemes = getAllThemes();
  const gaps = allThemes.map(theme => buildSolutionGap(theme, summary, startups));
  
  // Filter out low-score gaps and sort by gap score
  return gaps
    .filter(gap => gap.gapScore >= 15)
    .sort((a, b) => b.gapScore - a.gapScore);
}
