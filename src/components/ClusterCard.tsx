import { CollaborationCluster } from "@/types/bloom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2, CheckCircle2 } from "lucide-react";

interface ClusterCardProps {
  cluster: CollaborationCluster;
  onViewDetails: (cluster: CollaborationCluster) => void;
}

export function ClusterCard({ cluster, onViewDetails }: ClusterCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {cluster.startups.length}-startup pack
          </Badge>
          <Badge variant="outline">{cluster.theme.id.replace(/_/g, " ")}</Badge>
        </div>
        <CardTitle className="text-xl">{cluster.theme.title}</CardTitle>
        <CardDescription className="text-sm italic">
          {cluster.suitabilityNote}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-sm text-muted-foreground">
          {cluster.summary}
        </p>
        
        {/* Included Startups */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Included Startups
          </h4>
          <div className="flex flex-wrap gap-2">
            {cluster.startups.map(startup => (
              <Badge key={startup.id} variant="outline" className="text-xs">
                {startup.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Joint Benefits */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Joint Benefits
          </h4>
          <ul className="space-y-1">
            {cluster.benefits.slice(0, 3).map((benefit, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* View Details Button */}
        <Button
          variant="default"
          className="w-full"
          onClick={() => onViewDetails(cluster)}
        >
          View pack in detail
        </Button>
      </CardContent>
    </Card>
  );
}
