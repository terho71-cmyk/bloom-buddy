import { useState, useEffect } from "react";
import { Actor, BloomSummary, ImpactSimulationInput, ImpactSimulationResult } from "@/types/bloom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingDown, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { simulateImpact } from "@/lib/impact";
import { BloomApi } from "@/services/bloomApi";
import { useToast } from "@/hooks/use-toast";

interface ImpactSandboxProps {
  actor: Actor;
  region?: string;
  week?: number;
  onNeedRegionWeek?: () => void;
}

export function ImpactSandbox({ actor, region, week, onNeedRegionWeek }: ImpactSandboxProps) {
  const { toast } = useToast();
  const [durationWeeks, setDurationWeeks] = useState<number>(8);
  const [deploymentIntensity, setDeploymentIntensity] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<ImpactSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [summary, setSummary] = useState<BloomSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Fetch summary when region and week are available
  useEffect(() => {
    if (region && week !== undefined) {
      setLoadingSummary(true);
      BloomApi.getBloomSummary(region, week)
        .then(setSummary)
        .catch(() => {
          toast({
            title: "Failed to load bloom data",
            description: "Could not fetch bloom summary for simulation.",
            variant: "destructive"
          });
        })
        .finally(() => setLoadingSummary(false));
    } else {
      setSummary(null);
    }
  }, [region, week]);

  const handleRunSimulation = async () => {
    if (!summary || !region || week === undefined) {
      onNeedRegionWeek?.();
      return;
    }

    setIsSimulating(true);
    
    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const input: ImpactSimulationInput = {
      region,
      startWeek: week,
      durationWeeks,
      deploymentIntensity
    };
    
    const simulationResult = simulateImpact(summary, actor, input);
    setResult(simulationResult);
    setIsSimulating(false);
  };

  // Prepare chart data
  const chartData = result?.points.map(point => ({
    week: `W${result.startWeek + point.weekOffset}`,
    Baseline: point.baselineRisk,
    "With Solution": point.withSolutionRisk
  }));

  // Calculate stats from result
  const stats = result ? {
    avgBaseline: Math.round(result.points.reduce((sum, p) => sum + p.baselineRisk, 0) / result.points.length),
    avgWithSolution: Math.round(result.points.reduce((sum, p) => sum + p.withSolutionRisk, 0) / result.points.length),
    maxDifference: Math.max(...result.points.map(p => p.baselineRisk - p.withSolutionRisk)),
    significantWeeks: result.points.filter(p => p.baselineRisk - p.withSolutionRisk >= 15).length
  } : null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-heading font-semibold">Impact Sandbox</h3>
      </div>

      {!region || week === undefined ? (
        <Card className="p-6 text-center border-2 border-dashed">
          <AlertCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <h4 className="text-lg font-heading font-semibold mb-2">Simulate Solution Impact</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Select a region and week to run a simulation of how this startup's solution could reduce cyanobacteria risk over time.
          </p>
          <Button onClick={onNeedRegionWeek} variant="outline">
            Select Region & Week
          </Button>
        </Card>
      ) : (
        <>
          {/* Controls */}
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Select
                  value={durationWeeks.toString()}
                  onValueChange={(val) => setDurationWeeks(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 weeks</SelectItem>
                    <SelectItem value="8">8 weeks</SelectItem>
                    <SelectItem value="12">12 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Deployment Intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={deploymentIntensity === "low" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeploymentIntensity("low")}
                    className="text-xs"
                  >
                    Low
                  </Button>
                  <Button
                    variant={deploymentIntensity === "medium" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeploymentIntensity("medium")}
                    className="text-xs"
                  >
                    Medium
                  </Button>
                  <Button
                    variant={deploymentIntensity === "high" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeploymentIntensity("high")}
                    className="text-xs"
                  >
                    High
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {deploymentIntensity === "low" && "Few pilot sites"}
                  {deploymentIntensity === "medium" && "Multiple locations"}
                  {deploymentIntensity === "high" && "Full rollout"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Scenario: {region}, starting week {week}</span>
            </div>

            <Button 
              onClick={handleRunSimulation} 
              disabled={isSimulating || loadingSummary}
              className="w-full"
            >
              {loadingSummary ? "Loading..." : isSimulating ? "Running simulation..." : "Run simulation"}
            </Button>
          </Card>

          {/* Results */}
          {result && (
            <Card className="p-6 space-y-6">
              {/* Headline */}
              <div className="flex items-start gap-3">
                <TrendingDown className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="text-lg font-heading font-semibold mb-1">{result.headline}</h4>
                  <p className="text-sm text-muted-foreground">
                    Scenario for {result.region}, starting week {result.startWeek}, duration {result.durationWeeks} weeks
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="week" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      label={{ value: 'Risk (0-100)', angle: -90, position: 'insideLeft' }}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Baseline" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--destructive))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="With Solution" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-xs font-medium text-muted-foreground">Avg Risk Reduction</p>
                    <p className="text-lg font-semibold">{stats.avgBaseline - stats.avgWithSolution} points</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-xs font-medium text-muted-foreground">Max Weekly Reduction</p>
                    <p className="text-lg font-semibold">{stats.maxDifference} points</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-xs font-medium text-muted-foreground">Weeks with ≥15pt Drop</p>
                    <p className="text-lg font-semibold">{stats.significantWeeks} weeks</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Simulation Notes:</p>
                <ul className="space-y-1">
                  {result.notes.map((note, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="pt-4 border-t">
                <Badge variant="outline" className="text-xs">
                  Simplified impact sandbox for storytelling and planning — not a scientific forecast
                </Badge>
              </div>
            </Card>
          )}
        </>
      )}
    </section>
  );
}
