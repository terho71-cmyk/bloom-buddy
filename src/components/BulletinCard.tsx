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
      // Process inline markdown (bold and italic)
      const processInlineMarkdown = (str: string) => {
        const parts: (string | JSX.Element)[] = [];
        let remaining = str;
        let key = 0;

        // Process bold text (**text**)
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(str)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            parts.push(remaining.slice(lastIndex, match.index));
          }
          // Add bold text
          parts.push(<strong key={`bold-${idx}-${key++}`}>{match[1]}</strong>);
          lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < str.length) {
          parts.push(str.slice(lastIndex));
        }

        return parts.length > 0 ? parts : str;
      };

      // Check if line is a header (starts and ends with **)
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={idx} className="font-heading font-semibold text-lg mt-4 mb-2">{line.slice(2, -2)}</h4>;
      }
      
      // Check if line is italic (starts and ends with single *)
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        return <p key={idx} className="text-sm italic text-muted-foreground mt-3">{line.slice(1, -1)}</p>;
      }
      
      // Bullet points and emojis
      if (line.startsWith('•') || line.startsWith('✓') || line.startsWith('🔴') || line.startsWith('🟡') || line.startsWith('🟢') || line.startsWith('✅') || line.startsWith('⚠️') || line.startsWith('🚨') || line.startsWith('⚡') || line.startsWith('🌊')) {
        return <p key={idx} className="ml-2 mb-1">{processInlineMarkdown(line)}</p>;
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      
      // Regular text with inline markdown
      return <p key={idx} className="mb-2">{processInlineMarkdown(line)}</p>;
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
