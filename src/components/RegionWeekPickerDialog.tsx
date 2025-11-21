import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BloomApi } from "@/services/bloomApi";

interface RegionWeekPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (region: string, week: number) => void;
}

export function RegionWeekPickerDialog({
  open,
  onOpenChange,
  onSelect
}: RegionWeekPickerDialogProps) {
  const [regions, setRegions] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(0);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (selectedRegion) {
      const availableWeeks = BloomApi.getAvailableWeeks(selectedRegion);
      setWeeks(availableWeeks);
      if (availableWeeks.length > 0 && !availableWeeks.includes(selectedWeek)) {
        setSelectedWeek(availableWeeks[0]);
      }
    }
  }, [selectedRegion]);

  const loadData = async () => {
    await BloomApi.loadData();
    const availableRegions = BloomApi.getAvailableRegions();
    setRegions(availableRegions);
    
    if (availableRegions.length > 0) {
      setSelectedRegion(availableRegions[0]);
      const availableWeeks = BloomApi.getAvailableWeeks(availableRegions[0]);
      setWeeks(availableWeeks);
      if (availableWeeks.length > 0) {
        setSelectedWeek(availableWeeks[0]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedRegion && selectedWeek) {
      onSelect(selectedRegion, selectedWeek);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Region & Week</DialogTitle>
          <DialogDescription>
            Choose a region and week to generate a pitch snippet for the bloom situation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger id="region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="week">Week</Label>
            <Select 
              value={selectedWeek.toString()} 
              onValueChange={(val) => setSelectedWeek(parseInt(val))}
            >
              <SelectTrigger id="week">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {weeks.map(week => (
                  <SelectItem key={week} value={week.toString()}>
                    Week {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedRegion || !selectedWeek}>
            Generate Pitch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
