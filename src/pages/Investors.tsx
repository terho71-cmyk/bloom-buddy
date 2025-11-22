import { useState } from "react";
import { Actor } from "@/types/bloom";
import { BloomApi } from "@/services/bloomApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Building2, MapPin, Target } from "lucide-react";
import { InvestorDashboard } from "@/components/InvestorDashboard";
import { NavLink } from "@/components/NavLink";
import { useToast } from "@/hooks/use-toast";

export default function Investors() {
  const { toast } = useToast();
  const [actors] = useState<Actor[]>(() => BloomApi.getAllActors());
  const investors = actors.filter(a => a.type === "investor");
  
  const [selectedInvestor, setSelectedInvestor] = useState<Actor | null>(null);
  const [region, setRegion] = useState<string>("");
  const [week, setWeek] = useState<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const [regions] = useState<string[]>(() => BloomApi.getAvailableRegions());
  const [weeks, setWeeks] = useState<number[]>([]);

  const handleRegionChange = (selectedRegion: string) => {
    setRegion(selectedRegion);
    const availableWeeks = BloomApi.getWeeksForRegion(selectedRegion);
    setWeeks(availableWeeks);
    if (availableWeeks.length > 0) {
      setWeek(availableWeeks[0]);
    }
  };

  const handleOpenDashboard = (investor: Actor) => {
    setSelectedInvestor(investor);
    if (region && week !== null) {
      setShowDashboard(true);
    } else {
      // Show toast prompting user to select region and week
      toast({
        title: "Select region and week first",
        description: "Please choose a region and week above to view the investor dashboard.",
        variant: "default"
      });
    }
  };

  if (showDashboard && selectedInvestor && region && week !== null) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Button 
            onClick={() => setShowDashboard(false)} 
            variant="outline"
            className="mb-6"
          >
            ← Back to investors
          </Button>
          
          <InvestorDashboard
            investor={selectedInvestor}
            region={region}
            week={week}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="text-2xl font-heading font-bold text-primary hover:text-primary/80">
              BlueBloom Hub
            </NavLink>
            <NavLink to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </NavLink>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold">Investor View</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            See how cyanobacteria situations translate into deal flow and portfolio opportunities.
          </p>
        </div>

        {/* Region & Week Selection */}
        <Card className="p-6 mb-8 border-2 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-lg font-heading font-semibold">Step 1: Select Context</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Choose a region and week to analyze investment opportunities
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select value={region} onValueChange={handleRegionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a region" />
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
              <label className="text-sm font-medium mb-2 block">Week</label>
              <Select
                value={week?.toString() || ""}
                onValueChange={(val) => setWeek(parseInt(val))}
                disabled={!region}
              >
                <SelectTrigger>
                  <SelectValue placeholder={region ? "Choose a week" : "Select region first"} />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((w) => (
                    <SelectItem key={w} value={w.toString()}>
                      Week {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {region && week !== null && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">
                Ready! Context selected: {region}, Week {week}
              </p>
            </div>
          )}
        </Card>

        {/* Investors Grid */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {region && week !== null && (
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
            <h2 className="text-2xl font-heading font-semibold">
              {region && week !== null ? "Step 2: Choose Investor" : "Investors"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {region && week !== null 
              ? "Click on any investor below to view their personalized dashboard"
              : "Select a region and week above to get started"
            }
          </p>
          
          {investors.length === 0 ? (
            <Card className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No investors available in the dataset.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investors.map((investor) => (
                <Card key={investor.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-heading font-semibold">{investor.name}</h3>
                        <Building2 className="h-5 w-5 text-accent flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{investor.country}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {investor.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {investor.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {investor.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{investor.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Investor Details */}
                    {investor.investorDetails && (
                      <div className="space-y-2 pt-2 border-t">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Stage Focus</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {investor.investorDetails.stageFocus.map((stage, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {stage}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Geography</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {investor.investorDetails.geographyFocus.map((geo, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {geo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    <Button
                      onClick={() => handleOpenDashboard(investor)}
                      className="w-full gap-2"
                      variant={region && week !== null ? "default" : "outline"}
                    >
                      <Target className="h-4 w-4" />
                      Open investor dashboard
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
