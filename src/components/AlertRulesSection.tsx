import { Actor, StartupAlertRule } from "@/types/bloom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Target, TrendingUp, Users } from "lucide-react";
import { BloomApi } from "@/services/bloomApi";
import { useState, useEffect } from "react";

interface AlertRulesSectionProps {
  startup: Actor;
}

export function AlertRulesSection({ startup }: AlertRulesSectionProps) {
  const [rules, setRules] = useState<StartupAlertRule[]>([]);

  useEffect(() => {
    const loadedRules = BloomApi.getStartupAlerts(startup.id);
    setRules(loadedRules);
  }, [startup.id]);

  const getUseCaseIcon = (useCase: StartupAlertRule["useCase"]) => {
    switch (useCase) {
      case "pilot":
        return <Target className="h-4 w-4" />;
      case "sales":
        return <TrendingUp className="h-4 w-4" />;
      case "investor":
        return <Users className="h-4 w-4" />;
    }
  };

  const getUseCaseLabel = (useCase: StartupAlertRule["useCase"]) => {
    switch (useCase) {
      case "pilot":
        return "Pilot";
      case "sales":
        return "Sales";
      case "investor":
        return "Investor";
    }
  };

  if (rules.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-heading font-semibold">Alert Rules</h3>
        </div>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No alert rules configured for this startup yet.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-heading font-semibold">Alert Rules</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Configured conditions that define "perfect weeks" for this startup's outreach activities.
      </p>

      <div className="space-y-3">
        {rules.map((rule) => (
          <Card
            key={rule.id}
            className={`p-4 ${
              rule.isActive
                ? "border-primary/30 bg-primary/5"
                : "border-muted bg-muted/20 opacity-60"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{rule.name}</h4>
                    <Badge
                      variant={rule.isActive ? "default" : "outline"}
                      className="text-xs"
                    >
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {getUseCaseIcon(rule.useCase)}
                  <span className="text-xs">{getUseCaseLabel(rule.useCase)}</span>
                </div>
              </div>

              {/* Conditions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-xs font-medium text-muted-foreground">Conditions:</span>
                {rule.conditions.minOverallRisk && (
                  <Badge variant="outline" className="text-xs">
                    Min risk: {rule.conditions.minOverallRisk}
                  </Badge>
                )}
                {rule.conditions.maxOverallRisk && (
                  <Badge variant="outline" className="text-xs">
                    Max risk: {rule.conditions.maxOverallRisk}
                  </Badge>
                )}
                {rule.conditions.minHighSeverityHotspots !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    ≥{rule.conditions.minHighSeverityHotspots} high-severity hotspots
                  </Badge>
                )}
                {rule.conditions.requireIncreasingTrend && (
                  <Badge variant="outline" className="text-xs">
                    Increasing trend required
                  </Badge>
                )}
                {rule.conditions.requireTouristAreasHint && (
                  <Badge variant="outline" className="text-xs">
                    Tourist areas
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
