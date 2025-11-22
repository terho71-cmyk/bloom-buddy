import { useState, useEffect } from "react";
import { BloomApi } from "@/services/bloomApi";
import { BloomSummary, CollaborationCluster, Actor } from "@/types/bloom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClusterCard } from "@/components/ClusterCard";
import { ClusterDetailDialog } from "@/components/ClusterDetailDialog";
import { StartupProfileDialog } from "@/components/StartupProfileDialog";
import { NavLink } from "@/components/NavLink";
import { Users, Waves, ArrowLeft } from "lucide-react";

export default function Clusters() {
  const [regions, setRegions] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState<CollaborationCluster[]>([]);
  const [summary, setSummary] = useState<BloomSummary | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<CollaborationCluster | null>(null);
  const [clusterDialogOpen, setClusterDialogOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Actor | null>(null);
  const [startupDialogOpen, setStartupDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      const availableWeeks = BloomApi.getAvailableWeeks(selectedRegion);
      setWeeks(availableWeeks);
      if (availableWeeks.length > 0 && !availableWeeks.includes(selectedWeek)) {
        setSelectedWeek(availableWeeks[0]);
      }
    }
  }, [selectedRegion]);

  const initializeData = async () => {
    try {
      await BloomApi.loadData();
      const availableRegions = BloomApi.getAvailableRegions();
      setRegions(availableRegions);
      
      if (availableRegions.length > 0) {
        setSelectedRegion(availableRegions[0]);
        const availableWeeks = BloomApi.getAvailableWeeks(availableRegions[0]);
        setWeeks(availableWeeks);
        if (availableWeeks.length > 0) {
          setSelectedWeek(availableWeeks[0]);
        }
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const handleAnalyzeClusters = async () => {
    if (!selectedRegion || !selectedWeek) return;

    setLoading(true);
    setClusters([]);
    setSummary(null);

    try {
      const summaryData = await BloomApi.getBloomSummary(selectedRegion, selectedWeek);
      setSummary(summaryData);

      const clustersData = await BloomApi.buildCollaborationClusters(summaryData);
      setClusters(clustersData);

      toast({
        title: "Clusters generated",
        description: `Found ${clustersData.length} collaboration pack${clustersData.length !== 1 ? 's' : ''} for this situation.`
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to generate collaboration clusters. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewClusterDetails = (cluster: CollaborationCluster) => {
    setSelectedCluster(cluster);
    setClusterDialogOpen(true);
  };

  const handleViewStartupFromCluster = (startup: Actor) => {
    setSelectedStartup(startup);
    setStartupDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-light to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="text-2xl font-heading font-bold text-primary hover:text-primary/80">
              BlueBloom Hub
            </NavLink>
            <NavLink to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold">Collaboration Clusters</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Explore bundles of complementary startups that work together to provide comprehensive solutions for cyanobacteria challenges.
          </p>
        </div>

        {/* Region & Week Selector */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Select Region & Week</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Week</label>
              <Select 
                value={selectedWeek.toString()} 
                onValueChange={(value) => setSelectedWeek(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map(week => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAnalyzeClusters}
                disabled={!selectedRegion || !selectedWeek || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Waves className="h-4 w-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  "Generate Clusters"
                )}
              </Button>
            </div>
          </div>

          {summary && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Bloom Context</h3>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{summary.region}</span>, Week {summary.week} • 
                Risk: <span className="font-medium capitalize">{summary.overallRiskLevel}</span> • 
                {summary.hotspots.length} hotspot{summary.hotspots.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Building collaboration clusters...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !summary && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-heading font-semibold mb-2">Select Region & Week</h2>
            <p className="text-muted-foreground">
              Choose a region and week, then click "Generate Clusters" to discover collaboration packs.
            </p>
          </div>
        )}

        {/* Clusters Grid */}
        {!loading && clusters.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold mb-2">
                {clusters.length} Collaboration Pack{clusters.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-muted-foreground">
                These startup bundles work together to address the current bloom situation
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clusters.map(cluster => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  onViewDetails={handleViewClusterDetails}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Clusters State */}
        {!loading && summary && clusters.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-heading font-semibold mb-2">No Clusters Available</h2>
            <p className="text-muted-foreground">
              No strong collaboration packs could be identified for this situation. 
              Try a different region or week.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>BlueBloom Hub • Powered by Apelago • Mock data for demonstration</p>
        </div>
      </footer>

      {/* Dialogs */}
      <ClusterDetailDialog
        open={clusterDialogOpen}
        onOpenChange={setClusterDialogOpen}
        cluster={selectedCluster}
        onViewStartup={handleViewStartupFromCluster}
      />

      <StartupProfileDialog
        open={startupDialogOpen}
        onOpenChange={setStartupDialogOpen}
        startup={selectedStartup}
      />
    </div>
  );
}
