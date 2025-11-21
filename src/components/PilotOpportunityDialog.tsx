import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PilotOpportunity } from "@/types/bloom";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PilotOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: PilotOpportunity | null;
  actorName: string;
  region: string;
  week: number;
}

export function PilotOpportunityDialog({ 
  open, 
  onOpenChange, 
  opportunity, 
  actorName,
  region,
  week 
}: PilotOpportunityDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!opportunity) return null;

  const copyToClipboard = () => {
    const text = `
${opportunity.pilotTitle}

OBJECTIVE
${opportunity.objective}

WHY NOW IN ${region.toUpperCase()} (WEEK ${week})
${opportunity.whyNow}

KEY STEPS
${opportunity.keySteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

SUCCESS METRICS
${opportunity.successMetrics.map((metric, i) => `• ${metric}`).join('\n')}

---
This is a draft pilot sketch generated from the current cyanobacteria situation and ${actorName}'s profile.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Pilot opportunity text has been copied."
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">{opportunity.pilotTitle}</DialogTitle>
          <DialogDescription>
            Pilot opportunity for {actorName} • {region} • Week {week}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-lg font-heading font-semibold mb-2 text-foreground">Objective</h3>
            <p className="text-muted-foreground">{opportunity.objective}</p>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-2 text-foreground">
              Why now in {region} (week {week})
            </h3>
            <p className="text-muted-foreground">{opportunity.whyNow}</p>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-2 text-foreground">Key steps</h3>
            <ul className="list-disc list-inside space-y-1">
              {opportunity.keySteps.map((step, idx) => (
                <li key={idx} className="text-muted-foreground">{step}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-2 text-foreground">Success metrics</h3>
            <ul className="list-disc list-inside space-y-1">
              {opportunity.successMetrics.map((metric, idx) => (
                <li key={idx} className="text-muted-foreground">{metric}</li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground italic">
              This is a draft pilot sketch generated from the current cyanobacteria situation and {actorName}'s profile.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={copyToClipboard}
            className="gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to clipboard
              </>
            )}
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
