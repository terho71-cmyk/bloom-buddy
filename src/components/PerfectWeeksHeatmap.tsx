import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { BloomApi } from "@/services/bloomApi";
import { PerfectWeekMatch, AlertUseCase, StartupAlertRule } from "@/types/bloom";
import { Calendar, TrendingUp, Target, Users, Rocket } from "lucide-react";

interface PerfectWeeksHeatmapProps {
  startupId: string;
}

export function PerfectWeeksHeatmap({ startupId }: PerfectWeeksHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<Record<string, Record<number, PerfectWeekMatch[]>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedUseCases, setSelectedUseCases] = useState<Set<AlertUseCase>>(
    new Set(["pilot", "sales", "investor"])
  );
  const [allRules, setAllRules] = useState<StartupAlertRule[]>([]);
  
  const regions = ["Turku archipelago", "Helsinki archipelago", "Vaasa archipelago"];
  const weeks = Array.from({ length: 14 }, (_, i) => 17 + i); // weeks 17-30
  
  // Calculate perfect weeks for all regions
  useEffect(() => {
    const loadHeatmapData = async () => {
      setLoading(true);
      const data: Record<string, Record<number, PerfectWeekMatch[]>> = {};
      
      // Load rules first
      const rules = BloomApi.getStartupAlerts(startupId);
      setAllRules(rules);
      
      for (const region of regions) {
        data[region] = {};
        const result = await BloomApi.findPerfectWeeks(startupId, region, weeks);
        
        result.matches.forEach(match => {
          if (!data[region][match.week]) {
            data[region][match.week] = [];
          }
          data[region][match.week].push(match);
        });
      }
      
      setHeatmapData(data);
      setLoading(false);
    };
    
    loadHeatmapData();
  }, [startupId]);

  // Group weeks by month
  const getMonthFromWeek = (week: number) => {
    // Approximate: weeks 17-21 = May, 22-26 = June, 27-30 = July
    if (week <= 21) return "May";
    if (week <= 26) return "June";
    return "July";
  };

  const monthGroups = useMemo(() => {
    const groups: Record<string, number[]> = {};
    weeks.forEach(week => {
      const month = getMonthFromWeek(week);
      if (!groups[month]) groups[month] = [];
      groups[month].push(week);
    });
    return groups;
  }, [weeks]);

  const getUseCaseColor = (useCase: AlertUseCase) => {
    switch (useCase) {
      case "pilot":
        return {
          bg: "bg-blue-500/80",
          border: "border-blue-500",
          text: "text-blue-500"
        };
      case "sales":
        return {
          bg: "bg-green-500/80",
          border: "border-green-500",
          text: "text-green-500"
        };
      case "investor":
        return {
          bg: "bg-purple-500/80",
          border: "border-purple-500",
          text: "text-purple-500"
        };
    }
  };

  const getCellColor = (matches: PerfectWeekMatch[]) => {
    if (matches.length === 0) return "bg-muted/30 border-border/50";
    
    // Get unique use cases for these matches
    const useCases = new Set<AlertUseCase>();
    matches.forEach(match => {
      const rule = allRules.find(r => r.id === match.ruleId);
      if (rule) useCases.add(rule.useCase);
    });
    
    // If multiple use cases, use a gradient/mixed color
    if (useCases.size > 1) {
      return "bg-gradient-to-br from-blue-500/60 via-green-500/60 to-purple-500/60 border-primary";
    }
    
    // Single use case - use its color
    const useCase = Array.from(useCases)[0];
    const colors = getUseCaseColor(useCase);
    return `${colors.bg} ${colors.border}`;
  };

  const getIntensityColor = (matchCount: number) => {
    if (matchCount === 0) return "bg-muted/30";
    if (matchCount === 1) return "bg-primary/30";
    if (matchCount === 2) return "bg-primary/60";
    return "bg-primary";
  };

  const toggleUseCase = (useCase: AlertUseCase) => {
    setSelectedUseCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(useCase)) {
        newSet.delete(useCase);
      } else {
        newSet.add(useCase);
      }
      return newSet;
    });
  };

  const getUseCaseIcon = (useCase: AlertUseCase) => {
    switch (useCase) {
      case "pilot":
        return <Target className="h-3 w-3" />;
      case "sales":
        return <TrendingUp className="h-3 w-3" />;
      case "investor":
        return <Users className="h-3 w-3" />;
    }
  };

  const getUseCaseLabel = (useCase: AlertUseCase) => {
    switch (useCase) {
      case "pilot":
        return "Pilots";
      case "sales":
        return "Sales";
      case "investor":
        return "Investors";
    }
  };

  // Filter matches based on selected use cases
  const filteredHeatmapData = useMemo(() => {
    if (selectedUseCases.size === 0) return {};
    if (allRules.length === 0) return heatmapData; // Return all if rules not loaded yet
    
    const filtered: Record<string, Record<number, PerfectWeekMatch[]>> = {};
    
    Object.entries(heatmapData).forEach(([region, weeks]) => {
      filtered[region] = {};
      Object.entries(weeks).forEach(([week, matches]) => {
        const filteredMatches = matches.filter(match => {
          const rule = allRules.find(r => r.id === match.ruleId);
          return rule && selectedUseCases.has(rule.useCase);
        });
        if (filteredMatches.length > 0) {
          filtered[region][parseInt(week)] = filteredMatches;
        }
      });
    });
    
    return filtered;
  }, [heatmapData, selectedUseCases, allRules]);

  const totalPerfectWeeks = useMemo(() => {
    let total = 0;
    Object.values(filteredHeatmapData).forEach(regionData => {
      total += Object.keys(regionData).length;
    });
    return total;
  }, [filteredHeatmapData]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Perfect Weeks Overview
          </CardTitle>
          <CardDescription>Loading heatmap data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Analyzing weeks...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Perfect Weeks Overview</CardTitle>
          </div>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {totalPerfectWeeks} Perfect Weeks
          </Badge>
        </div>
        <CardDescription>
          Heatmap showing ideal weeks for outreach across all regions
        </CardDescription>
        
        {/* Use Case Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-sm text-muted-foreground mr-2">Filter by use case:</span>
          {(["pilot", "sales", "investor"] as AlertUseCase[]).map(useCase => (
            <Button
              key={useCase}
              variant={selectedUseCases.has(useCase) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleUseCase(useCase)}
              className="gap-1.5"
            >
              {getUseCaseIcon(useCase)}
              {getUseCaseLabel(useCase)}
            </Button>
          ))}
          {selectedUseCases.size === 0 && (
            <span className="text-xs text-muted-foreground italic ml-2">
              Select at least one use case
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legend */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground text-xs font-medium">Use Case Colors:</span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-blue-500/80 border border-blue-500" />
                  <Target className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Pilots</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-green-500/80 border border-green-500" />
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">Sales</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-purple-500/80 border border-purple-500" />
                  <Users className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Investors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500/60 via-green-500/60 to-purple-500/60 border border-primary" />
                  <span className="text-xs text-muted-foreground">Multiple</span>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto -mx-6 px-6">
            <TooltipProvider>
              <div className="min-w-max">
                {/* Month headers */}
                <div className="flex mb-2">
                  <div className="w-32 flex-shrink-0" />
                  {Object.entries(monthGroups).map(([month, monthWeeks]) => (
                    <div
                      key={month}
                      className="text-center font-semibold text-sm"
                      style={{ width: `${monthWeeks.length * 36}px` }}
                    >
                      {month}
                    </div>
                  ))}
                </div>

                {/* Week numbers */}
                <div className="flex mb-1">
                  <div className="w-32 flex-shrink-0" />
                  {weeks.map(week => (
                    <div key={week} className="w-9 text-center text-xs text-muted-foreground">
                      {week}
                    </div>
                  ))}
                </div>

                {/* Region rows */}
                {regions.map(region => (
                  <div key={region} className="flex items-center mb-1">
                    <div className="w-32 flex-shrink-0 text-xs font-medium pr-2 truncate" title={region}>
                      {region.replace(" archipelago", "")}
                    </div>
                    <div className="flex gap-0.5">
                      {weeks.map(week => {
                        const matches = filteredHeatmapData[region]?.[week] || [];
                        const matchCount = matches.length;
                        const cellColor = getCellColor(matches);

                        return (
                          <Tooltip key={`${region}-${week}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-8 h-8 rounded cursor-pointer transition-all hover:scale-110 hover:shadow-md ${cellColor}`}
                              />
                            </TooltipTrigger>
                            {matchCount > 0 && (
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-2">
                                  <div className="font-semibold">
                                    {region} - Week {week}
                                  </div>
                                  <div className="text-xs space-y-1">
                                    {matches.map((match, idx) => {
                                      const rule = allRules.find(r => r.id === match.ruleId);
                                      const colors = rule ? getUseCaseColor(rule.useCase) : null;
                                      return (
                                        <div key={idx} className={`border-l-2 pl-2 ${colors?.border || 'border-primary'}`}>
                                          <div className="flex items-center gap-1.5">
                                            {rule && getUseCaseIcon(rule.useCase)}
                                            <span className="font-medium">{match.ruleName}</span>
                                          </div>
                                          <div className="text-muted-foreground">{match.reason}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            {regions.map(region => {
              const perfectWeeksCount = Object.keys(filteredHeatmapData[region] || {}).length;
              return (
                <div key={region} className="text-center">
                  <div className="text-2xl font-bold text-primary">{perfectWeeksCount}</div>
                  <div className="text-xs text-muted-foreground">{region}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
