import { Actor, ProblemFitScore } from "@/types/bloom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Building2, Target, TrendingUp, CheckCircle2, Lightbulb, Presentation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { BloomApi } from "@/services/bloomApi";
import { PitchSnippet } from "@/types/bloom";
import { PitchSnippetDialog } from "./PitchSnippetDialog";
import { RegionWeekPickerDialog } from "./RegionWeekPickerDialog";

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
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [pitchSnippet, setPitchSnippet] = useState<PitchSnippet | null>(null);
  const [pitchDialogOpen, setPitchDialogOpen] = useState(false);
  const [pickerDialogOpen, setPickerDialogOpen] = useState(false);
  const [fitScore, setFitScore] = useState<ProblemFitScore | null>(null);
  const [loadingFit, setLoadingFit] = useState(false);
  const [fitPickerDialogOpen, setFitPickerDialogOpen] = useState(false);

  if (!startup) return null;

  const details = startup.startupDetails;

  // Auto-compute fit if region and week are provided
  useEffect(() => {
    if (region && week && open && startup) {
      computeFitForContext(region, week);
    } else {
      setFitScore(null);
    }
  }, [region, week, open, startup?.id]);

  const computeFitForContext = async (selectedRegion: string, selectedWeek: number) => {
    setLoadingFit(true);
    try {
      const summary = await BloomApi.getBloomSummary(selectedRegion, selectedWeek);
      const fit = BloomApi.computeFitScore(summary, startup);
      setFitScore(fit);
    } catch (error) {
      toast({
        title: "Failed to compute fit score",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoadingFit(false);
    }
  };

  const handleGeneratePitch = async () => {
    // If we have region and week context, generate directly
    if (region && week) {
      await generatePitchForContext(region, week);
    } else {
      // Open picker dialog to select region/week
      setPickerDialogOpen(true);
    }
  };

  const generatePitchForContext = async (selectedRegion: string, selectedWeek: number) => {
    setGeneratingPitch(true);
    try {
      const summary = await BloomApi.getBloomSummary(selectedRegion, selectedWeek);
      const pitch = await BloomApi.generatePitch(summary, startup);
      setPitchSnippet(pitch);
      setPitchDialogOpen(true);
    } catch (error) {
      toast({
        title: "Failed to generate pitch",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setGeneratingPitch(false);
    }
  };

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

          {/* Problem Fit Score - shown when region and week are available */}
          {region && week && fitScore && (
            <section className="border-2 rounded-lg p-4"
              style={{
                borderColor: fitScore.label === "High" ? "rgb(34, 197, 94)" : 
                            fitScore.label === "Medium" ? "rgb(245, 158, 11)" : 
                            "rgb(156, 163, 175)"
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-6 w-6" style={{
                  color: fitScore.label === "High" ? "rgb(34, 197, 94)" : 
                        fitScore.label === "Medium" ? "rgb(245, 158, 11)" : 
                        "rgb(156, 163, 175)"
                }} />
                <div className="flex-1">
                  <h3 className="text-lg font-heading font-semibold">Problem Fit Right Now</h3>
                  <p className="text-sm text-muted-foreground">{region}, Week {week}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline"
                    className="text-lg px-3 py-1"
                    style={{
                      borderColor: fitScore.label === "High" ? "rgb(34, 197, 94)" : 
                                  fitScore.label === "Medium" ? "rgb(245, 158, 11)" : 
                                  "rgb(156, 163, 175)",
                      color: fitScore.label === "High" ? "rgb(34, 197, 94)" : 
                            fitScore.label === "Medium" ? "rgb(245, 158, 11)" : 
                            "rgb(156, 163, 175)"
                    }}
                  >
                    {fitScore.score}/100
                  </Badge>
                  <p className="text-xs font-semibold mt-1"
                    style={{
                      color: fitScore.label === "High" ? "rgb(34, 197, 94)" : 
                            fitScore.label === "Medium" ? "rgb(245, 158, 11)" : 
                            "rgb(156, 163, 175)"
                    }}
                  >
                    {fitScore.label} Fit
                  </p>
                </div>
              </div>

              <div className="space-y-3 pl-9">
                <p className="text-sm">{fitScore.explanation}</p>
                
                {fitScore.drivers.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Key Drivers:</p>
                    <ul className="space-y-1">
                      {fitScore.drivers.map((driver, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Prompt to select region/week if not available */}
          {!region && !week && (
            <section className="border-2 border-dashed rounded-lg p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-heading font-semibold mb-2">Check Problem Fit</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a region and week to see how well this startup's solution matches the current bloom situation.
              </p>
              <Button 
                onClick={() => setFitPickerDialogOpen(true)}
                variant="outline"
                disabled={loadingFit}
              >
                {loadingFit ? "Calculating..." : "Select Region & Week"}
              </Button>
            </section>
          )}

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
              <div className="pt-4 border-t space-y-3">
                <p className="text-xs text-muted-foreground">
                  This is a solution profile for {startup.name}. Contact them directly to discuss pilot opportunities and partnerships.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGeneratePitch} 
                    variant="default"
                    className="flex-1 gap-2"
                    disabled={generatingPitch}
                  >
                    <Presentation className="h-4 w-4" />
                    {generatingPitch ? "Generating..." : "Generate pitch"}
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    Copy profile
                  </Button>
                </div>
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

      <PitchSnippetDialog
        open={pitchDialogOpen}
        onOpenChange={setPitchDialogOpen}
        pitch={pitchSnippet}
        actorName={startup.name}
        region={region || ""}
        week={week || 0}
      />

      <RegionWeekPickerDialog
        open={pickerDialogOpen}
        onOpenChange={setPickerDialogOpen}
        onSelect={generatePitchForContext}
      />

      <RegionWeekPickerDialog
        open={fitPickerDialogOpen}
        onOpenChange={setFitPickerDialogOpen}
        onSelect={computeFitForContext}
      />
    </Dialog>
  );
}
