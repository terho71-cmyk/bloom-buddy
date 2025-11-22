import { BloomSummary, Actor, ClusterTheme, CollaborationCluster, ClusterThemeId } from "@/types/bloom";
import { computeProblemFitScore } from "./fitScore";

/**
 * Get predefined cluster themes
 */
export function getClusterThemes(): ClusterTheme[] {
  return [
    {
      id: "early_warning_pack",
      title: "Early Warning & Monitoring Pack",
      description: "Comprehensive bloom detection and tracking system",
      desiredTags: ["monitoring", "sensors", "forecasting", "alerts", "early warning", "iot", "satellite"]
    },
    {
      id: "tourism_safety_pack",
      title: "Tourism Safety Pack",
      description: "Protect tourists and beachgoers with timely information",
      desiredTags: ["communication", "apps", "tourism", "alerts", "safety", "dashboard", "citizen science"]
    },
    {
      id: "nutrient_management_pack",
      title: "Nutrient Management Pack",
      description: "Reduce nutrient loads and prevent blooms at source",
      desiredTags: ["nutrient", "remediation", "agriculture", "farms", "biotech", "nutrient reduction"]
    },
    {
      id: "citizen_comms_pack",
      title: "Citizen Communication Pack",
      description: "Keep communities informed and engaged",
      desiredTags: ["communication", "apps", "dashboard", "alerts", "decision support", "data visualization", "citizen science"]
    },
    {
      id: "planning_and_policy_pack",
      title: "Planning & Policy Pack",
      description: "Data-driven governance and strategic planning",
      desiredTags: ["planning", "governance", "data", "integration", "decision support", "platform", "api"]
    }
  ];
}

/**
 * Build collaboration clusters for a given bloom situation
 */
export function buildClustersForSituation(
  summary: BloomSummary,
  startups: Actor[]
): CollaborationCluster[] {
  const themes = getClusterThemes();
  const clusters: CollaborationCluster[] = [];

  for (const theme of themes) {
    // Score each startup for this theme
    const scoredStartups = startups.map(startup => {
      const tags = startup.tags.map(t => t.toLowerCase());
      
      // Tag overlap score
      const matchingTags = tags.filter(t => 
        theme.desiredTags.some(dt => t.includes(dt) || dt.includes(t))
      );
      const tagScore = matchingTags.length * 10;
      
      // Problem fit score
      const fitScore = computeProblemFitScore(summary, startup);
      
      // Combined score
      const totalScore = tagScore + fitScore.score * 0.5;
      
      return {
        startup,
        totalScore,
        matchingTags: matchingTags.length,
        tags
      };
    });

    // Sort by score and select top candidates
    scoredStartups.sort((a, b) => b.totalScore - a.totalScore);
    
    // Select 2-4 startups ensuring diversity
    const selectedStartups: Actor[] = [];
    const usedTagCombos = new Set<string>();
    
    for (const scored of scoredStartups) {
      if (selectedStartups.length >= 4) break;
      if (scored.totalScore < 30) break; // Minimum threshold
      
      // Create a tag signature for diversity check
      const tagSignature = scored.tags.slice().sort().join(",");
      
      // Ensure diversity - avoid very similar startups
      if (selectedStartups.length > 0) {
        const isDuplicate = usedTagCombos.has(tagSignature);
        if (isDuplicate && selectedStartups.length >= 2) continue;
      }
      
      selectedStartups.push(scored.startup);
      usedTagCombos.add(tagSignature);
    }
    
    // Only create cluster if we have at least 2 startups
    if (selectedStartups.length >= 2) {
      const cluster = buildCluster(theme, selectedStartups, summary);
      clusters.push(cluster);
    }
  }

  // Sort clusters by average fit score
  clusters.sort((a, b) => {
    const avgScoreA = a.startups.reduce((sum, s) => 
      sum + computeProblemFitScore(summary, s).score, 0) / a.startups.length;
    const avgScoreB = b.startups.reduce((sum, s) => 
      sum + computeProblemFitScore(summary, s).score, 0) / b.startups.length;
    return avgScoreB - avgScoreA;
  });

  return clusters;
}

/**
 * Build a single cluster with summary and benefits
 */
function buildCluster(
  theme: ClusterTheme,
  startups: Actor[],
  summary: BloomSummary
): CollaborationCluster {
  const { region, week, overallRiskLevel, hotspots } = summary;
  const highSeverityCount = hotspots.filter(h => h.severity === "high").length;
  
  // Generate ID
  const id = `${theme.id}_${region.toLowerCase().replace(/\s+/g, "_")}_w${week}`;
  
  // Generate summary based on theme
  let clusterSummary = "";
  const benefits: string[] = [];
  let suitabilityNote = "";
  
  switch (theme.id) {
    case "early_warning_pack":
      clusterSummary = `This ${startups.length}-startup pack combines real-time monitoring, data analytics, and alert systems to provide comprehensive early warning for ${region}. Together, these solutions create a multi-layered detection network that tracks blooms from emergence to resolution.`;
      benefits.push(
        "Comprehensive coverage: sensors, satellite, and citizen reports",
        "Real-time alerts to authorities and citizens",
        "Historical data analysis for trend prediction",
        "Scalable infrastructure from pilot to region-wide deployment"
      );
      if (overallRiskLevel === "high" || highSeverityCount > 0) {
        suitabilityNote = `Strong match for week ${week} with ${overallRiskLevel} risk and ${highSeverityCount} severe hotspot${highSeverityCount !== 1 ? "s" : ""}`;
      } else {
        suitabilityNote = `Ideal for establishing proactive monitoring before risks escalate in ${region}`;
      }
      break;
      
    case "tourism_safety_pack":
      clusterSummary = `Protect tourism and beach safety in ${region} with this integrated pack. Combining real-time bloom data, user-friendly communication tools, and safety guidance systems, this bundle ensures tourists and locals can make informed decisions about water activities.`;
      benefits.push(
        "Tourist-friendly apps with real-time beach conditions",
        "Multi-language alerts and safety recommendations",
        "Integration with local tourism boards and beach management",
        "Reduces liability while maintaining recreational access"
      );
      if (hotspots.length > 0 && summary.safeAreas.length > 0) {
        suitabilityNote = `Perfect for mixed conditions: ${hotspots.length} hotspots but ${summary.safeAreas.length} safe areas requiring clear communication`;
      } else {
        suitabilityNote = `Essential for maintaining tourism revenue while protecting public health in ${region}`;
      }
      break;
      
    case "nutrient_management_pack":
      clusterSummary = `Address the root cause of blooms in ${region} with this nutrient management consortium. By combining upstream source reduction, biotech remediation, and farmer decision support, this pack tackles nutrient pollution from multiple angles.`;
      benefits.push(
        "Upstream nutrient reduction at agricultural sources",
        "In-situ remediation for acute hotspots",
        "Farmer tools for precision nutrient application",
        "Long-term prevention strategy beyond reactive measures"
      );
      const increasingCount = hotspots.filter(h => h.trend === "increasing").length;
      if (increasingCount > 0) {
        suitabilityNote = `Urgent need: ${increasingCount} area${increasingCount !== 1 ? "s" : ""} showing increasing trends requiring root-cause intervention`;
      } else {
        suitabilityNote = `Strategic fit for preventing future blooms in ${region} through systematic nutrient management`;
      }
      break;
      
    case "citizen_comms_pack":
      clusterSummary = `Empower citizens in ${region} with transparent, accessible bloom information. This pack combines data visualization, mobile apps, and community engagement tools to keep everyone informed and build public trust in water management.`;
      benefits.push(
        "User-friendly dashboards for non-technical audiences",
        "Mobile apps for on-the-go water quality checks",
        "Community reporting and citizen science integration",
        "Reduces information hotline burden on authorities"
      );
      suitabilityNote = `Essential for week ${week} with ${hotspots.length} affected area${hotspots.length !== 1 ? "s" : ""} requiring clear public communication`;
      break;
      
    case "planning_and_policy_pack":
      clusterSummary = `Support strategic planning and policy-making in ${region} with integrated data platforms and decision support tools. This pack helps authorities make evidence-based decisions and track progress toward bloom reduction goals.`;
      benefits.push(
        "Centralized data integration from multiple sources",
        "Decision support tools for policy evaluation",
        "Long-term trend analysis and scenario planning",
        "Compliance tracking and reporting capabilities"
      );
      if (hotspots.length > 3) {
        suitabilityNote = `Highly relevant: ${hotspots.length} hotspots requiring coordinated governance and data-driven planning`;
      } else {
        suitabilityNote = `Valuable for strategic planning and long-term bloom management in ${region}`;
      }
      break;
  }
  
  // Add generic benefits
  benefits.push(
    `Ready to pilot in ${region} starting week ${week}`,
    `${startups.length} proven startups working as consortium`
  );
  
  return {
    id,
    theme,
    startups,
    summary: clusterSummary,
    benefits,
    suitabilityNote
  };
}
