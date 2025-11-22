import { useState } from "react";
import { Actor, CaseStudyInput, StartupCaseStudy, BloomSummary } from "@/types/bloom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BloomApi } from "@/services/bloomApi";

interface CaseStudyBuilderProps {
  startup: Actor;
  region?: string;
  week?: number;
  onGenerated: (caseStudy: StartupCaseStudy) => void;
}

export function CaseStudyBuilder({ startup, region, week, onGenerated }: CaseStudyBuilderProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  
  const [customerName, setCustomerName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(region || "");
  const [timePeriod, setTimePeriod] = useState("");
  const [summaryOfPilot, setSummaryOfPilot] = useState("");
  const [keyActions, setKeyActions] = useState<string[]>([""]);
  const [observedResults, setObservedResults] = useState<string[]>([""]);
  const [metrics, setMetrics] = useState<{ label: string; value: string }[]>([]);

  const regions = ["Turku archipelago", "Helsinki archipelago", "Vaasa archipelago"];

  const addKeyAction = () => {
    setKeyActions([...keyActions, ""]);
  };

  const updateKeyAction = (index: number, value: string) => {
    const updated = [...keyActions];
    updated[index] = value;
    setKeyActions(updated);
  };

  const removeKeyAction = (index: number) => {
    setKeyActions(keyActions.filter((_, i) => i !== index));
  };

  const addObservedResult = () => {
    setObservedResults([...observedResults, ""]);
  };

  const updateObservedResult = (index: number, value: string) => {
    const updated = [...observedResults];
    updated[index] = value;
    setObservedResults(updated);
  };

  const removeObservedResult = (index: number) => {
    setObservedResults(observedResults.filter((_, i) => i !== index));
  };

  const addMetric = () => {
    setMetrics([...metrics, { label: "", value: "" }]);
  };

  const updateMetric = (index: number, field: "label" | "value", value: string) => {
    const updated = [...metrics];
    updated[index][field] = value;
    setMetrics(updated);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    // Validate inputs
    if (!customerName.trim()) {
      toast({
        title: "Customer name required",
        description: "Please enter the customer name",
        variant: "destructive"
      });
      return;
    }

    if (!selectedRegion) {
      toast({
        title: "Region required",
        description: "Please select a region",
        variant: "destructive"
      });
      return;
    }

    if (!timePeriod.trim()) {
      toast({
        title: "Time period required",
        description: "Please enter the time period (e.g., Summer 2025)",
        variant: "destructive"
      });
      return;
    }

    if (!summaryOfPilot.trim()) {
      toast({
        title: "Pilot summary required",
        description: "Please describe what you did",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);

    try {
      const input: CaseStudyInput = {
        startupId: startup.id,
        region: selectedRegion,
        timePeriod: timePeriod.trim(),
        customerName: customerName.trim(),
        summaryOfPilot: summaryOfPilot.trim(),
        keyActions: keyActions.filter(a => a.trim()).map(a => a.trim()),
        observedResults: observedResults.filter(r => r.trim()).map(r => r.trim()),
        metrics: metrics.filter(m => m.label.trim() && m.value.trim())
      };

      // Try to get bloom summary for context if region and week are available
      let summary: BloomSummary | undefined;
      if (week) {
        try {
          summary = await BloomApi.getBloomSummary(selectedRegion, week);
        } catch (error) {
          console.warn("Could not fetch bloom summary for context");
        }
      }

      const caseStudy = await BloomApi.generateCaseStudy(input, startup, summary);
      
      toast({
        title: "Case study generated",
        description: "Your story is ready to review and save"
      });

      onGenerated(caseStudy);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Create a New Story</CardTitle>
        </div>
        <CardDescription>
          Turn your pilot or deployment into a shareable case study
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Context Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Context</h3>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="e.g., City of Turku, Helsinki Marina Association"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timePeriod">Time Period</Label>
              <Input
                id="timePeriod"
                placeholder="e.g., Summer 2025, Weeks 28-32"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Pilot Description */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">What You Did</h3>
          
          <div className="space-y-2">
            <Label htmlFor="summary">Pilot Summary</Label>
            <Textarea
              id="summary"
              placeholder="Briefly describe what you deployed and tested..."
              value={summaryOfPilot}
              onChange={(e) => setSummaryOfPilot(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Key Actions</Label>
              <Button size="sm" variant="outline" onClick={addKeyAction}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {keyActions.map((action, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Deployed sensors, set up dashboard, trained staff..."
                    value={action}
                    onChange={(e) => updateKeyAction(index, e.target.value)}
                  />
                  {keyActions.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeKeyAction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Observed Results</Label>
              <Button size="sm" variant="outline" onClick={addObservedResult}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {observedResults.map((result, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Reduced beach closures, improved public awareness..."
                    value={result}
                    onChange={(e) => updateObservedResult(index, e.target.value)}
                  />
                  {observedResults.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeObservedResult(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Metrics (Optional)</Label>
              <Button size="sm" variant="outline" onClick={addMetric}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {metrics.map((metric, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Metric label"
                    value={metric.label}
                    onChange={(e) => updateMetric(index, "label", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={metric.value}
                    onChange={(e) => updateMetric(index, "value", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeMetric(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full"
        >
          {generating ? "Generating story..." : "Generate Case Study"}
        </Button>
      </CardContent>
    </Card>
  );
}
