import { BloomObservation, BloomSummary, Actor, BulletinResponse, Recommendation } from "@/types/bloom";

// Mock API layer - can be replaced with real API calls later
export class BloomApi {
  private static observations: BloomObservation[] = [];
  private static actors: Actor[] = [];

  static async loadData() {
    // Load observations
    const obsResponse = await fetch('/data/bloom_observations.json');
    this.observations = await obsResponse.json();

    // Load actors
    const actorsResponse = await fetch('/data/actors.json');
    this.actors = await actorsResponse.json();
  }

  static async getBloomSummary(region: string, week: number): Promise<BloomSummary> {
    if (this.observations.length === 0) await this.loadData();

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
}
