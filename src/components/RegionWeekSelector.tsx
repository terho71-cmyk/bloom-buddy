import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Region</label>
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            {regions.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Week</label>
        <Select value={selectedWeek.toString()} onValueChange={(v) => onWeekChange(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            {weeks.map(week => (
              <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={onAnalyze} 
        disabled={loading || !selectedRegion || !selectedWeek}
        className="w-full"
      >
        {loading ? "Analyzing..." : "Generate Analysis"}
      </Button>
    </Card>
  );
}
