import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Building2, TrendingUp } from "lucide-react";
import { Recommendation } from "@/types/bloom";

interface ActorRecommendationsProps {
  recommendations: Recommendation[];
}

export function ActorRecommendations({ recommendations }: ActorRecommendationsProps) {
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
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
