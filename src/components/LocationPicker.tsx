import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Waves, Mountain, Trees, Anchor, Ship, Fish } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Map region names to appropriate icons
const getRegionIcon = (regionName: string): LucideIcon => {
  const lowerName = regionName.toLowerCase();
  
  if (lowerName.includes('baltic') || lowerName.includes('sea')) return Waves;
  if (lowerName.includes('gulf') || lowerName.includes('bay')) return Anchor;
  if (lowerName.includes('archipelago') || lowerName.includes('island')) return Ship;
  if (lowerName.includes('coast') || lowerName.includes('shore')) return Fish;
  if (lowerName.includes('lake')) return Waves;
  if (lowerName.includes('mountain') || lowerName.includes('highland')) return Mountain;
  if (lowerName.includes('forest')) return Trees;
  
  // Default icon
  return MapPin;
};

interface LocationPickerProps {
  regions: string[];
  weeks: number[];
  selectedRegion: string;
  selectedWeek: number;
  onRegionChange: (region: string) => void;
  onWeekChange: (week: number) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export function LocationPicker({
  regions,
  weeks,
  selectedRegion,
  selectedWeek,
  onRegionChange,
  onWeekChange,
  onAnalyze,
  loading
}: LocationPickerProps) {
  return (
    <div className="space-y-6">
      {/* Region Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5 text-primary" />
          <h2>Select Region</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {regions.map(region => {
            const RegionIcon = getRegionIcon(region);
            return (
              <Card
                key={region}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md hover:scale-105",
                  selectedRegion === region
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "hover:bg-accent"
                )}
                onClick={() => onRegionChange(region)}
              >
                <div className="flex flex-col items-center gap-2">
                  <RegionIcon className="h-8 w-8" />
                  <div className="text-center font-medium text-sm">{region}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Week Selection */}
      {selectedRegion && weeks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-primary" />
            <h2>Select Week</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {weeks.map(week => (
              <Card
                key={week}
                className={cn(
                  "p-3 cursor-pointer transition-all hover:shadow-md hover:scale-105",
                  selectedWeek === week
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "hover:bg-accent"
                )}
                onClick={() => onWeekChange(week)}
              >
                <div className="text-center text-sm font-medium">W{week}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {selectedRegion && selectedWeek > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onAnalyze}
            disabled={loading}
            size="lg"
            className="min-w-[200px]"
          >
            {loading ? "Analyzing..." : "Generate Analysis"}
          </Button>
        </div>
      )}
    </div>
  );
}
