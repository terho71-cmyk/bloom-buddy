import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "fi")}>
        <SelectTrigger className="w-[130px] bg-background border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background border-border z-50">
          <SelectItem value="en">{t("language.english")}</SelectItem>
          <SelectItem value="fi">{t("language.finnish")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
