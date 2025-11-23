import { BloomObservation, BloomSummary, Actor, BulletinResponse, Recommendation, PilotOpportunity, PitchSnippet, ProblemFitScore, StartupAlertRule, PerfectWeekOverview, CaseStudyInput, StartupCaseStudy, SolutionGap, CollaborationCluster } from "@/types/bloom";
import { buildPitchSnippet } from "@/lib/pitch";
import { computeProblemFitScore } from "@/lib/fitScore";
import { buildInvestorViewSummary } from "@/lib/investorView";
import { findPerfectWeeksForStartup } from "@/lib/alerts";
import { buildCaseStudyFromInput } from "@/lib/caseStudies";
import { buildGapRadar } from "@/lib/gapRadar";
import { buildClustersForSituation } from "@/lib/clusters";
import { supabase } from "@/integrations/supabase/client";

// Map region names to API keys
const REGION_KEY_MAP: Record<string, string> = {
  "Turku archipelago": "turku_archipelago",
  "Helsinki archipelago": "helsinki_archipelago",
  "Vaasa archipelago": "vaasa_archipelago",
};

// Mock API layer - can be replaced with real API calls later
export class BloomApi {
  private static observations: BloomObservation[] = [];
  private static actors: Actor[] = [];
  private static startupAlerts: Record<string, StartupAlertRule[]> = {};
  private static caseStudies: StartupCaseStudy[] = [];

  static async loadData() {
    // Load observations
    const obsResponse = await fetch('/data/bloom_observations.json');
    this.observations = await obsResponse.json();

    // Load actors
    const actorsResponse = await fetch('/data/actors.json');
    this.actors = await actorsResponse.json();
    
    // Load startup alerts
    try {
      const alertsResponse = await fetch('/data/startupAlerts.json');
      this.startupAlerts = await alertsResponse.json();
    } catch (error) {
      console.warn('No startup alerts data found, using empty alerts');
      this.startupAlerts = {};
    }
    
    // Load case studies
    try {
      const caseStudiesResponse = await fetch('/data/caseStudies.json');
      this.caseStudies = await caseStudiesResponse.json();
    } catch (error) {
      console.warn('No case studies data found, using empty array');
      this.caseStudies = [];
    }
  }

  static async getBloomSummary(region: string, week: number): Promise<BloomSummary> {
    if (this.observations.length === 0) await this.loadData();

    // Try to get real CitObs data first
    const regionKey = REGION_KEY_MAP[region];
    if (regionKey) {
      try {
        console.log(`Fetching real CitObs data for ${region} (${regionKey}), week ${week}`);
        
        const { data, error } = await supabase.functions.invoke('citobs-summary', {
          body: { region: regionKey, week },
        });

        if (error) {
          console.error('Error calling citobs-summary:', error);
          throw error;
        }

        if (data && data.summary) {
          const citobsSummary = data.summary;
          console.log('Received CitObs summary:', citobsSummary);

          // Get previous week data for trend
          const prevWeekObs = this.observations.filter(
            obs => obs.region === region && obs.week === week - 1
          );

          // Map CitObs events to our hotspot format
          const hotspots = (citobsSummary.sampleEvents || []).map((event: any) => ({
            areaName: event.areaName || 'Unknown location',
            severity: event.severity,
            observationCount: 1,
            trend: 'unknown' as const
          }));

          // Calculate safe areas (areas with 'none' or 'low' severity)
          const safeAreas = hotspots
            .filter((h: any) => h.severity === 'none' || h.severity === 'low')
            .map((h: any) => h.areaName);

          const keyMessages = this.generateKeyMessages(
            hotspots,
            safeAreas,
            citobsSummary.overallRisk
          );

          return {
            region,
            week,
            totalObservations: citobsSummary.totalObservations,
            hotspots: hotspots.slice(0, 5),
            safeAreas,
            overallRiskLevel: citobsSummary.overallRisk,
            keyMessages
          };
        }
      } catch (error) {
        console.error('Failed to fetch real CitObs data, falling back to mock data:', error);
      }
    }

    // Fallback to mock data if real API fails or region not supported
    console.log('Using mock data for', region, 'week', week);

    // Filter observations for this region and week
    const currentWeekObs = this.observations.filter(
      obs => obs.region === region && obs.week === week
    );

    // Get previous week for trend calculation
    const previousWeekObs = this.observations.filter(
      obs => obs.region === region && obs.week === week - 1
    );

    // Group by area
    const areaMap = new Map<string, BloomObservation[]>();
    currentWeekObs.forEach(obs => {
      if (!areaMap.has(obs.areaName)) {
        areaMap.set(obs.areaName, []);
      }
      areaMap.get(obs.areaName)!.push(obs);
    });

    // Calculate hotspots
    const hotspots = Array.from(areaMap.entries())
      .map(([areaName, observations]) => {
        const maxSeverity = this.getMaxSeverity(observations.map(o => o.severity));
        const prevAreaObs = previousWeekObs.filter(o => o.areaName === areaName);
        
        return {
          areaName,
          severity: maxSeverity,
          observationCount: observations.length,
          trend: this.calculateTrend(observations.length, prevAreaObs.length)
        };
      })
      .filter(h => h.severity !== 'none')
      .sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1, none: 0 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

    // Safe areas (none or low severity)
    const safeAreas = Array.from(areaMap.entries())
      .filter(([_, observations]) => {
        const maxSev = this.getMaxSeverity(observations.map(o => o.severity));
        return maxSev === 'none' || maxSev === 'low';
      })
      .map(([areaName]) => areaName);

    // Overall risk level
    const overallRiskLevel = currentWeekObs.length > 0
      ? this.getMaxSeverity(currentWeekObs.map(o => o.severity))
      : 'none';

    // Key messages
    const keyMessages = this.generateKeyMessages(hotspots, safeAreas, overallRiskLevel);

    return {
      region,
      week,
      totalObservations: currentWeekObs.length,
      hotspots: hotspots.slice(0, 5), // Top 5 hotspots
      safeAreas,
      overallRiskLevel,
      keyMessages
    };
  }

  static async generateBulletin(summary: BloomSummary): Promise<BulletinResponse> {
    // Mock bulletin generation - replace with LLM API call in production
    const citizenBulletin = this.generateCitizenBulletin(summary);
    const expertNote = this.generateExpertNote(summary);

    return {
      citizenBulletin,
      expertNote
    };
  }

  static async recommendActors(summary: BloomSummary): Promise<Recommendation[]> {
    if (this.actors.length === 0) await this.loadData();

    const recommendations: Recommendation[] = [];
    const { overallRiskLevel, hotspots } = summary;

    // Determine themes based on summary
    if (hotspots.length > 2 && (overallRiskLevel === 'high' || overallRiskLevel === 'medium')) {
      // Early warning & monitoring theme
      const monitoringActors = this.actors.filter(a => 
        a.tags.some(t => ['monitoring', 'sensors', 'early warning'].includes(t))
      );
      
      recommendations.push({
        theme: "Early Warning & Monitoring",
        explanation: "Multiple hotspots detected with elevated severity levels. Enhanced monitoring infrastructure and early warning systems can help track bloom development and alert communities proactively.",
        actors: this.selectDiverseActors(monitoringActors, 5)
      });
    }

    if (overallRiskLevel === 'high' || (overallRiskLevel === 'medium' && hotspots.length > 3)) {
      // Remediation theme
      const remediationActors = this.actors.filter(a =>
        a.tags.some(t => ['remediation', 'nutrient reduction', 'biotech'].includes(t))
      );

      recommendations.push({
        theme: "Nutrient Reduction & Remediation",
        explanation: "Persistent high-severity blooms indicate need for active intervention. Solutions focused on nutrient management and biological remediation can help reduce bloom intensity over time.",
        actors: this.selectDiverseActors(remediationActors, 5)
      });
    }

    // Communication theme (always relevant when there are observations)
    if (summary.totalObservations > 10 || hotspots.length > 0) {
      const commActors = this.actors.filter(a =>
        a.tags.some(t => ['communication', 'citizen science', 'decision support', 'data visualization'].includes(t))
      );

      recommendations.push({
        theme: "Citizen Communication & Decision Support",
        explanation: "Keeping the public informed and engaged is crucial. Tools for clear communication, data transparency, and decision support help communities make informed choices about water activities.",
        actors: this.selectDiverseActors(commActors, 5)
      });
    }

    return recommendations;
  }

  static async generatePilot(summary: BloomSummary, actor: Actor): Promise<PilotOpportunity> {
    const { region, week, overallRiskLevel, hotspots } = summary;
    const tags = actor.tags.map(t => t.toLowerCase());

    // Determine focus based on tags and situation
    const hasMonitoring = tags.some(t => ['monitoring', 'sensors', 'early warning'].includes(t));
    const hasRemediation = tags.some(t => ['remediation', 'nutrient reduction', 'biotech'].includes(t));
    const hasCommunication = tags.some(t => ['communication', 'citizen science', 'decision support', 'data visualization'].includes(t));
    
    const increasingHotspots = hotspots.filter(h => h.trend === 'increasing').length;
    const highSeverityHotspots = hotspots.filter(h => h.severity === 'high').length;

    let pilotTitle = '';
    let objective = '';
    let whyNow = '';
    const keySteps: string[] = [];
    const successMetrics: string[] = [];

    // Generate content based on actor type and situation
    if (hasMonitoring) {
      pilotTitle = `Real-time Cyanobacteria Monitoring for ${region}`;
      objective = `Deploy ${actor.name}'s monitoring solution across key areas in ${region} to provide early detection and tracking of cyanobacteria blooms, enabling timely public health responses.`;
      
      whyNow = `Week ${week} shows ${overallRiskLevel} risk level in ${region} with ${hotspots.length} active hotspot${hotspots.length > 1 ? 's' : ''}. `;
      if (increasingHotspots > 0) {
        whyNow += `${increasingHotspots} area${increasingHotspots > 1 ? 's show' : ' shows'} increasing trends, making early warning capabilities critical. `;
      }
      whyNow += `Proactive monitoring can help authorities and citizens stay ahead of bloom developments and reduce health risks.`;

      keySteps.push(
        `Deploy 5-8 monitoring units in identified hotspot areas: ${hotspots.slice(0, 3).map(h => h.areaName).join(', ')}`,
        'Integrate real-time data feed with municipality alert systems',
        'Set up automated alerts for severity threshold crossings',
        'Run 4-6 week pilot during peak bloom season',
        'Train local authorities on system usage and interpretation'
      );

      successMetrics.push(
        'Detect at least 80% of high-risk events 24-48 hours before visible bloom',
        'Achieve <2 hour lag time from detection to public notification',
        'Reduce citizen exposure incidents by measurable percentage',
        'Gather feedback from at least 50 local stakeholders',
        'Demonstrate ROI through prevented health costs'
      );
    } else if (hasRemediation) {
      pilotTitle = `Nutrient Reduction Pilot with ${actor.name} in ${region}`;
      objective = `Test ${actor.name}'s remediation technology in select hotspot areas to reduce nutrient loads and demonstrate measurable bloom intensity reduction over a defined trial period.`;
      
      whyNow = `${region} is experiencing ${overallRiskLevel} severity blooms in week ${week}. `;
      if (highSeverityHotspots > 0) {
        whyNow += `${highSeverityHotspots} area${highSeverityHotspots > 1 ? 's have' : ' has'} reached high severity, indicating persistent nutrient issues. `;
      }
      if (increasingHotspots > 0) {
        whyNow += `Increasing trends in ${increasingHotspots} location${increasingHotspots > 1 ? 's' : ''} suggest urgent need for active intervention. `;
      }
      whyNow += `This is an ideal time to test remediation solutions where the problem is most acute.`;

      keySteps.push(
        `Select 2-3 hotspot areas for intervention: ${hotspots.slice(0, 2).map(h => h.areaName).join(', ')}`,
        'Establish baseline measurements (nutrient levels, bloom density)',
        `Deploy ${actor.name}'s remediation technology for 8-12 weeks`,
        'Conduct weekly monitoring and sampling',
        'Compare treated vs control areas',
        'Document operational costs and maintenance requirements'
      );

      successMetrics.push(
        'Achieve 20-40% reduction in bloom severity in treated areas',
        'Demonstrate measurable decrease in nitrogen/phosphorus levels',
        'Document cost per unit area treated',
        'Assess scalability based on pilot results',
        'Achieve positive feedback from local community (>70% approval)'
      );
    } else if (hasCommunication) {
      pilotTitle = `Citizen Information & Decision Support for ${region} Waters`;
      objective = `Launch ${actor.name}'s communication platform to provide real-time bloom information and safety guidance to citizens, tourists, and local businesses in ${region}.`;
      
      whyNow = `With ${overallRiskLevel} risk levels in week ${week} and ${hotspots.length} affected area${hotspots.length > 1 ? 's' : ''}, clear public communication is essential. `;
      if (summary.safeAreas.length > 0) {
        whyNow += `While ${summary.safeAreas.length} area${summary.safeAreas.length > 1 ? 's remain' : ' remains'} safe, citizens need reliable information to make informed decisions about water activities. `;
      }
      whyNow += `A user-friendly information system can help maintain water-based recreation while protecting public health.`;

      keySteps.push(
        'Deploy web and mobile app interface for bloom status',
        `Integrate current bloom data for ${region} into user-friendly maps`,
        'Launch public awareness campaign with local media and tourism offices',
        'Gather user feedback through in-app surveys',
        'Run pilot for 6-8 weeks covering peak season',
        'Train local authorities to update content and respond to user queries'
      );

      successMetrics.push(
        'Achieve 1,000+ active users during pilot period',
        'Maintain daily engagement rate >30%',
        'Reduce water safety incident inquiries to authorities by 40%',
        'Achieve user satisfaction score >4/5',
        'Document user testimonials and behavior change',
        'Demonstrate reduced risk exposure through app usage correlation'
      );
    } else {
      // Generic pilot for other actor types
      pilotTitle = `Blue Economy Solution Trial: ${actor.name} in ${region}`;
      objective = `Test ${actor.name}'s innovative solution in response to the current cyanobacteria situation in ${region}, demonstrating practical value and scalability.`;
      
      whyNow = `${region} faces ${overallRiskLevel} bloom risk in week ${week}. The current situation with ${hotspots.length} hotspot${hotspots.length > 1 ? 's' : ''} provides a real-world testing ground for innovative blue economy solutions.`;

      keySteps.push(
        'Define specific pilot scope and target areas',
        `Deploy solution in ${region} for 6-8 week trial`,
        'Establish measurable success criteria',
        'Conduct regular monitoring and data collection',
        'Engage with local stakeholders and authorities',
        'Document lessons learned and scale-up potential'
      );

      successMetrics.push(
        'Demonstrate measurable impact on target problem',
        'Achieve positive stakeholder feedback (>70%)',
        'Document cost-effectiveness of solution',
        'Identify scaling opportunities',
        'Generate case study for broader deployment'
      );
    }

    return {
      pilotTitle,
      objective,
      whyNow,
      keySteps,
      successMetrics
    };
  }

  static async generatePitch(summary: BloomSummary, actor: Actor): Promise<PitchSnippet> {
    // Use the pure function from lib/pitch to build the snippet
    return buildPitchSnippet(summary, actor);
  }

  static computeFitScore(summary: BloomSummary, actor: Actor): ProblemFitScore {
    // Use the pure function from lib/fitScore to compute fit
    return computeProblemFitScore(summary, actor);
  }

  static buildInvestorView(
    summary: BloomSummary,
    investor: Actor
  ): import("@/types/bloom").InvestorViewSummary {
    const allActors = this.getAllActors();
    return buildInvestorViewSummary(summary, investor, allActors);
  }

  static getAvailableRegions(): string[] {
    if (this.observations.length === 0) return [];
    return Array.from(new Set(this.observations.map(o => o.region))).sort();
  }

  static getAvailableWeeks(region?: string): number[] {
    if (this.observations.length === 0) return [];
    const obs = region 
      ? this.observations.filter(o => o.region === region)
      : this.observations;
    return Array.from(new Set(obs.map(o => o.week))).sort((a, b) => b - a);
  }

  static getWeeksForRegion(region: string): number[] {
    return this.getAvailableWeeks(region);
  }

  static getAllActors(): Actor[] {
    return this.actors;
  }

  static getAllObservations(): BloomObservation[] {
    return this.observations;
  }

  static getStartupAlerts(startupId: string): StartupAlertRule[] {
    return this.startupAlerts[startupId] || [];
  }

  static async findPerfectWeeks(
    startupId: string,
    region: string,
    weeks: number[]
  ): Promise<PerfectWeekOverview> {
    if (this.observations.length === 0) await this.loadData();
    
    const rules = this.getStartupAlerts(startupId);
    const summaries: BloomSummary[] = [];
    
    for (const week of weeks) {
      try {
        const summary = await this.getBloomSummary(region, week);
        summaries.push(summary);
      } catch (error) {
        console.warn(`Could not get summary for ${region} week ${week}`);
      }
    }
    
    return findPerfectWeeksForStartup(summaries, rules, startupId, region);
  }

  // Helper methods
  private static getMaxSeverity(severities: string[]): any {
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    if (severities.includes('low')) return 'low';
    return 'none';
  }

  private static calculateTrend(current: number, previous: number): "increasing" | "decreasing" | "stable" | "unknown" {
    if (previous === 0) return "unknown";
    const change = ((current - previous) / previous) * 100;
    if (change > 20) return "increasing";
    if (change < -20) return "decreasing";
    return "stable";
  }

  private static generateKeyMessages(hotspots: any[], safeAreas: string[], overallRisk: string): string[] {
    const messages: string[] = [];

    if (overallRisk === 'high') {
      messages.push("⚠️ High cyanobacteria risk detected in the region");
    } else if (overallRisk === 'medium') {
      messages.push("⚡ Moderate cyanobacteria levels present");
    } else if (overallRisk === 'low') {
      messages.push("✓ Low cyanobacteria levels overall");
    } else {
      messages.push("✓ No significant cyanobacteria detected");
    }

    if (hotspots.length > 0) {
      messages.push(`${hotspots.length} hotspot area${hotspots.length > 1 ? 's' : ''} require attention`);
    }

    if (safeAreas.length > 0) {
      messages.push(`${safeAreas.length} area${safeAreas.length > 1 ? 's are' : ' is'} safe for activities`);
    }

    const increasingHotspots = hotspots.filter(h => h.trend === 'increasing').length;
    if (increasingHotspots > 0) {
      messages.push(`${increasingHotspots} area${increasingHotspots > 1 ? 's show' : ' shows'} increasing trends`);
    }

    return messages;
  }

  private static generateCitizenBulletin(summary: BloomSummary): string {
    const { region, week, overallRiskLevel, hotspots, safeAreas } = summary;

    let bulletin = `**Cyanobacteria Situation for ${region} - Week ${week}**\n\n`;

    if (overallRiskLevel === 'high') {
      bulletin += "🚨 **High Alert**: Significant cyanobacteria blooms have been detected in several areas. We recommend avoiding swimming and water sports in affected zones. Please check specific area conditions before visiting coastal areas.\n\n";
    } else if (overallRiskLevel === 'medium') {
      bulletin += "⚠️ **Moderate Caution**: Cyanobacteria levels are elevated in some areas. While many spots remain safe, we advise checking local conditions and being cautious, especially with children and pets.\n\n";
    } else if (overallRiskLevel === 'low') {
      bulletin += "✅ **Generally Safe**: Cyanobacteria levels are low across the region. Most areas are suitable for swimming and water activities, though it's always wise to observe local water conditions.\n\n";
    } else {
      bulletin += "🌊 **All Clear**: No significant cyanobacteria detected this week. The waters are inviting! Enjoy your coastal activities safely.\n\n";
    }

    if (hotspots.length > 0) {
      bulletin += "**Areas to Avoid**:\n";
      hotspots.slice(0, 3).forEach(h => {
        const emoji = h.severity === 'high' ? '🔴' : h.severity === 'medium' ? '🟡' : '🟢';
        const trendEmoji = h.trend === 'increasing' ? '📈' : h.trend === 'decreasing' ? '📉' : '➡️';
        bulletin += `${emoji} ${h.areaName} - ${h.severity} severity ${trendEmoji}\n`;
      });
      bulletin += "\n";
    }

    if (safeAreas.length > 0) {
      bulletin += "**Safe Areas for Activities**:\n";
      safeAreas.slice(0, 5).forEach(area => {
        bulletin += `✓ ${area}\n`;
      });
      bulletin += "\n";
    }

    bulletin += "*Remember: Conditions can change quickly. Always observe water color and avoid areas with visible green scum. If in doubt, stay out!*";

    return bulletin;
  }

  private static generateExpertNote(summary: BloomSummary): string {
    const { totalObservations, hotspots, overallRiskLevel } = summary;

    let note = `**Technical Summary**\n\n`;
    note += `Total observations recorded: ${totalObservations}\n`;
    note += `Overall risk classification: ${overallRiskLevel.toUpperCase()}\n`;
    note += `Active hotspots: ${hotspots.length}\n\n`;

    if (hotspots.length > 0) {
      note += "**Hotspot Analysis**:\n";
      hotspots.forEach(h => {
        note += `• ${h.areaName}: ${h.observationCount} observations, ${h.severity} severity, trend ${h.trend}\n`;
      });
      note += "\n";
    }

    note += "**Recommended Actions**:\n";
    if (overallRiskLevel === 'high' || overallRiskLevel === 'medium') {
      note += "• Increase monitoring frequency in hotspot areas\n";
      note += "• Issue public advisories and update signage\n";
      note += "• Consider water sampling for toxin analysis\n";
      note += "• Coordinate with health authorities if persistent\n";
    } else {
      note += "• Maintain regular monitoring schedule\n";
      note += "• Continue public awareness programs\n";
    }

    return note;
  }

  private static selectDiverseActors(actors: Actor[], count: number): Actor[] {
    // Prioritize mix of startups and investors, and different countries
    const startups = actors.filter(a => a.type === 'startup');
    const investors = actors.filter(a => a.type === 'investor');

    const selected: Actor[] = [];
    const startupsNeeded = Math.floor(count * 0.6);
    const investorsNeeded = count - startupsNeeded;

    // Shuffle and select
    const shuffled = (arr: Actor[]) => arr.sort(() => Math.random() - 0.5);
    
    selected.push(...shuffled(startups).slice(0, startupsNeeded));
    selected.push(...shuffled(investors).slice(0, investorsNeeded));

    return selected.slice(0, count);
  }
  
  // Case Study methods
  static async generateCaseStudy(
    input: CaseStudyInput,
    startup: Actor,
    summary?: BloomSummary
  ): Promise<StartupCaseStudy> {
    if (this.observations.length === 0) await this.loadData();
    
    const caseStudy = buildCaseStudyFromInput(input, startup, summary);
    return caseStudy;
  }
  
  static async saveCaseStudy(caseStudy: StartupCaseStudy): Promise<boolean> {
    if (this.observations.length === 0) await this.loadData();
    
    // Check if case study with same ID exists
    const existingIndex = this.caseStudies.findIndex(cs => cs.id === caseStudy.id);
    
    if (existingIndex >= 0) {
      // Update existing
      this.caseStudies[existingIndex] = caseStudy;
    } else {
      // Add new
      this.caseStudies.push(caseStudy);
    }
    
    return true;
  }
  
  static async getStartupCaseStudies(startupId: string): Promise<StartupCaseStudy[]> {
    if (this.observations.length === 0) await this.loadData();
    
    return this.caseStudies.filter(cs => cs.startupId === startupId);
  }
  
  static async getAllCaseStudies(): Promise<StartupCaseStudy[]> {
    if (this.observations.length === 0) await this.loadData();
    
    return this.caseStudies;
  }
  
  // Solution Gap Radar methods
  static async analyzeGaps(
    summary: BloomSummary
  ): Promise<SolutionGap[]> {
    if (this.observations.length === 0) await this.loadData();
    
    const startups = this.actors.filter(a => a.type === "startup");
    return buildGapRadar(summary, startups);
  }
  
  // Collaboration Clusters methods
  static async buildCollaborationClusters(
    summary: BloomSummary
  ): Promise<CollaborationCluster[]> {
    if (this.observations.length === 0) await this.loadData();
    
    const startups = this.actors.filter(a => a.type === "startup");
    return buildClustersForSituation(summary, startups);
  }
}
