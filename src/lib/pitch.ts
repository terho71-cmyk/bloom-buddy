import { BloomSummary, Actor, PitchSnippet } from "@/types/bloom";

/**
 * Build a two-slide pitch snippet for a startup based on the bloom situation
 */
export function buildPitchSnippet(summary: BloomSummary, actor: Actor): PitchSnippet {
  const { region, week, overallRiskLevel, hotspots, safeAreas, totalObservations } = summary;
  const tags = actor.tags.map(t => t.toLowerCase());
  const details = actor.startupDetails;

  // Problem Slide
  const problemTitle = `Cyanobacteria Risk in ${region}, Week ${week}`;
  const problemBullets: string[] = [];

  // Bullet 1: Overall situation
  if (overallRiskLevel === "high") {
    problemBullets.push(
      `High cyanobacteria risk detected with ${totalObservations} observations across the region`
    );
  } else if (overallRiskLevel === "medium") {
    problemBullets.push(
      `Moderate cyanobacteria levels present with ${totalObservations} observations`
    );
  } else if (overallRiskLevel === "low") {
    problemBullets.push(
      `Low but present cyanobacteria levels detected (${totalObservations} observations)`
    );
  } else {
    problemBullets.push(
      `Minimal current risk, but monitoring shows ${totalObservations} observations requiring vigilance`
    );
  }

  // Bullet 2: Hotspots
  const highSeverityHotspots = hotspots.filter(h => h.severity === "high").length;
  const increasingHotspots = hotspots.filter(h => h.trend === "increasing").length;

  if (hotspots.length > 0) {
    if (highSeverityHotspots > 0) {
      problemBullets.push(
        `${highSeverityHotspots} high-severity hotspot${highSeverityHotspots > 1 ? "s" : ""} near popular swimming areas requiring immediate attention`
      );
    } else {
      problemBullets.push(
        `${hotspots.length} active hotspot${hotspots.length > 1 ? "s" : ""} detected across the region`
      );
    }
  }

  // Bullet 3: Trends
  if (increasingHotspots > 0) {
    problemBullets.push(
      `Incidents increasing in ${increasingHotspots} location${increasingHotspots > 1 ? "s" : ""}, indicating worsening conditions`
    );
  } else if (hotspots.length > 2 && overallRiskLevel !== "none") {
    problemBullets.push(
      `Geographic spread across multiple areas complicates management and public communication`
    );
  }

  // Bullet 4: Impact
  if (overallRiskLevel === "high" || highSeverityHotspots > 0) {
    problemBullets.push(
      `Beach closures and health advisories create uncertainty for swimmers, families, and tourism operators`
    );
  } else if (safeAreas.length > 0 && hotspots.length > 0) {
    problemBullets.push(
      `Mixed conditions (${safeAreas.length} safe areas vs ${hotspots.length} hotspots) require clear public information to guide decisions`
    );
  } else if (overallRiskLevel !== "none") {
    problemBullets.push(
      `Uncertain water conditions affect public confidence in coastal activities and require proactive monitoring`
    );
  }

  // Bullet 5: Need for action
  if (overallRiskLevel === "high" || increasingHotspots > 2) {
    problemBullets.push(
      `Urgent need for early warning systems and rapid response capabilities to protect public health`
    );
  } else if (overallRiskLevel === "medium" || hotspots.length > 2) {
    problemBullets.push(
      `Municipalities need better tools for monitoring, forecasting, and communicating bloom risks`
    );
  } else {
    problemBullets.push(
      `Proactive monitoring and communication can prevent escalation and maintain public trust`
    );
  }

  // Keep only top 5 bullets
  const finalProblemBullets = problemBullets.slice(0, 5);

  // Solution Slide
  const solutionTitle = `How ${actor.name} Addresses the Bloom Challenge`;
  const solutionBullets: string[] = [];

  // Bullet 1: Core solution description
  const hasMonitoring = tags.some(t => ["monitoring", "sensors", "early warning"].includes(t));
  const hasRemediation = tags.some(t => ["remediation", "nutrient reduction", "biotech"].includes(t));
  const hasCommunication = tags.some(t => ["communication", "citizen science", "decision support", "data visualization"].includes(t));

  if (hasMonitoring) {
    solutionBullets.push(
      `Real-time monitoring and early detection: ${actor.description}`
    );
  } else if (hasRemediation) {
    solutionBullets.push(
      `Active remediation and nutrient reduction: ${actor.description}`
    );
  } else if (hasCommunication) {
    solutionBullets.push(
      `Public communication and decision support: ${actor.description}`
    );
  } else {
    solutionBullets.push(actor.description);
  }

  // Bullet 2: Target customers and environments
  if (details) {
    const envList = details.targetEnvironments.slice(0, 3).join(", ");
    solutionBullets.push(
      `Designed for ${details.typicalCustomer} operating in ${envList} environments`
    );
  } else {
    solutionBullets.push(
      `Serving coastal municipalities, environmental agencies, and water management authorities`
    );
  }

  // Bullet 3-4: Benefits linked to problem
  if (details && details.keyBenefits.length > 0) {
    // Pick most relevant benefits based on problem type
    if (hasMonitoring && (overallRiskLevel === "high" || increasingHotspots > 0)) {
      // Focus on early warning
      const earlyWarningBenefit = details.keyBenefits.find(b =>
        b.toLowerCase().includes("early") || b.toLowerCase().includes("detect") || b.toLowerCase().includes("alert")
      );
      if (earlyWarningBenefit) {
        solutionBullets.push(earlyWarningBenefit);
      } else {
        solutionBullets.push(details.keyBenefits[0]);
      }
    } else if (hasRemediation && (overallRiskLevel === "high" || hotspots.length > 2)) {
      // Focus on reduction/remediation
      const remediationBenefit = details.keyBenefits.find(b =>
        b.toLowerCase().includes("reduc") || b.toLowerCase().includes("treat") || b.toLowerCase().includes("remediat")
      );
      if (remediationBenefit) {
        solutionBullets.push(remediationBenefit);
      } else {
        solutionBullets.push(details.keyBenefits[0]);
      }
    } else if (hasCommunication && (safeAreas.length > 0 || hotspots.length > 0)) {
      // Focus on communication/transparency
      const commBenefit = details.keyBenefits.find(b =>
        b.toLowerCase().includes("alert") || b.toLowerCase().includes("inform") || b.toLowerCase().includes("public")
      );
      if (commBenefit) {
        solutionBullets.push(commBenefit);
      } else {
        solutionBullets.push(details.keyBenefits[0]);
      }
    } else {
      solutionBullets.push(details.keyBenefits[0]);
    }

    // Add one more benefit
    if (details.keyBenefits.length > 1) {
      solutionBullets.push(details.keyBenefits[1]);
    }
  } else {
    // Generic benefits if no details
    if (hasMonitoring) {
      solutionBullets.push("Enables 24-48 hour early warnings to reduce public exposure to toxic blooms");
    } else if (hasRemediation) {
      solutionBullets.push("Reduces bloom intensity and duration through targeted interventions");
    } else if (hasCommunication) {
      solutionBullets.push("Empowers citizens with transparent, real-time information for safer water activities");
    }
  }

  // Bullet 5: Maturity and readiness
  if (details) {
    if (details.trlLevel && details.trlLevel >= 7) {
      solutionBullets.push(
        `Proven technology (TRL ${details.trlLevel}) ready for deployment at ${details.deploymentScale}`
      );
    } else if (details.trlLevel) {
      solutionBullets.push(
        `Innovative solution (TRL ${details.trlLevel}) available for pilot deployment at ${details.deploymentScale}`
      );
    } else {
      solutionBullets.push(
        `Ready for deployment at ${details.deploymentScale}`
      );
    }
  }

  // Keep only top 5 bullets
  const finalSolutionBullets = solutionBullets.slice(0, 5);

  return {
    problemSlide: {
      title: problemTitle,
      bullets: finalProblemBullets
    },
    solutionSlide: {
      title: solutionTitle,
      bullets: finalSolutionBullets
    }
  };
}

/**
 * Format pitch snippet as plain text
 */
export function formatPitchAsText(pitch: PitchSnippet): string {
  let text = `Problem Slide: ${pitch.problemSlide.title}\n`;
  pitch.problemSlide.bullets.forEach(bullet => {
    text += `• ${bullet}\n`;
  });
  text += `\nSolution Slide: ${pitch.solutionSlide.title}\n`;
  pitch.solutionSlide.bullets.forEach(bullet => {
    text += `• ${bullet}\n`;
  });
  return text;
}

/**
 * Format pitch snippet as markdown
 */
export function formatPitchAsMarkdown(pitch: PitchSnippet): string {
  let md = `## ${pitch.problemSlide.title}\n\n`;
  pitch.problemSlide.bullets.forEach(bullet => {
    md += `- ${bullet}\n`;
  });
  md += `\n## ${pitch.solutionSlide.title}\n\n`;
  pitch.solutionSlide.bullets.forEach(bullet => {
    md += `- ${bullet}\n`;
  });
  return md;
}
