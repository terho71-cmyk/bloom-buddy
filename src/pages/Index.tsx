import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegionWeekSelector } from "@/components/RegionWeekSelector";
import { BloomSummaryCard } from "@/components/BloomSummaryCard";
import { BulletinCard } from "@/components/BulletinCard";
import { ActorRecommendations } from "@/components/ActorRecommendations";
import { ClusterCard } from "@/components/ClusterCard";
import { ClusterDetailDialog } from "@/components/ClusterDetailDialog";
import { StartupProfileDialog } from "@/components/StartupProfileDialog";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BloomApi } from "@/services/bloomApi";
import { BloomSummary, BulletinResponse, Recommendation, CollaborationCluster, Actor } from "@/types/bloom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Waves, Building2, Radar, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const Index = () => {
  const [regions, setRegions] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<BloomSummary | null>(null);
  const [bulletin, setBulletin] = useState<BulletinResponse | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [clusters, setClusters] = useState<CollaborationCluster[] | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<CollaborationCluster | null>(null);
  const [clusterDialogOpen, setClusterDialogOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Actor | null>(null);
  const [startupDialogOpen, setStartupDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

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
        description: "Failed to load observation data. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const handleAnalyze = async () => {
    if (!selectedRegion || !selectedWeek) return;

    setLoading(true);
    setSummary(null);
    setBulletin(null);
    setRecommendations(null);
    setClusters(null);

    try {
      // Get bloom summary
      const summaryData = await BloomApi.getBloomSummary(selectedRegion, selectedWeek);
      setSummary(summaryData);

      // Generate bulletin
      const bulletinData = await BloomApi.generateBulletin(summaryData);
      setBulletin(bulletinData);

      // Get recommendations
      const recsData = await BloomApi.recommendActors(summaryData);
      setRecommendations(recsData);
      
      // Get collaboration clusters
      const clustersData = await BloomApi.buildCollaborationClusters(summaryData);
      setClusters(clustersData);

      toast({
        title: t("analysis.complete"),
        description: t("analysis.complete.desc")
      });
    } catch (error) {
      toast({
        title: t("analysis.failed"),
        description: t("analysis.failed.desc"),
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
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-gradient-ocean text-primary-foreground py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Waves className="h-8 w-8" />
                <h1 className="text-4xl font-heading font-bold">{t("app.name")}</h1>
              </div>
              <p className="text-lg opacity-90">
                {t("app.tagline")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <NavLink 
                  to="/startups" 
                  className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
                >
                  <Building2 className="h-5 w-5" />
                  <span>{t("nav.startups")}</span>
                </NavLink>
                <NavLink 
                  to="/investors" 
                  className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
                >
                  <Building2 className="h-5 w-5" />
                  <span>{t("nav.investors")}</span>
                </NavLink>
                <NavLink 
                  to="/solution-gaps" 
                  className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
                >
                  <Radar className="h-5 w-5" />
                  <span>{t("nav.gaps")}</span>
                </NavLink>
                <NavLink 
                  to="/clusters" 
                  className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span>{t("nav.clusters")}</span>
                </NavLink>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <RegionWeekSelector
              regions={regions}
              weeks={weeks}
              selectedRegion={selectedRegion}
              selectedWeek={selectedWeek}
              onRegionChange={setSelectedRegion}
              onWeekChange={setSelectedWeek}
              onAnalyze={handleAnalyze}
              loading={loading}
            />
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Waves className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">{t("analysis.loading")}</p>
                </div>
              </div>
            )}

            {!loading && !summary && (
              <div className="text-center py-12">
                <Waves className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-heading font-semibold mb-2">{t("analysis.title")}</h2>
                <p className="text-muted-foreground">
                  {t("analysis.description")}
                </p>
              </div>
            )}

            {!loading && summary && (
              <Tabs defaultValue="bulletin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="bulletin">{t("tab.bulletin")}</TabsTrigger>
                  <TabsTrigger value="solutions">{t("tab.solutions")}</TabsTrigger>
                </TabsList>

                <TabsContent value="bulletin" className="space-y-6">
                  <BloomSummaryCard summary={summary} />
                  {bulletin && <BulletinCard bulletin={bulletin} />}
                </TabsContent>

                <TabsContent value="solutions">
                  {recommendations && recommendations.length > 0 && summary ? (
                    <div className="space-y-8">
                      <ActorRecommendations recommendations={recommendations} summary={summary} />
                      
                      {/* Collaboration Clusters */}
                      {clusters && clusters.length > 0 && (
                        <div className="mt-8">
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-6 w-6 text-primary" />
                              <h2 className="text-2xl font-heading font-bold">
                                {t("clusters.title")}
                              </h2>
                            </div>
                            <p className="text-muted-foreground">
                              {t("clusters.description")}
                            </p>
                          </div>
                          
                          <div className="grid gap-6 md:grid-cols-2">
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
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">{t("clusters.no.recommendations")}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t("footer.text")}</p>
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
};

export default Index;
