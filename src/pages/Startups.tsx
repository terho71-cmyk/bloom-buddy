import { useState, useEffect } from "react";
import { Actor, EnvironmentType, SolutionGap } from "@/types/bloom";
import { BloomApi } from "@/services/bloomApi";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Building2, AlertTriangle } from "lucide-react";
import { StartupProfileDialog } from "@/components/StartupProfileDialog";
import { NavLink } from "@/components/NavLink";
import { GapCard } from "@/components/GapCard";
import { Link } from "react-router-dom";
import { CompanyAlertsSection } from "@/components/CompanyAlertsSection";

export default function Startups() {
  const [startups, setStartups] = useState<Actor[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Actor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnvironments, setSelectedEnvironments] = useState<EnvironmentType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<Actor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topGaps, setTopGaps] = useState<SolutionGap[]>([]);

  const allEnvironments: EnvironmentType[] = ["coastal", "lakes", "rivers", "ports", "farms", "urban"];
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    loadStartups();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [startups, searchTerm, selectedEnvironments, selectedTags]);

  const loadStartups = async () => {
    await BloomApi.loadData();
    const actors = BloomApi.getAllActors();
    const startupActors = actors.filter(a => a.type === "startup");
    setStartups(startupActors);

    // Extract all unique tags
    const tags = new Set<string>();
    startupActors.forEach(s => s.tags.forEach(t => tags.add(t)));
    setAllTags(Array.from(tags).sort());
    
    // Load top gaps for default region/week
    try {
      const summary = await BloomApi.getBloomSummary("Turku archipelago", 28);
      const gaps = await BloomApi.analyzeGaps(summary);
      setTopGaps(gaps.slice(0, 3));
    } catch (error) {
      console.warn("Could not load gaps:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...startups];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by environments
    if (selectedEnvironments.length > 0) {
      filtered = filtered.filter(s => 
        s.startupDetails?.targetEnvironments.some(e => selectedEnvironments.includes(e))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(s => 
        s.tags.some(t => selectedTags.includes(t))
      );
    }

    setFilteredStartups(filtered);
  };

  const toggleEnvironment = (env: EnvironmentType) => {
    setSelectedEnvironments(prev => 
      prev.includes(env) 
        ? prev.filter(e => e !== env)
        : [...prev, env]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleViewProfile = (startup: Actor) => {
    setSelectedStartup(startup);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-light to-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="text-2xl font-heading font-bold text-primary hover:text-primary/80">
              BlueBloom
            </NavLink>
            <NavLink to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </NavLink>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-3">Startups & Companies</h1>
          <p className="text-lg text-muted-foreground">
            Sign up to be notified when there is algae to be picked up in your region, or explore blue-economy startups addressing cyanobacteria challenges.
          </p>
        </div>

        {/* Company Alerts Signup Section */}
        <div className="mb-12">
          <CompanyAlertsSection />
        </div>

        {/* Divider */}
        <div className="border-t my-12"></div>

        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold mb-3">Startup Solution Marketplace</h2>
          <p className="text-muted-foreground">
            Browse startups whose solutions address cyanobacteria and water quality challenges.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-6 bg-card p-6 rounded-lg border shadow-sm">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by startup name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Environment filters */}
          <div>
            <h3 className="text-sm font-medium mb-3">Target Environments</h3>
            <div className="flex flex-wrap gap-2">
              {allEnvironments.map(env => (
                <Badge
                  key={env}
                  variant={selectedEnvironments.includes(env) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => toggleEnvironment(env)}
                >
                  {env}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tag filters */}
          <div>
            <h3 className="text-sm font-medium mb-3">Solution Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active filters count */}
          {(searchTerm || selectedEnvironments.length > 0 || selectedTags.length > 0) && (
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {filteredStartups.length} of {startups.length} startups
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedEnvironments([]);
                  setSelectedTags([]);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Startup cards and sidebar grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Startup Cards */}
          <div className="lg:col-span-3">
            <div className="grid gap-6 md:grid-cols-2">
              {filteredStartups.map(startup => (
                <Card key={startup.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-accent" />
                      <Badge variant="secondary">Startup</Badge>
                    </div>
                    <span className="text-sm">🌍 {startup.country}</span>
                  </div>

                  <h3 className="text-xl font-heading font-semibold mb-2">{startup.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                    {startup.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {startup.tags.slice(0, 4).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {startup.startupDetails && startup.startupDetails.keyBenefits.length > 0 && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm font-medium mb-1">Key Benefits:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {startup.startupDetails.keyBenefits.slice(0, 2).map((benefit, idx) => (
                          <li key={idx}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handleViewProfile(startup)}
                    variant="default"
                    className="w-full mt-auto"
                  >
                    View solution profile
                  </Button>
                </Card>
              ))}
            </div>

            {filteredStartups.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No startups match your filters. Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Solution Gaps */}
          <div className="lg:col-span-1">
            {topGaps.length > 0 && (
              <Card className="sticky top-24">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">Current Gaps</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Under-served themes in Turku archipelago, Week 28
                  </p>
                  <div className="space-y-3">
                    {topGaps.map((gap, idx) => (
                      <GapCard key={idx} gap={gap} compact />
                    ))}
                  </div>
                  <Link to="/solution-gaps">
                    <Button variant="outline" className="w-full">
                      View All Gaps
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <StartupProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        startup={selectedStartup}
      />
    </div>
  );
}
