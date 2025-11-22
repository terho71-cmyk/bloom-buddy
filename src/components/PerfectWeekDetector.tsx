import { useState } from "react";
import { Actor, PerfectWeekOverview } from "@/types/bloom";
import { BloomApi } from "@/services/bloomApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Sparkles, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PerfectWeekDetectorProps {
  startup: Actor;
}

export function PerfectWeekDetector({ startup }: PerfectWeekDetectorProps) {
  const { toast } = useToast();
  const [region, setRegion] = useState<string>("");
  const [startWeek, setStartWeek] = useState<number>(26);
  const [endWeek, setEndWeek] = useState<number>(35);
  const [detecting, setDetecting] = useState(false);
  const [results, setResults] = useState<PerfectWeekOverview | null>(null);
  
  const [regions] = useState<string[]>(() => BloomApi.getAvailableRegions());

  const handleDetect = async () => {
    if (!region) {
      toast({
        title: "Select a region",
        description: "Please choose a region to scan for perfect weeks.",
        variant: "default"
      });
      return;
    }

    if (startWeek > endWeek) {
      toast({
        title: "Invalid week range",
        description: "Start week must be before or equal to end week.",
        variant: "destructive"
      });
      return;
    }

    setDetecting(true);
    try {
      const weeks: number[] = [];
      for (let w = startWeek; w <= endWeek; w++) {
        weeks.push(w);
      }
      
      const overview = await BloomApi.findPerfectWeeks(startup.id, region, weeks);
      setResults(overview);
      
      if (overview.matches.length === 0) {
        toast({
          title: "No perfect weeks found",
          description: "No weeks matched your alert rules in this period.",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Detection failed",
        description: "Could not analyze weeks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDetecting(false);
    }
  };

  // Group matches by week
  const matchesByWeek = results?.matches.reduce((acc, match) => {
    if (!acc[match.week]) {
      acc[match.week] = [];
    }
    acc[match.week].push(match);
    return acc;
  }, {} as Record<number, typeof results.matches>) || {};

  // Generate week timeline
  const allWeeks: number[] = [];
  if (startWeek && endWeek) {
    for (let w = startWeek; w <= endWeek; w++) {
      allWeeks.push(w);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-heading font-semibold">Perfect Week Detector</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Scan multiple weeks to find ideal moments for outreach, pilots, or investor pitches based on your alert rules.
      </p>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Region</label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Choose region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Start Week</label>
            <Select value={startWeek.toString()} onValueChange={(val) => setStartWeek(parseInt(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                  <SelectItem key={w} value={w.toString()}>
                    Week {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">End Week</label>
            <Select value={endWeek.toString()} onValueChange={(val) => setEndWeek(parseInt(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                  <SelectItem key={w} value={w.toString()}>
                    Week {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleDetect} disabled={detecting} className="w-full gap-2">
          <Target className="h-4 w-4" />
          {detecting ? "Analyzing..." : "Find perfect weeks"}
        </Button>
      </Card>

      {/* Results */}
      {results && (
        <Card className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h4 className="text-lg font-heading font-semibold">
              Results for {results.region}
            </h4>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Week Timeline</p>
            <div className="flex flex-wrap gap-2">
              {allWeeks.map((week) => {
                const isPerfect = !!matchesByWeek[week];
                return (
                  <div
                    key={week}
                    className={`px-3 py-2 rounded-md border-2 text-center min-w-[60px] ${
                      isPerfect
                        ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-muted border-muted text-muted-foreground"
                    }`}
                  >
                    {isPerfect && <Sparkles className="h-3 w-3 inline mr-1" />}
                    <span className="text-xs font-medium">W{week}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <Sparkles className="h-3 w-3 inline mr-1 text-green-500" />
              = Perfect week (matches alert rules)
            </p>
          </div>

          {/* Matched Weeks Details */}
          {results.matches.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {results.matches.length} Perfect Week{results.matches.length > 1 ? "s" : ""} Found
              </p>
              <div className="space-y-3">
                {Object.entries(matchesByWeek).map(([week, matches]) => (
                  <div
                    key={week}
                    className="p-4 bg-green-50 border border-green-200 rounded-md dark:bg-green-950 dark:border-green-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          Week {week}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-300">
                        {matches.length} rule{matches.length > 1 ? "s" : ""} matched
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {matches.map((match, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="font-medium text-green-800 dark:text-green-200">
                            "{match.ruleName}"
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                            {match.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.matches.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No weeks matched your alert rules in this period. Try adjusting your rules or selecting a different time range.
            </p>
          )}
        </Card>
      )}
    </section>
  );
}
