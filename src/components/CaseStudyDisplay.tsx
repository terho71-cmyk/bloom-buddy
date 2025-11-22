import { StartupCaseStudy } from "@/types/bloom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { caseStudyToText, caseStudyToMarkdown } from "@/lib/caseStudies";
import { BloomApi } from "@/services/bloomApi";
import { useState } from "react";

interface CaseStudyDisplayProps {
  caseStudy: StartupCaseStudy;
  onSaved?: () => void;
}

export function CaseStudyDisplay({ caseStudy, onSaved }: CaseStudyDisplayProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleCopyText = () => {
    const text = caseStudyToText(caseStudy);
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Case study copied as plain text"
    });
  };

  const handleCopyMarkdown = () => {
    const markdown = caseStudyToMarkdown(caseStudy);
    navigator.clipboard.writeText(markdown);
    toast({
      title: "Copied to clipboard",
      description: "Case study copied as markdown"
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await BloomApi.saveCaseStudy(caseStudy);
      toast({
        title: "Story saved",
        description: "Your case study has been saved successfully"
      });
      if (onSaved) onSaved();
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold">{caseStudy.title}</h2>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{caseStudy.customerName}</Badge>
            <Badge variant="secondary">{caseStudy.region}</Badge>
            <Badge variant="secondary">{caseStudy.timePeriod}</Badge>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {caseStudy.heroSummary}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Story"}
          </Button>
          <Button onClick={handleCopyText} variant="outline" className="gap-2">
            <Copy className="h-4 w-4" />
            Copy as Text
          </Button>
          <Button onClick={handleCopyMarkdown} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Copy as Markdown
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Problem Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-primary">
            {caseStudy.problem.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {caseStudy.problem.body}
          </p>
          {caseStudy.problem.bullets && caseStudy.problem.bullets.length > 0 && (
            <ul className="space-y-2 pl-5">
              {caseStudy.problem.bullets.map((bullet, idx) => (
                <li key={idx} className="text-muted-foreground list-disc">
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Solution Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-primary">
            {caseStudy.solution.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {caseStudy.solution.body}
          </p>
          {caseStudy.solution.bullets && caseStudy.solution.bullets.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Key Actions:</p>
              <ul className="space-y-2 pl-5">
                {caseStudy.solution.bullets.map((bullet, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground list-disc">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Results Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-primary">
            {caseStudy.results.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {caseStudy.results.body}
          </p>
          {caseStudy.results.bullets && caseStudy.results.bullets.length > 0 && (
            <div className="bg-accent/10 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Observed Results:</p>
              <ul className="space-y-2 pl-5">
                {caseStudy.results.bullets.map((bullet, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground list-disc">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {caseStudy.metrics && caseStudy.metrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {caseStudy.metrics.map((metric, idx) => (
                <div key={idx} className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Next Steps Section */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-primary">
            {caseStudy.nextSteps.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {caseStudy.nextSteps.body}
          </p>
          {caseStudy.nextSteps.bullets && caseStudy.nextSteps.bullets.length > 0 && (
            <ul className="space-y-2 pl-5">
              {caseStudy.nextSteps.bullets.map((bullet, idx) => (
                <li key={idx} className="text-muted-foreground list-disc">
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
