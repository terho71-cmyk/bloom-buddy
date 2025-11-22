import { 
  BloomSummary, 
  Actor, 
  InvestorSituationRelevance, 
  DealFlowItem, 
  PortfolioFitInsight, 
  UnderServedTheme, 
  InvestorViewSummary,
  RelevanceLabel,
  Severity
} from "@/types/bloom";
import { computeProblemFitScore } from "./fitScore";

function severityToBaseScore(severity: Severity): number {
  switch (severity) {
    case "high": return 70;
    case "medium": return 55;
    case "low": return 40;
    case "none": return 20;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreToLabel(score: number): RelevanceLabel {
  if (score >= 75) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

export function computeSituationRelevance(
  summary: BloomSummary,
  investor: Actor
): InvestorSituationRelevance {
  let score = severityToBaseScore(summary.overallRiskLevel);
  
  const investorDetails = investor.investorDetails;
  
  if (investorDetails) {
    // Focus tags bonus
    const waterTechFocus = investorDetails.focusTags.some(tag => 
      ["blue-economy", "water-tech", "climate", "ocean-tech"].includes(tag.toLowerCase())
    );
    if (waterTechFocus) score += 15;
    
    // Geography match (simplified heuristic)
    const isNordicRegion = summary.region.toLowerCase().includes("turku") || 
                           summary.region.toLowerCase().includes("finland") ||
                           summary.region.toLowerCase().includes("nordic");
    const hasNordicFocus = investorDetails.geographyFocus.includes("nordics");
    const hasEuropeFocus = investorDetails.geographyFocus.includes("europe");
    
    if (isNordicRegion && hasNordicFocus) score += 10;
    else if (hasEuropeFocus) score += 5;
  }
  
  // High severity situations are more interesting
  if (summary.overallRiskLevel === "high" && summary.hotspots.length > 3) {
    score += 10;
  }
  
  score = clamp(score, 0, 100);
  const label = scoreToLabel(score);
  
  // Generate explanation
  let explanation = `${summary.region} (week ${summary.week}) shows ${summary.overallRiskLevel} cyanobacteria risk`;
  
  if (label === "High") {
    explanation += `, representing a significant opportunity for blue economy investments. With ${summary.hotspots.length} active hotspots, this situation aligns strongly with water-tech and climate solutions.`;
  } else if (label === "Medium") {
    explanation += `, presenting moderate investment opportunities in water quality monitoring and management solutions.`;
  } else {
    explanation += `, indicating limited immediate investment urgency, though preventative solutions may still be relevant.`;
  }
  
  return {
    score,
    label,
    explanation
  };
}

export function buildDealFlow(
  summary: BloomSummary,
  investor: Actor,
  allActors: Actor[]
): DealFlowItem[] {
  const startups = allActors.filter(a => a.type === "startup");
  const investorDetails = investor.investorDetails;
  
  // Calculate fit scores for all startups
  const scoredStartups = startups.map(startup => {
    const fitScore = computeProblemFitScore(summary, startup);
    
    // Bonus points for alignment with investor focus
    let adjustedScore = fitScore.score;
    if (investorDetails) {
      const tagOverlap = startup.tags.filter(tag => 
        investorDetails.focusTags.some(focusTag => 
          tag.toLowerCase().includes(focusTag.toLowerCase()) ||
          focusTag.toLowerCase().includes(tag.toLowerCase())
        )
      ).length;
      adjustedScore += tagOverlap * 5;
    }
    
    adjustedScore = clamp(adjustedScore, 0, 100);
    
    // Generate reasons
    const reasons: string[] = [];
    
    if (fitScore.label === "High") {
      reasons.push("Strong match for current bloom situation");
    }
    
    if (investorDetails) {
      const hasSharedTags = startup.tags.some(tag => 
        investorDetails.focusTags.some(ft => tag.toLowerCase().includes(ft.toLowerCase()))
      );
      if (hasSharedTags) {
        reasons.push("Aligned with your investment thesis");
      }
      
      const complementsPortfolio = startup.tags.some(tag => 
        !investorDetails.portfolioTags.includes(tag)
      );
      if (complementsPortfolio) {
        reasons.push("Expands portfolio coverage into new areas");
      }
    }
    
    if (startup.startupDetails) {
      const details = startup.startupDetails;
      if (details.trlLevel && details.trlLevel >= 6) {
        reasons.push("Advanced technology readiness (TRL 6+)");
      }
      
      if (details.targetEnvironments.includes("coastal") && summary.region.toLowerCase().includes("coast")) {
        reasons.push("Perfect environmental fit for this region");
      }
    }
    
    // Add at least one reason if none were generated
    if (reasons.length === 0) {
      reasons.push("Relevant solution for water quality challenges");
    }
    
    return {
      startup,
      fitScore: adjustedScore,
      fitLabel: scoreToLabel(adjustedScore),
      reasons: reasons.slice(0, 3) // max 3 reasons
    };
  });
  
  // Sort by adjusted score and take top 8
  return scoredStartups
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 8);
}

export function derivePortfolioInsights(
  investor: Actor,
  dealFlow: DealFlowItem[]
): PortfolioFitInsight[] {
  const insights: PortfolioFitInsight[] = [];
  const investorDetails = investor.investorDetails;
  
  if (!investorDetails || dealFlow.length === 0) {
    return insights;
  }
  
  // Analyze tag coverage
  const portfolioTags = investorDetails.portfolioTags;
  const dealFlowTags = new Set(dealFlow.flatMap(item => item.startup.tags));
  
  // Find new coverage areas
  const newTags = Array.from(dealFlowTags).filter(tag => !portfolioTags.includes(tag));
  
  if (newTags.length > 0) {
    const examples = newTags.slice(0, 2).join(" and ");
    insights.push({
      text: `Extends your portfolio into ${examples}, currently under-represented in your holdings.`
    });
  }
  
  // Find complementary capabilities
  const hasMonitoring = portfolioTags.some(t => t.toLowerCase().includes("monitor") || t.toLowerCase().includes("sensor"));
  const hasCommunication = dealFlowTags.has("communication") || Array.from(dealFlowTags).some(t => t.includes("app"));
  
  if (hasMonitoring && hasCommunication) {
    insights.push({
      text: "Complements your existing monitoring/sensor focus with citizen communication and alert capabilities."
    });
  }
  
  // Find remediation opportunities
  const hasRemediation = Array.from(dealFlowTags).some(t => t.toLowerCase().includes("remediation") || t.toLowerCase().includes("nutrient"));
  const portfolioHasRemediation = portfolioTags.some(t => t.toLowerCase().includes("remediation"));
  
  if (hasRemediation && !portfolioHasRemediation) {
    insights.push({
      text: "Adds long-term remediation and nutrient management solutions, moving beyond monitoring into active intervention."
    });
  }
  
  // Diversification insight
  if (insights.length === 0) {
    insights.push({
      text: "These startups provide good diversification across monitoring, communication, and remediation themes."
    });
  }
  
  return insights.slice(0, 3); // max 3 insights
}

export function findUnderServedThemes(
  summary: BloomSummary,
  allActors: Actor[]
): UnderServedTheme[] {
  const themes: UnderServedTheme[] = [];
  const startups = allActors.filter(a => a.type === "startup");
  const allTags = startups.flatMap(s => s.tags);
  
  // Theme: Remediation
  const remediationCount = allTags.filter(t => 
    t.toLowerCase().includes("remediation") || t.toLowerCase().includes("nutrient")
  ).length;
  
  if (summary.overallRiskLevel === "high" && remediationCount < 3) {
    themes.push({
      theme: "Remediation & Nutrient Reduction",
      description: "Long-term solutions to reduce nutrient loads and prevent future blooms",
      reason: `High bloom risk detected, but only ${remediationCount} startup(s) focused on active remediation`
    });
  }
  
  // Theme: Communication
  const communicationCount = allTags.filter(t => 
    t.toLowerCase().includes("communication") || t.toLowerCase().includes("app") || t.toLowerCase().includes("alert")
  ).length;
  
  const hasCoastalHotspots = summary.hotspots.some(h => 
    h.severity === "high" && h.observationCount > 2
  );
  
  if (hasCoastalHotspots && communicationCount < 2) {
    themes.push({
      theme: "Citizen Communication & Tourism Safety",
      description: "Real-time alerts and information systems for beach-goers and tourism operators",
      reason: `Multiple coastal hotspots affecting public areas, but only ${communicationCount} startup(s) in citizen communication`
    });
  }
  
  // Theme: AI/Prediction
  const aiPredictionCount = allTags.filter(t => 
    t.toLowerCase().includes("ai") || t.toLowerCase().includes("predict") || t.toLowerCase().includes("forecast")
  ).length;
  
  if (aiPredictionCount === 0) {
    themes.push({
      theme: "AI-Powered Bloom Prediction",
      description: "Machine learning models for early warning and risk forecasting",
      reason: "No startups currently applying AI/ML to bloom prediction in this dataset"
    });
  }
  
  return themes.slice(0, 3); // max 3 themes
}

export function buildInvestorViewSummary(
  summary: BloomSummary,
  investor: Actor,
  allActors: Actor[]
): InvestorViewSummary {
  const situationRelevance = computeSituationRelevance(summary, investor);
  const topDealFlow = buildDealFlow(summary, investor, allActors);
  const portfolioInsights = derivePortfolioInsights(investor, topDealFlow);
  const underServedThemes = findUnderServedThemes(summary, allActors);
  
  return {
    situationRelevance,
    topDealFlow,
    portfolioInsights,
    underServedThemes
  };
}
