import { Actor } from "@/types/bloom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Building2, Target, TrendingUp, CheckCircle2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StartupProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startup: Actor | null;
  region?: string;
  week?: number;
}

const getTRLLabel = (level?: number): string => {
  if (!level) return "Not specified";
  const labels: Record<number, string> = {
    1: "Basic principles observed",
    2: "Technology concept formulated",
    3: "Experimental proof of concept",
    4: "Technology validated in lab",
    5: "Technology validated in relevant environment",
    6: "Technology demonstrated in relevant environment",
    7: "System prototype in operational environment",
    8: "System complete and qualified",
    9: "Actual system proven in operational environment"
  };
  return `TRL ${level} – ${labels[level] || "Unknown"}`;
};

export function StartupProfileDialog({ 
  open, 
  onOpenChange, 
  startup,
  region,
  week
}: StartupProfileDialogProps) {
  const { toast } = useToast();

  if (!startup) return null;

  const details = startup.startupDetails;

  const copyToClipboard = () => {
    if (!details) return;

    const text = `
${startup.name} - Solution Profile
${region && week ? `Context: ${region}, Week ${week}` : ''}

SOLUTION FOCUS
${startup.description}

Typical Customer: ${details.typicalCustomer}
Target Environments: ${details.targetEnvironments.join(", ")}

MATURITY & SCALE
${getTRLLabel(details.trlLevel)}
Deployment Scale: ${details.deploymentScale}
Price Range: ${details.priceRange}

KEY BENEFITS
${details.keyBenefits.map(b => `• ${b}`).join('\n')}

EXAMPLE USE CASE
${details.exampleUseCase}

Website: ${startup.url}
    `.trim();

    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Profile details copied successfully"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-heading mb-2">
                {startup.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 flex-wrap">
                <span>🌍 {startup.country}</span>
                <span>•</span>
                <a 
                  href={startup.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 inline-flex items-center gap-1"
                >
                  Visit website <ExternalLink className="h-3 w-3" />
                </a>
              </DialogDescription>
            </div>
            <Building2 className="h-8 w-8 text-accent" />
          </div>

          {region && week && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-md">
              <p className="text-sm">
                <strong>Viewing solution profile in context of {region}, week {week}</strong>
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {startup.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {details ? (
            <>
              {/* Solution Focus */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-heading font-semibold">Solution Focus</h3>
                </div>
                <div className="space-y-3 pl-7">
                  <p className="text-muted-foreground">{startup.description}</p>
                  
                  <div className="grid gap-2">
                    <div>
                      <span className="text-sm font-medium">Typical Customer:</span>
                      <p className="text-sm text-muted-foreground">{details.typicalCustomer}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Target Environments:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {details.targetEnvironments.map((env, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {env}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Maturity & Scale */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-heading font-semibold">Maturity & Scale</h3>
                </div>
                <div className="space-y-2 pl-7">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-medium">Technology Readiness</p>
                    <p className="text-sm text-muted-foreground">{getTRLLabel(details.trlLevel)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="text-xs font-medium text-muted-foreground">Deployment Scale</p>
                      <p className="text-sm">{details.deploymentScale}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="text-xs font-medium text-muted-foreground">Price Range</p>
                      <p className="text-sm">{details.priceRange}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Key Benefits */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-heading font-semibold">Key Benefits</h3>
                </div>
                <ul className="space-y-2 pl-7">
                  {details.keyBenefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Example Use Case */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-heading font-semibold">Example Use Case</h3>
                </div>
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-md pl-7">
                  <p className="text-sm text-muted-foreground italic">
                    {details.exampleUseCase}
                  </p>
                </div>
              </section>

              {/* Footer note */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-4">
                  This is a solution profile for {startup.name}. Contact them directly to discuss pilot opportunities and partnerships.
                </p>
                <Button onClick={copyToClipboard} variant="outline" className="w-full">
                  Copy profile to clipboard
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Detailed profile information is not available for this startup.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
