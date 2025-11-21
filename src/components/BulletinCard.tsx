import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { BulletinResponse } from "@/types/bloom";
import { useState } from "react";

interface BulletinCardProps {
  bulletin: BulletinResponse;
}

export function BulletinCard({ bulletin }: BulletinCardProps) {
  const [expertOpen, setExpertOpen] = useState(false);

  // Convert markdown-style to JSX
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={idx} className="font-heading font-semibold text-lg mt-4 mb-2">{line.slice(2, -2)}</h4>;
      }
      if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={idx} className="text-sm italic text-muted-foreground mt-3">{line.slice(1, -1)}</p>;
      }
      if (line.startsWith('•') || line.startsWith('✓') || line.startsWith('🔴') || line.startsWith('🟡') || line.startsWith('🟢')) {
        return <p key={idx} className="ml-2 mb-1">{line}</p>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="mb-2">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-heading font-semibold mb-4">Citizen Bulletin</h3>
        <div className="prose prose-sm max-w-none">
          {renderMarkdown(bulletin.citizenBulletin)}
        </div>
      </Card>

      <Collapsible open={expertOpen} onOpenChange={setExpertOpen}>
        <Card className="p-6">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-between items-center p-0 h-auto hover:bg-transparent">
              <h3 className="text-xl font-heading font-semibold">Expert Technical Note</h3>
              <ChevronDown className={`h-5 w-5 transition-transform ${expertOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {renderMarkdown(bulletin.expertNote)}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
