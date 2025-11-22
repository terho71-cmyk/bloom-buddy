import { useEffect, useState } from "react";
import { StartupCaseStudy } from "@/types/bloom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";
import { BloomApi } from "@/services/bloomApi";

interface CaseStudyListProps {
  startupId: string;
  onSelect: (caseStudy: StartupCaseStudy) => void;
}

export function CaseStudyList({ startupId, onSelect }: CaseStudyListProps) {
  const [caseStudies, setCaseStudies] = useState<StartupCaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCaseStudies = async () => {
      setLoading(true);
      try {
        const studies = await BloomApi.getStartupCaseStudies(startupId);
        setCaseStudies(studies);
      } catch (error) {
        console.error("Failed to load case studies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCaseStudies();
  }, [startupId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading stories...</p>
        </CardContent>
      </Card>
    );
  }

  if (caseStudies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Previous Stories
          </CardTitle>
          <CardDescription>
            No case studies created yet. Use the form above to create your first story.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Previous Stories ({caseStudies.length})
        </CardTitle>
        <CardDescription>
          Click on a story to view the full case study
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {caseStudies.map((caseStudy) => (
          <div
            key={caseStudy.id}
            onClick={() => onSelect(caseStudy)}
            className="p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 hover:border-primary space-y-2"
          >
            <h4 className="font-semibold">{caseStudy.title}</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {caseStudy.customerName}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {caseStudy.region}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {caseStudy.timePeriod}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {caseStudy.heroSummary}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
              <Calendar className="h-3 w-3" />
              {new Date(caseStudy.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
