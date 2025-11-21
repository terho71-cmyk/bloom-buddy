import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BloomSummary, Severity } from "@/types/bloom";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, CheckCircle } from "lucide-react";

interface BloomSummaryCardProps {
  summary: BloomSummary;
}

const severityColors: Record<Severity, string> = {
  none: "bg-success text-success-foreground",
  low: "bg-accent text-accent-foreground",
  medium: "bg-warning text-warning-foreground",
  high: "bg-destructive text-destructive-foreground"
};

const trendIcons = {
  increasing: <TrendingUp className="h-4 w-4 text-destructive" />,
  decreasing: <TrendingDown className="h-4 w-4 text-success" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
  unknown: <Minus className="h-4 w-4 text-muted-foreground" />
};

export function BloomSummaryCard({ summary }: BloomSummaryCardProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-heading font-semibold mb-4">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold font-heading text-primary">{summary.totalObservations}</div>
            <div className="text-sm text-muted-foreground">Total Observations</div>
          </div>
          <div className="text-center">
            <Badge className={`text-lg px-4 py-1 ${severityColors[summary.overallRiskLevel]}`}>
              {summary.overallRiskLevel}
            </Badge>
            <div className="text-sm text-muted-foreground mt-2">Overall Risk</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold font-heading text-destructive">{summary.hotspots.length}</div>
            <div className="text-sm text-muted-foreground">Hotspots</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold font-heading text-success">{summary.safeAreas.length}</div>
            <div className="text-sm text-muted-foreground">Safe Areas</div>
          </div>
        </div>

        {/* Key Messages */}
        <div className="mt-6 space-y-2">
          {summary.keyMessages.map((msg, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Hotspots */}
      {summary.hotspots.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-heading font-semibold">Hotspot Areas</h3>
          </div>
          <div className="space-y-3">
            {summary.hotspots.map((hotspot, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={severityColors[hotspot.severity]}>
                    {hotspot.severity}
                  </Badge>
                  <div>
                    <div className="font-medium">{hotspot.areaName}</div>
                    <div className="text-sm text-muted-foreground">
                      {hotspot.observationCount} observation{hotspot.observationCount > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {trendIcons[hotspot.trend]}
                  <span className="text-sm text-muted-foreground capitalize">{hotspot.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Safe Areas */}
      {summary.safeAreas.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-success" />
            <h3 className="text-lg font-heading font-semibold">Safe Areas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.safeAreas.map((area, idx) => (
              <Badge key={idx} variant="outline" className="border-success text-success">
                {area}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
