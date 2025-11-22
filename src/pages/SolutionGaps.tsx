import { useState } from "react";
import { SolutionGap, BloomSummary } from "@/types/bloom";
import { BloomApi } from "@/services/bloomApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GapCard } from "@/components/GapCard";
import { NavLink } from "@/components/NavLink";
import { Radar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SolutionGaps() {
  const { toast } = useToast();
  const [region, setRegion] = useState<string>("");
  const [week, setWeek] = useState<number>(28);
  const [analyzing, setAnalyzing] = useState(false);
  const [gaps, setGaps] = useState<SolutionGap[]>([]);
  const [summary, setSummary] = useState<BloomSummary | null>(null);

  const regions = ["Turku archipelago", "Helsinki archipelago", "Vaasa archipelago"];
  const weeks = Array.from({ length: 14 }, (_, i) => 17 + i);

  const handleAnalyze = async () => {
    if (!region) {
      toast({
        title: "Region required",
        description: "Please select a region to analyze",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);

    try {
      const bloomSummary = await BloomApi.getBloomSummary(region, week);
      setSummary(bloomSummary);
      
      const gapResults = await BloomApi.analyzeGaps(bloomSummary);
      setGaps(gapResults);

      if (gapResults.length === 0) {
        toast({
          title: "No significant gaps found",
          description: "The current startup ecosystem appears to cover most needs for this situation"
        });
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Radar className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-heading font-bold">Solution Gap Radar</h1>
              </div>
              <nav className="hidden md:flex items-center gap-4">
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/startups">Startups</NavLink>
                <NavLink to="/investors">Investors</NavLink>
                <NavLink to="/solution-gaps">Gaps</NavLink>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-heading font-bold">
              Identify Under-Served Problem Areas
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover themes with high need based on bloom situations but limited startup coverage. 
              These gaps represent opportunities for new solutions, pivots, or investments.
            </p>
          </div>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Analyze Current Situation</CardTitle>
              <CardDescription>
                Select a region and week to identify solution gaps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Week</label>
                  <Select value={week.toString()} onValueChange={(v) => setWeek(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weeks.map(w => (
                        <SelectItem key={w} value={w.toString()}>Week {w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing || !region}
                    className="w-full gap-2"
                  >
                    <Radar className="h-4 w-4" />
                    {analyzing ? "Analyzing..." : "Analyze Gaps"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {summary && (
            <div className="space-y-6">
              {/* Context Card */}
              <Card className="bg-accent/10 border-accent/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-accent" />
                    <CardTitle>Bloom Situation Context</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Region</p>
                      <p className="font-semibold">{summary.region}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Overall Risk</p>
                      <p className="font-semibold capitalize">{summary.overallRiskLevel}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Affected Areas</p>
                      <p className="font-semibold">{summary.hotspots.length} hotspots</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gaps Grid */}
              {gaps.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-heading font-bold mb-2">
                      Solution Gaps ({gaps.length})
                    </h3>
                    <p className="text-muted-foreground">
                      These themes have high need but limited startup coverage
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {gaps.map((gap, idx) => (
                      <GapCard key={idx} gap={gap} />
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No significant solution gaps detected for this situation. 
                      The current startup ecosystem appears well-aligned with the needs.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Empty State */}
          {!summary && !analyzing && (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <Radar className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground">
                    Select a region and week above to identify solution gaps
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
