import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface RegionWeekSelectorProps {
  regions: string[];
  weeks: number[];
  selectedRegion: string;
  selectedWeek: number;
  onRegionChange: (region: string) => void;
  onWeekChange: (week: number) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export function RegionWeekSelector({
  regions,
  weeks,
  selectedRegion,
  selectedWeek,
  onRegionChange,
  onWeekChange,
  onAnalyze,
  loading
}: RegionWeekSelectorProps) {
  const { t } = useLanguage();
  
  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("selector.region")}</label>
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("selector.region")} />
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            {regions.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("selector.week")}</label>
        <Select value={selectedWeek.toString()} onValueChange={(v) => onWeekChange(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder={t("selector.week")} />
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            {weeks.map(week => (
              <SelectItem key={week} value={week.toString()}>{t("selector.week")} {week}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={onAnalyze} 
        disabled={loading || !selectedRegion || !selectedWeek}
        className="w-full"
      >
        {loading ? t("selector.analyzing") : t("selector.analyze")}
      </Button>
    </Card>
  );
}
