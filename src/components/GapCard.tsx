import { SolutionGap } from "@/types/bloom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Users } from "lucide-react";

interface GapCardProps {
  gap: SolutionGap;
  compact?: boolean;
}

export function GapCard({ gap, compact = false }: GapCardProps) {
  const getGapColor = (score: number) => {
    if (score > 70) return "text-red-500";
    if (score > 40) return "text-orange-500";
    return "text-yellow-500";
  };

  const getGapBadgeVariant = (score: number) => {
    if (score > 70) return "destructive";
    if (score > 40) return "default";
    return "secondary";
  };

  if (compact) {
    return (
      <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{gap.theme.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {gap.theme.description}
            </p>
          </div>
          <Badge variant={getGapBadgeVariant(gap.gapScore)} className="ml-2">
            Gap: {gap.gapScore}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            <span>Need: {gap.severityScore}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-blue-500" />
            <span>Coverage: {gap.coverageScore}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-5 w-5 ${getGapColor(gap.gapScore)}`} />
              <CardTitle className="text-lg">{gap.theme.title}</CardTitle>
            </div>
            <CardDescription>{gap.theme.description}</CardDescription>
          </div>
          <Badge
            variant={getGapBadgeVariant(gap.gapScore)}
            className="text-lg px-3 py-1"
          >
            {gap.gapScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-sm text-muted-foreground">{gap.summary}</p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Need</span>
              <span className="font-semibold">{gap.severityScore}%</span>
            </div>
            <Progress value={gap.severityScore} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Coverage</span>
              <span className="font-semibold">{gap.coverageScore}%</span>
            </div>
            <Progress value={gap.coverageScore} className="h-2" />
          </div>
        </div>

        {/* Drivers */}
        {gap.drivers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Key Drivers:</p>
            <ul className="space-y-1">
              {gap.drivers.map((driver, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Related capabilities:</p>
          <div className="flex flex-wrap gap-1">
            {gap.theme.coverageTags.slice(0, 6).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
