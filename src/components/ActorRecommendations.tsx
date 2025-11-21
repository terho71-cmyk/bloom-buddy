import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Building2, TrendingUp, Lightbulb, FileText } from "lucide-react";
import { Recommendation, BloomSummary, PilotOpportunity } from "@/types/bloom";
import { BloomApi } from "@/services/bloomApi";
import { PilotOpportunityDialog } from "./PilotOpportunityDialog";
import { StartupProfileDialog } from "./StartupProfileDialog";
import { useToast } from "@/hooks/use-toast";

interface ActorRecommendationsProps {
  recommendations: Recommendation[];
  summary: BloomSummary;
}

export function ActorRecommendations({ recommendations, summary }: ActorRecommendationsProps) {
  const [generatingPilot, setGeneratingPilot] = useState<string | null>(null);
  const [pilotOpportunity, setPilotOpportunity] = useState<PilotOpportunity | null>(null);
  const [selectedActor, setSelectedActor] = useState<{ name: string; id: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileActor, setProfileActor] = useState<any>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGeneratePilot = async (actorId: string, actorName: string) => {
    setGeneratingPilot(actorId);
    
    try {
      const actor = recommendations
        .flatMap(r => r.actors)
        .find(a => a.id === actorId);
      
      if (!actor) {
        throw new Error("Actor not found");
      }

      const opportunity = await BloomApi.generatePilot(summary, actor);
      setPilotOpportunity(opportunity);
      setSelectedActor({ name: actorName, id: actorId });
      setDialogOpen(true);
    } catch (error) {
      toast({
        title: "Failed to generate pilot",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setGeneratingPilot(null);
    }
  };

  return (
    <div className="space-y-8">
      {recommendations.map((rec, idx) => (
        <div key={idx}>
          <div className="mb-4">
            <h3 className="text-xl font-heading font-semibold mb-2">{rec.theme}</h3>
            <p className="text-muted-foreground">{rec.explanation}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rec.actors.map(actor => (
              <Card key={actor.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {actor.type === 'startup' ? (
                      <TrendingUp className="h-5 w-5 text-accent" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                    <Badge variant={actor.type === 'startup' ? 'default' : 'secondary'}>
                      {actor.type}
                    </Badge>
                  </div>
                  <a 
                    href={actor.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <h4 className="font-heading font-semibold mb-2">{actor.name}</h4>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{actor.description}</p>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>🌍 {actor.country}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {actor.tags.slice(0, 3).map((tag, tagIdx) => (
                    <Badge key={tagIdx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {actor.type === 'startup' && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleGeneratePilot(actor.id, actor.name)}
                      disabled={generatingPilot === actor.id}
                      variant="secondary"
                      size="sm"
                      className="flex-1 gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      {generatingPilot === actor.id ? 'Generating...' : 'Generate pilot'}
                    </Button>
                    <Button
                      onClick={() => {
                        setProfileActor(actor);
                        setProfileDialogOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View profile
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      <PilotOpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunity={pilotOpportunity}
        actorName={selectedActor?.name || ''}
        region={summary.region}
        week={summary.week}
      />

      <StartupProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        startup={profileActor}
        region={summary.region}
        week={summary.week}
      />
    </div>
  );
}
