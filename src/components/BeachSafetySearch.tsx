import { useState, useEffect, useMemo, useCallback } from "react";
import { BloomApi } from "@/services/bloomApi";
import { BloomObservation } from "@/types/bloom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Clock, Info, CheckCircle, AlertTriangle, XCircle, HelpCircle, RefreshCw } from "lucide-react";
import { BeachMap } from "./BeachMap";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BeachLocation {
  areaName: string;
  region: string;
  lat: number;
  lon: number;
}

interface SafetyResult {
  location: string;
  region: string;
  status: "safe" | "caution" | "unsafe" | "unknown";
  severity: string;
  lastUpdated: string;
  description: string;
  lat: number;
  lon: number;
}

export function BeachSafetySearch() {
  const [beaches, setBeaches] = useState<BeachLocation[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadBeaches();
  }, []);

  // Auto-refresh every 60 minutes
  useEffect(() => {
    if (!autoRefresh || !result) return;

    const interval = setInterval(() => {
      if (result) {
        searchBeach(result.location, result.region);
        setLastUpdated(new Date());
      }
    }, 60 * 60 * 1000); // 60 minutes

    return () => clearInterval(interval);
  }, [result, autoRefresh]);

  const loadBeaches = async () => {
    try {
      // Load all Finnish beaches from the comprehensive list
      const response = await fetch('/data/finnish_beaches.json');
      const allBeaches = await response.json();
      
      setBeaches(allBeaches.map((beach: any) => ({
        areaName: beach.name,
        region: beach.region,
        lat: beach.lat,
        lon: beach.lon
      })));
    } catch (err) {
      console.error("Failed to load beaches:", err);
    }
  };

  const searchBeach = useCallback(async (beachName: string, region?: string) => {
    if (!beachName) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      await BloomApi.loadData();
      const observations = await BloomApi.getAllObservations();
      
      // Find the beach in the complete list
      const beach = beaches.find(b => 
        b.areaName.toLowerCase() === beachName.toLowerCase() &&
        (!region || b.region.toLowerCase() === region.toLowerCase())
      );

      if (!beach) {
        setError(`Beach "${beachName}" not found in our database.`);
        setLoading(false);
        return;
      }

      // Find matching observations
      const matches = observations.filter(obs => 
        obs.areaName.toLowerCase() === beachName.toLowerCase() &&
        obs.region.toLowerCase() === beach.region.toLowerCase()
      );

      // Map severity to safety status
      const getSafetyStatus = (severity: string): "safe" | "caution" | "unsafe" => {
        if (severity === "none" || severity === "low") return "safe";
        if (severity === "medium") return "caution";
        return "unsafe";
      };

      const getDescription = (severity: string): string => {
        switch (severity) {
          case "none":
            return "No cyanobacteria detected. Water quality is excellent.";
          case "low":
            return "Minimal cyanobacteria presence. Generally safe for swimming.";
          case "medium":
            return "Moderate bloom detected. Swim with caution and avoid swallowing water.";
          case "high":
            return "High concentration of cyanobacteria. Swimming not recommended.";
          default:
            return "Data not available for this beach. Exercise caution when swimming.";
        }
      };

      if (matches.length === 0) {
        // No data available for this beach
        setResult({
          location: beach.areaName,
          region: beach.region,
          status: "unknown",
          severity: "unknown",
          lastUpdated: "N/A",
          description: getDescription("unknown"),
          lat: beach.lat,
          lon: beach.lon
        });
      } else {
        // Get the most recent observation
        const latest = matches.reduce((prev, current) => 
          new Date(current.date) > new Date(prev.date) ? current : prev
        );

        setResult({
          location: latest.areaName,
          region: latest.region,
          status: getSafetyStatus(latest.severity),
          severity: latest.severity,
          lastUpdated: latest.date,
          description: getDescription(latest.severity),
          lat: latest.lat,
          lon: latest.lon
        });
      }
    } catch (err) {
      setError("Failed to fetch beach status. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, [beaches]);

  const filteredBeaches = useMemo(() => {
    if (!searchValue) return beaches;
    return beaches.filter(beach =>
      beach.areaName.toLowerCase().includes(searchValue.toLowerCase()) ||
      beach.region.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [beaches, searchValue]);

  const getStatusIcon = (status: "safe" | "caution" | "unsafe" | "unknown") => {
    switch (status) {
      case "safe":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "caution":
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case "unsafe":
        return <XCircle className="h-8 w-8 text-red-500" />;
      case "unknown":
        return <HelpCircle className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: "safe" | "caution" | "unsafe" | "unknown") => {
    switch (status) {
      case "safe":
        return "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800";
      case "caution":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800";
      case "unsafe":
        return "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800";
      case "unknown":
        return "bg-muted/20 border-muted";
    }
  };

  const getStatusMessage = (status: "safe" | "caution" | "unsafe" | "unknown") => {
    switch (status) {
      case "safe":
        return "Safe to swim";
      case "caution":
        return "Caution: suspected bloom";
      case "unsafe":
        return "Unsafe: bloom detected";
      case "unknown":
        return "Data not available";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-3xl font-heading font-bold">Is My Beach Safe?</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-5 w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Data updates automatically every 60 minutes from satellite observations, monitoring systems, and citizen reports across Finnish beaches.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-muted-foreground">
          Check real-time water quality and cyanobacteria status for {beaches.length}+ Finnish beaches
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      <Card className="p-6 shadow-lg">
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="flex-1 justify-between"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span className={searchValue ? "" : "text-muted-foreground"}>
                    {searchValue || "Search for a beach..."}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Type beach name..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>No beaches found.</CommandEmpty>
                  <CommandGroup heading="Available Beaches">
                    {filteredBeaches.slice(0, 10).map((beach) => (
                      <CommandItem
                        key={`${beach.areaName}-${beach.region}`}
                        value={`${beach.areaName} - ${beach.region}`}
                        onSelect={() => {
                          setSearchValue(beach.areaName);
                          searchBeach(beach.areaName, beach.region);
                          setOpen(false);
                        }}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{beach.areaName}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {beach.region}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <Button 
            onClick={() => searchBeach(searchValue)}
            disabled={!searchValue || loading}
          >
            {loading ? "Checking..." : "Check Status"}
          </Button>
        </div>
      </Card>

      {/* Result Display */}
      {result && (
        <div className="space-y-4">
          <Card className={`p-6 shadow-lg border-2 ${getStatusColor(result.status)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-heading font-bold">
                      {getStatusMessage(result.status)}
                    </h3>
                    {result.status !== "unknown" && (
                      <Badge variant={result.status === "safe" ? "default" : "secondary"}>
                        {result.severity} severity
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {result.location}, {result.region}
                    </span>
                    {result.lastUpdated !== "N/A" && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Updated: {new Date(result.lastUpdated).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-foreground/80">
                  {result.description}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      searchBeach(result.location, result.region);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Map Display */}
          <Card className="p-4 shadow-lg">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Beach Location
            </h4>
            <BeachMap
              lat={result.lat}
              lon={result.lon}
              beachName={result.location}
              status={result.status}
            />
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-6 border-2 border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
