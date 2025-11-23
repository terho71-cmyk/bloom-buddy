import { useState, useEffect } from "react";

import { RegionWeekSelector } from "@/components/RegionWeekSelector";
import { BloomSummaryCard } from "@/components/BloomSummaryCard";
import { BulletinCard } from "@/components/BulletinCard";
import { BloomApi } from "@/services/bloomApi";
import { BloomSummary, BulletinResponse } from "@/types/bloom";
import { useToast } from "@/hooks/use-toast";
import { Waves } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

const Index = () => {
  const [regions, setRegions] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<BloomSummary | null>(null);
  const [bulletin, setBulletin] = useState<BulletinResponse | null>(null);
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

    try {
      // Get bloom summary
      const summaryData = await BloomApi.getBloomSummary(selectedRegion, selectedWeek);
      setSummary(summaryData);

      // Generate bulletin
      const bulletinData = await BloomApi.generateBulletin(summaryData);
      setBulletin(bulletinData);

      toast({
        title: "Analysis complete",
        description: "Bloom situation analysis and recommendations generated successfully."
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to generate analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader />

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
                  <p className="text-lg text-muted-foreground">Analyzing bloom situation...</p>
                </div>
              </div>
            )}

            {!loading && !summary && (
              <div className="text-center py-12">
                <Waves className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-heading font-semibold mb-2">Select Region & Week</h2>
                <p className="text-muted-foreground">
                  Choose a region and week from the sidebar, then click "Generate Analysis" to view the cyanobacteria situation and recommendations.
                </p>
              </div>
            )}

            {!loading && summary && (
              <div className="space-y-6">
                <BloomSummaryCard summary={summary} />
                {bulletin && <BulletinCard bulletin={bulletin} />}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Company Alerts CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading flex items-center justify-center gap-2">
              <Building2 className="h-6 w-6 text-accent" />
              Are you a startup or company working with algae?
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Get notified when there are cyanobacteria blooms or algae to be harvested in your preferred region.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-8">
            <p className="text-sm text-muted-foreground max-w-2xl text-center">
              Companies working with algae cleanup, microalgae cultivation, or algae-based products can sign up to receive alerts about algae availability in specific areas around the Baltic Sea.
            </p>
            <NavLink to="/startups">
              <Button size="lg" className="gap-2">
                Go to startup signup
                <ArrowRight className="h-4 w-4" />
              </Button>
            </NavLink>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>BloomAlert • Powered by Apelago • Mock data for demonstration</p>
        </div>
      </footer>
      
    </div>
  );
};

export default Index;
