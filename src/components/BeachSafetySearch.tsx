import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { BloomApi } from "@/services/bloomApi";

interface Beach {
  name: string;
  region: string;
  lat: number;
  lon: number;
}

interface BeachStatus extends Beach {
  status: "clear" | "suspected" | "detected" | "unknown";
  severity?: string;
  lastUpdated?: string;
  description?: string;
}

export function BeachSafetySearch() {
  const [allBeaches, setAllBeaches] = useState<Beach[]>([]);
  const [beachStatuses, setBeachStatuses] = useState<BeachStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBeaches, setFilteredBeaches] = useState<BeachStatus[]>([]);
  const [selectedBeach, setSelectedBeach] = useState<BeachStatus | null>(null);

  useEffect(() => {
    loadBeachData();
    // Refresh data every 60 seconds
    const interval = setInterval(loadBeachData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = beachStatuses.filter(beach =>
        beach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beach.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBeaches(filtered);
      if (filtered.length > 0 && !selectedBeach) {
        setSelectedBeach(filtered[0]);
      }
    } else {
      setFilteredBeaches([]);
      setSelectedBeach(null);
    }
  }, [searchTerm, beachStatuses]);

  const loadBeachData = async () => {
    try {
      // Load Finnish beaches
      const beachesResponse = await fetch('/data/finnish_beaches.json');
      const beaches: Beach[] = await beachesResponse.json();
      setAllBeaches(beaches);

      // Load bloom observations
      await BloomApi.loadData();
      const observations = BloomApi.getAllObservations();

      // Match beaches with observations
      const beachStatusData: BeachStatus[] = beaches.map(beach => {
        // Find the latest observation for this beach area
        const beachObs = observations
          .filter(obs => obs.areaName === beach.name)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (beachObs.length === 0) {
          return {
            ...beach,
            status: "unknown" as const,
          };
        }

        const latestObs = beachObs[0];
        let status: "clear" | "suspected" | "detected" | "unknown" = "unknown";

        if (latestObs.severity === "high") {
          status = "detected";
        } else if (latestObs.severity === "medium") {
          status = "suspected";
        } else if (latestObs.severity === "low" || latestObs.severity === "none") {
          status = "clear";
        }

        return {
          ...beach,
          status,
          severity: latestObs.severity,
          lastUpdated: latestObs.date,
          description: `Week ${latestObs.week} observation`,
        };
      });

      setBeachStatuses(beachStatusData);
    } catch (error) {
      console.error("Error loading beach data:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "clear":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "suspected":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "detected":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "clear":
        return "bg-green-50 border-green-200";
      case "suspected":
        return "bg-yellow-50 border-yellow-200";
      case "detected":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "clear":
        return "Safe to swim";
      case "suspected":
        return "Caution: suspected bloom";
      case "detected":
        return "Unsafe: bloom detected";
      default:
        return "Data not available";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-heading flex items-center gap-3">
            <Search className="h-8 w-8 text-primary" />
            Is My Beach Safe?
          </CardTitle>
          <p className="text-muted-foreground">
            Check real-time water quality and cyanobacteria status for Nordic & Baltic beaches
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a beach..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results Dropdown */}
          {filteredBeaches.length > 0 && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {filteredBeaches.map((beach) => (
                <button
                  key={`${beach.name}-${beach.region}`}
                  onClick={() => setSelectedBeach(beach)}
                  className={`w-full text-left p-3 hover:bg-accent transition-colors flex items-center justify-between ${
                    selectedBeach?.name === beach.name ? "bg-accent" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">{beach.name}</p>
                    <p className="text-sm text-muted-foreground">{beach.region}</p>
                  </div>
                  {getStatusIcon(beach.status)}
                </button>
              ))}
            </div>
          )}

          {/* Selected Beach Status */}
          {selectedBeach && (
            <Card className={`border-2 ${getStatusColor(selectedBeach.status)}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-heading font-semibold">{selectedBeach.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedBeach.region}</p>
                  </div>
                  {getStatusIcon(selectedBeach.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span className="text-lg">{getStatusMessage(selectedBeach.status)}</span>
                  </div>

                  {selectedBeach.severity && selectedBeach.status !== "unknown" && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Severity:</span>
                      <Badge variant={
                        selectedBeach.severity === "high" ? "destructive" :
                        selectedBeach.severity === "medium" ? "default" :
                        "secondary"
                      }>
                        {selectedBeach.severity}
                      </Badge>
                    </div>
                  )}

                  {selectedBeach.lastUpdated && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Last updated:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(selectedBeach.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {selectedBeach.description && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                      {selectedBeach.description}
                    </p>
                  )}

                  {selectedBeach.status === "unknown" && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Data not available for this beach. Exercise caution when swimming.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Coordinates: {selectedBeach.lat.toFixed(4)}, {selectedBeach.lon.toFixed(4)}
                </div>
              </CardContent>
            </Card>
          )}

          {searchTerm && filteredBeaches.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No beaches found matching "{searchTerm}"
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Data updates automatically every hour based on citizen reports and satellite observations.
            All data is loaded from local files in the public/data directory.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
