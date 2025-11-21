import { BloomSummary, Actor, ProblemFitScore, FitLabel } from "@/types/bloom";

/**
 * Compute how well a startup's solution fits the current bloom situation
 */
export function computeProblemFitScore(
  summary: BloomSummary,
  actor: Actor
): ProblemFitScore {
  const { region, week, overallRiskLevel, hotspots, safeAreas } = summary;
  const tags = actor.tags.map(t => t.toLowerCase());
  const details = actor.startupDetails;

  let score = 0;
  const drivers: string[] = [];

  // 1. Base score from risk level
  switch (overallRiskLevel) {
    case "high":
      score = 70;
      drivers.push("High overall risk level requiring urgent action");
      break;
    case "medium":
      score = 55;
      drivers.push("Moderate risk level with need for monitoring and intervention");
      break;
    case "low":
      score = 40;
      drivers.push("Low risk level, preventive measures beneficial");
      break;
    case "none":
      score = 20;
      drivers.push("Minimal current risk, monitoring still valuable");
      break;
  }

  // 2. Adjust for tags vs problem characteristics
  const highSeverityHotspots = hotspots.filter(h => h.severity === "high").length;
  const increasingHotspots = hotspots.filter(h => h.trend === "increasing").length;

  // Monitoring/sensors match high severity hotspots
  const hasMonitoring = tags.some(t => ["monitoring", "sensors", "early warning"].includes(t));
  if (hasMonitoring && highSeverityHotspots > 0) {
    score += 15;
    drivers.push("Real-time monitoring crucial for tracking high-severity hotspots");
  } else if (hasMonitoring && hotspots.length > 2) {
    score += 10;
    drivers.push("Multiple hotspots benefit from systematic monitoring");
  }

  // Remediation match increasing trends or persistent high risk
  const hasRemediation = tags.some(t => ["remediation", "nutrient reduction", "biotech"].includes(t));
  if (hasRemediation && increasingHotspots > 0) {
    score += 10;
    drivers.push("Increasing trends indicate need for active remediation");
  } else if (hasRemediation && overallRiskLevel === "high") {
    score += 8;
    drivers.push("High risk level justifies remediation investments");
  }

  // Communication match mixed conditions
  const hasCommunication = tags.some(t => ["communication", "citizen science", "decision support", "data visualization", "apps"].includes(t));
  if (hasCommunication && safeAreas.length > 0 && hotspots.length > 0) {
    score += 10;
    drivers.push("Mixed safe/unsafe areas require clear public communication");
  } else if (hasCommunication && (overallRiskLevel === "high" || overallRiskLevel === "medium")) {
    score += 8;
    drivers.push("Elevated risk demands effective citizen information systems");
  }

  // 3. Environment match
  const isCoastalRegion = region.toLowerCase().includes("archipelago") || 
                          region.toLowerCase().includes("coast") ||
                          region.toLowerCase().includes("sea");
  
  if (details && details.targetEnvironments.includes("coastal") && isCoastalRegion) {
    score += 10;
    drivers.push("Startup specializes in coastal environments matching this region");
  } else if (details && details.targetEnvironments.includes("lakes") && !isCoastalRegion) {
    score += 10;
    drivers.push("Startup specializes in lake environments matching this region");
  }

  // 4. Customer match
  if (details) {
    const customerLower = details.typicalCustomer.toLowerCase();
    const hasCoastalCustomer = customerLower.includes("coastal") || 
                               customerLower.includes("municipal") ||
                               customerLower.includes("beach") ||
                               customerLower.includes("port");
    
    if (hasCoastalCustomer) {
      score += 10;
      drivers.push(`Target customers (${details.typicalCustomer}) align with stakeholders affected by blooms`);
    }
  }

  // 5. Maturity bonus
  if (details && details.trlLevel && details.trlLevel >= 7) {
    score += 5;
    drivers.push(`Mature technology (TRL ${details.trlLevel}) ready for immediate deployment`);
  }

  // 6. Additional context-specific bonuses
  
  // If many hotspots, data visualization helps
  if (tags.includes("data visualization") && hotspots.length > 3) {
    score += 5;
    drivers.push("Data visualization crucial for managing multiple hotspots");
  }

  // If IoT/sensors and distributed problem
  if (tags.includes("iot") && hotspots.length > 4) {
    score += 5;
    drivers.push("IoT sensor networks ideal for distributed monitoring needs");
  }

  // If satellite and large area
  if (tags.includes("satellite") && hotspots.length > 5) {
    score += 8;
    drivers.push("Satellite coverage essential for large-scale regional monitoring");
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine label
  let label: FitLabel;
  if (score >= 75) {
    label = "High";
  } else if (score >= 45) {
    label = "Medium";
  } else {
    label = "Low";
  }

  // Generate explanation
  const explanation = generateExplanation(summary, actor, score, label, tags, details);

  // Keep top 5 drivers
  const finalDrivers = drivers.slice(0, 5);

  return {
    score,
    label,
    explanation,
    drivers: finalDrivers
  };
}

function generateExplanation(
  summary: BloomSummary,
  actor: Actor,
  score: number,
  label: FitLabel,
  tags: string[],
  details: any
): string {
  const { region, week, overallRiskLevel, hotspots } = summary;
  const highSeverityCount = hotspots.filter(h => h.severity === "high").length;
  
  let explanation = "";

  if (label === "High") {
    if (overallRiskLevel === "high" && highSeverityCount > 0) {
      explanation = `Strong fit for ${region} in week ${week}. High cyanobacteria risk with ${highSeverityCount} severe hotspot${highSeverityCount > 1 ? "s" : ""} near popular areas. ${actor.name}'s ${getMainCapability(tags)} solution addresses critical needs for this situation.`;
    } else if (overallRiskLevel === "high") {
      explanation = `Excellent match for ${region} in week ${week}. High bloom risk across the region creates urgent demand for ${getMainCapability(tags)} capabilities that ${actor.name} provides.`;
    } else {
      explanation = `Very good fit for ${region} in week ${week}. Multiple bloom indicators and ${actor.name}'s specialized ${getMainCapability(tags)} approach align well with current management priorities.`;
    }
  } else if (label === "Medium") {
    if (overallRiskLevel === "medium" || overallRiskLevel === "low") {
      explanation = `Moderate fit for ${region} in week ${week}. While current risk is ${overallRiskLevel}, ${actor.name}'s ${getMainCapability(tags)} capabilities could strengthen preparedness and response capacity.`;
    } else if (overallRiskLevel === "high") {
      explanation = `Reasonable fit for ${region} in week ${week}. High bloom risk present, though ${actor.name}'s ${getMainCapability(tags)} approach may be most effective combined with complementary solutions.`;
    } else {
      explanation = `Moderate alignment for ${region} in week ${week}. ${actor.name}'s solution offers relevant capabilities, particularly for ${getMainCapability(tags)}.`;
    }
  } else {
    if (overallRiskLevel === "none" || overallRiskLevel === "low") {
      explanation = `Limited immediate need in ${region} for week ${week}. With ${overallRiskLevel} risk levels, ${actor.name}'s ${getMainCapability(tags)} solution may be more valuable for future prevention or different contexts.`;
    } else {
      explanation = `Some mismatch for ${region} in week ${week}. While ${overallRiskLevel} risk exists, ${actor.name}'s ${getMainCapability(tags)} focus may not directly address the most pressing needs right now.`;
    }
  }

  return explanation;
}

function getMainCapability(tags: string[]): string {
  if (tags.some(t => ["monitoring", "sensors"].includes(t))) {
    return "real-time monitoring";
  } else if (tags.some(t => ["remediation", "nutrient reduction"].includes(t))) {
    return "remediation and nutrient management";
  } else if (tags.some(t => ["communication", "apps"].includes(t))) {
    return "citizen communication and alerts";
  } else if (tags.includes("data visualization")) {
    return "data visualization and analytics";
  } else if (tags.includes("early warning")) {
    return "early warning systems";
  } else if (tags.includes("decision support")) {
    return "decision support";
  } else {
    return "environmental technology";
  }
}
