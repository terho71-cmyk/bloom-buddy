import { PitchSnippet } from "@/types/bloom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPitchAsText, formatPitchAsMarkdown } from "@/lib/pitch";

interface PitchSnippetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pitch: PitchSnippet | null;
  actorName: string;
  region: string;
  week: number;
}

export function PitchSnippetDialog({
  open,
  onOpenChange,
  pitch,
  actorName,
  region,
  week
}: PitchSnippetDialogProps) {
  const { toast } = useToast();

  if (!pitch) return null;

  const copyAsText = () => {
    const text = formatPitchAsText(pitch);
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Pitch snippet copied as plain text"
    });
  };

  const copyAsMarkdown = () => {
    const markdown = formatPitchAsMarkdown(pitch);
    navigator.clipboard.writeText(markdown);
    toast({
      title: "Copied to clipboard",
      description: "Pitch snippet copied as markdown"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">
            Pitch Snippet for {actorName}
          </DialogTitle>
          <DialogDescription>
            {region}, Week {week}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Problem Slide */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-destructive/10 p-2 rounded-md">
                <FileText className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-destructive mb-1">
                  Problem Slide
                </h3>
                <p className="text-xl font-semibold">{pitch.problemSlide.title}</p>
              </div>
            </div>
            <ul className="space-y-3 pl-11">
              {pitch.problemSlide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-destructive font-bold mt-0.5">•</span>
                  <span className="text-foreground">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution Slide */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-primary mb-1">
                  Solution Slide
                </h3>
                <p className="text-xl font-semibold">{pitch.solutionSlide.title}</p>
              </div>
            </div>
            <ul className="space-y-3 pl-11">
              {pitch.solutionSlide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span className="text-foreground">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Copy buttons */}
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm text-muted-foreground">
              Copy this pitch snippet to use in your presentations, emails, or proposals.
            </p>
            <div className="flex gap-3">
              <Button onClick={copyAsText} variant="default" className="flex-1 gap-2">
                <Copy className="h-4 w-4" />
                Copy as plain text
              </Button>
              <Button onClick={copyAsMarkdown} variant="outline" className="flex-1 gap-2">
                <Copy className="h-4 w-4" />
                Copy as markdown
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
