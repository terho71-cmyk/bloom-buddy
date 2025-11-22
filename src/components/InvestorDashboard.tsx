import { useState, useEffect } from "react";
import { Actor, BloomSummary, InvestorViewSummary } from "@/types/bloom";
import { BloomApi } from "@/services/bloomApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, Lightbulb, AlertTriangle, ExternalLink, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StartupProfileDialog } from "./StartupProfileDialog";

interface InvestorDashboardProps {
  investor: Actor;
  region: string;
  week: number;
}

export function InvestorDashboard({ investor, region, week }: InvestorDashboardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<BloomSummary | null>(null);
  const [investorView, setInvestorView] = useState<InvestorViewSummary | null>(null);
  const [selectedStartup, setSelectedStartup] = useState<Actor | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    loadInvestorView();
  }, [investor.id, region, week]);

  const loadInvestorView = async () => {
    setLoading(true);
    try {
      const bloomSummary = await BloomApi.getBloomSummary(region, week);
      setSummary(bloomSummary);
      
      const view = BloomApi.buildInvestorView(bloomSummary, investor);
      setInvestorView(view);
    } catch (error) {
      toast({
        title: "Failed to load investor view",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewStartup = (startup: Actor) => {
    setSelectedStartup(startup);
    setProfileDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!investorView || !summary) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Unable to load investor view.</p>
      </Card>
    );
  }

  const { situationRelevance, topDealFlow, portfolioInsights, underServedThemes } = investorView;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">{investor.name}</h1>
        <p className="text-muted-foreground">
          Dashboard for {region}, Week {week}
        </p>
      </div>

      {/* Section A: Situation Relevance */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Target 
            className="h-8 w-8 flex-shrink-0 mt-1"
            style={{
              color: situationRelevance.label === "High" ? "rgb(34, 197, 94)" :
                     situationRelevance.label === "Medium" ? "rgb(245, 158, 11)" :
                     "rgb(156, 163, 175)"
            }}
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-heading font-semibold">Situation Relevance</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  How this situation aligns with your investment thesis
                </p>
              </div>
              <div className="text-right">
                <Badge
                  variant="outline"
                  className="text-lg px-3 py-1"
                  style={{
                    borderColor: situationRelevance.label === "High" ? "rgb(34, 197, 94)" :
                               situationRelevance.label === "Medium" ? "rgb(245, 158, 11)" :
                               "rgb(156, 163, 175)",
                    color: situationRelevance.label === "High" ? "rgb(34, 197, 94)" :
                          situationRelevance.label === "Medium" ? "rgb(245, 158, 11)" :
                          "rgb(156, 163, 175)"
                  }}
                >
                  {situationRelevance.score}/100
                </Badge>
                <p
                  className="text-xs font-semibold mt-1"
                  style={{
                    color: situationRelevance.label === "High" ? "rgb(34, 197, 94)" :
                          situationRelevance.label === "Medium" ? "rgb(245, 158, 11)" :
                          "rgb(156, 163, 175)"
                  }}
                >
                  {situationRelevance.label} Relevance
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">{situationRelevance.explanation}</p>
          </div>
        </div>
      </Card>

      {/* Section B: Deal Flow */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-heading font-semibold">High-Potential Startups</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Top deal flow opportunities for this situation
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topDealFlow.map((item) => (
            <Card key={item.startup.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-semibold">{item.startup.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.startup.country}</p>
                  </div>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: item.fitLabel === "High" ? "rgb(34, 197, 94)" :
                                 item.fitLabel === "Medium" ? "rgb(245, 158, 11)" :
                                 "rgb(156, 163, 175)",
                      color: item.fitLabel === "High" ? "rgb(34, 197, 94)" :
                            item.fitLabel === "Medium" ? "rgb(245, 158, 11)" :
                            "rgb(156, 163, 175)"
                    }}
                  >
                    {item.fitScore} — {item.fitLabel}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.startup.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {item.startup.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-1">
                  {item.reasons.map((reason, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleViewStartup(item.startup)}
                    variant="default"
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View profile
                  </Button>
                  <Button
                    onClick={() => window.open(item.startup.url, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section C: Portfolio Fit */}
      {portfolioInsights.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-heading font-semibold">Portfolio Fit Insights</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            How these startups complement your existing portfolio
          </p>
          <ul className="space-y-2">
            {portfolioInsights.map((insight, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>{insight.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Section D: Under-Served Themes */}
      {underServedThemes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-heading font-semibold">Under-Served Themes</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Investment opportunities revealed by current situation
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {underServedThemes.map((theme, idx) => (
              <Card key={idx} className="p-5 border-2 border-dashed border-accent/30">
                <div className="space-y-3">
                  <h3 className="text-lg font-heading font-semibold">{theme.theme}</h3>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong>Why it's under-served:</strong> {theme.reason}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Startup Profile Dialog */}
      <StartupProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        startup={selectedStartup}
        region={region}
        week={week}
      />
    </div>
  );
}
