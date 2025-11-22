import { CollaborationCluster, Actor } from "@/types/bloom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Building2, CheckCircle2, TrendingUp, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClusterDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cluster: CollaborationCluster | null;
  onViewStartup?: (startup: Actor) => void;
}

export function ClusterDetailDialog({
  open,
  onOpenChange,
  cluster,
  onViewStartup
}: ClusterDetailDialogProps) {
  if (!cluster) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {cluster.startups.length}-startup collaboration pack
            </Badge>
          </div>
          <DialogTitle className="text-2xl">{cluster.theme.title}</DialogTitle>
          <DialogDescription className="text-base italic">
            {cluster.suitabilityNote}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-sm text-muted-foreground">{cluster.summary}</p>
            </div>

            <Separator />

            {/* Startups in Pack */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Startups in this Pack
              </h3>
              <div className="grid gap-3">
                {cluster.startups.map(startup => (
                  <Card key={startup.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{startup.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {startup.country}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {startup.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {startup.tags.slice(0, 5).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {startup.startupDetails && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Typical customer:</span>{" "}
                              {startup.startupDetails.typicalCustomer}
                            </div>
                          )}
                        </div>
                        {onViewStartup && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewStartup(startup)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Joint Benefits */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                How This Pack Solves the Problem
              </h3>
              <ul className="space-y-2">
                {cluster.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Suggested Next Steps */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Suggested Next Steps
              </h3>
              <ul className="space-y-2">
                <li className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Organize introductory meeting with all {cluster.startups.length} startups
                  </span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Define pilot scope covering 2-3 hotspots as consortium</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Run 4-8 week pilot demonstrating integrated value proposition
                  </span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Document complementary capabilities in joint case study</span>
                </li>
                <li className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Present results to municipality as complete solution package
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
