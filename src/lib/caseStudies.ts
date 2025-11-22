import { CaseStudyInput, StartupCaseStudy, Actor, BloomSummary } from "@/types/bloom";

export function buildCaseStudyFromInput(
  input: CaseStudyInput,
  startup: Actor,
  summary?: BloomSummary
): StartupCaseStudy {
  const now = new Date().toISOString();
  const id = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Build title
  const title = `${startup.name} deployment with ${input.customerName} in ${input.region}`;
  
  // Build hero summary
  const riskContext = summary 
    ? `facing ${summary.overallRiskLevel} risk levels with ${summary.hotspots.length} affected areas`
    : "managing bloom monitoring challenges";
    
  const heroSummary = `${input.customerName} in ${input.region} was ${riskContext}. During ${input.timePeriod}, ${startup.name} deployed their ${startup.tags[0] || "solution"} technology to address these challenges. ${input.summaryOfPilot}`;
  
  // Build Problem section
  const problemBody = summary
    ? `In ${input.region}, ${input.customerName} was dealing with ${summary.overallRiskLevel} severity cyanobacteria blooms during ${input.timePeriod}. ${
        summary.hotspots.length > 0 
          ? `Critical hotspots included ${summary.hotspots.slice(0, 3).map(h => h.areaName).join(", ")}, with ${summary.hotspots.filter(h => h.severity === "high").length} areas reaching high severity levels. `
          : ""
      }${
        summary.hotspots.some(h => h.trend === "increasing")
          ? "Increasing trends in several locations indicated the situation required immediate attention. "
          : ""
      }The unpredictability of bloom conditions made planning difficult for water management, tourism operations, and public safety communications.`
    : `${input.customerName} in ${input.region} was facing challenges with cyanobacteria bloom management during ${input.timePeriod}. Traditional monitoring approaches were insufficient for the scale and complexity of the situation, requiring a more advanced solution.`;
  
  // Build Solution section
  const solutionBody = `${startup.name} deployed their ${startup.description} The solution leveraged ${startup.tags.slice(0, 3).join(", ")} technology to provide ${input.customerName} with real-time insights and actionable data. ${
    startup.startupDetails
      ? `With a TRL level of ${startup.startupDetails.trlLevel} and proven deployments in ${startup.startupDetails.targetEnvironments.join(", ")} environments, the technology was well-suited for this deployment.`
      : ""
  }`;
  
  // Build Results section
  const resultsBody = `The deployment in ${input.region} during ${input.timePeriod} demonstrated measurable improvements for ${input.customerName}. ${
    input.metrics && input.metrics.length > 0
      ? `Key metrics showed significant progress: ${input.metrics.map(m => `${m.label} ${m.value}`).join(", ")}. `
      : ""
  }The solution enabled better decision-making, reduced uncertainty, and improved operational efficiency for water management.`;
  
  // Build Next Steps section
  const nextStepsBody = `Following the successful pilot in ${input.region}, ${input.customerName} is exploring expansion opportunities. Potential next steps include scaling the deployment to additional water bodies in the region, extending the monitoring period to cover full seasonal cycles, and integrating the system with existing municipal water management infrastructure. ${startup.name} is ready to support these expansions and customize the solution for ${input.customerName}'s long-term needs.`;
  
  return {
    id,
    startupId: input.startupId,
    region: input.region,
    timePeriod: input.timePeriod,
    customerName: input.customerName,
    title,
    heroSummary,
    problem: {
      title: "Problem",
      body: problemBody
    },
    solution: {
      title: "Solution",
      body: solutionBody,
      bullets: input.keyActions
    },
    results: {
      title: "Results & Impact",
      body: resultsBody,
      bullets: input.observedResults
    },
    nextSteps: {
      title: "Next Steps",
      body: nextStepsBody
    },
    metrics: input.metrics,
    createdAt: now
  };
}

export function caseStudyToText(caseStudy: StartupCaseStudy): string {
  let text = `${caseStudy.title}\n`;
  text += `${"=".repeat(caseStudy.title.length)}\n\n`;
  text += `Customer: ${caseStudy.customerName}\n`;
  text += `Region: ${caseStudy.region}\n`;
  text += `Period: ${caseStudy.timePeriod}\n\n`;
  text += `${caseStudy.heroSummary}\n\n`;
  
  // Problem
  text += `${caseStudy.problem.title}\n`;
  text += `${"-".repeat(caseStudy.problem.title.length)}\n`;
  text += `${caseStudy.problem.body}\n\n`;
  
  // Solution
  text += `${caseStudy.solution.title}\n`;
  text += `${"-".repeat(caseStudy.solution.title.length)}\n`;
  text += `${caseStudy.solution.body}\n\n`;
  if (caseStudy.solution.bullets && caseStudy.solution.bullets.length > 0) {
    text += `Key Actions:\n`;
    caseStudy.solution.bullets.forEach(bullet => {
      text += `• ${bullet}\n`;
    });
    text += `\n`;
  }
  
  // Results
  text += `${caseStudy.results.title}\n`;
  text += `${"-".repeat(caseStudy.results.title.length)}\n`;
  text += `${caseStudy.results.body}\n\n`;
  if (caseStudy.results.bullets && caseStudy.results.bullets.length > 0) {
    text += `Observed Results:\n`;
    caseStudy.results.bullets.forEach(bullet => {
      text += `• ${bullet}\n`;
    });
    text += `\n`;
  }
  if (caseStudy.metrics && caseStudy.metrics.length > 0) {
    text += `Metrics:\n`;
    caseStudy.metrics.forEach(metric => {
      text += `• ${metric.label}: ${metric.value}\n`;
    });
    text += `\n`;
  }
  
  // Next Steps
  text += `${caseStudy.nextSteps.title}\n`;
  text += `${"-".repeat(caseStudy.nextSteps.title.length)}\n`;
  text += `${caseStudy.nextSteps.body}\n`;
  
  return text;
}

export function caseStudyToMarkdown(caseStudy: StartupCaseStudy): string {
  let md = `# ${caseStudy.title}\n\n`;
  md += `**Customer:** ${caseStudy.customerName}  \n`;
  md += `**Region:** ${caseStudy.region}  \n`;
  md += `**Period:** ${caseStudy.timePeriod}\n\n`;
  md += `${caseStudy.heroSummary}\n\n`;
  
  // Problem
  md += `## ${caseStudy.problem.title}\n\n`;
  md += `${caseStudy.problem.body}\n\n`;
  
  // Solution
  md += `## ${caseStudy.solution.title}\n\n`;
  md += `${caseStudy.solution.body}\n\n`;
  if (caseStudy.solution.bullets && caseStudy.solution.bullets.length > 0) {
    md += `**Key Actions:**\n\n`;
    caseStudy.solution.bullets.forEach(bullet => {
      md += `- ${bullet}\n`;
    });
    md += `\n`;
  }
  
  // Results
  md += `## ${caseStudy.results.title}\n\n`;
  md += `${caseStudy.results.body}\n\n`;
  if (caseStudy.results.bullets && caseStudy.results.bullets.length > 0) {
    md += `**Observed Results:**\n\n`;
    caseStudy.results.bullets.forEach(bullet => {
      md += `- ${bullet}\n`;
    });
    md += `\n`;
  }
  if (caseStudy.metrics && caseStudy.metrics.length > 0) {
    md += `**Metrics:**\n\n`;
    caseStudy.metrics.forEach(metric => {
      md += `- **${metric.label}:** ${metric.value}\n`;
    });
    md += `\n`;
  }
  
  // Next Steps
  md += `## ${caseStudy.nextSteps.title}\n\n`;
  md += `${caseStudy.nextSteps.body}\n`;
  
  return md;
}
