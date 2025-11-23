import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CyanoLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  status: "detected" | "suspected" | "clear";
  timestamp: string;
}

const CyanoMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<CyanoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();

  const fetchCyanoData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/cyano");
      const data = await response.json();
      setLocations(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching cyano data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Nordic countries and Baltic Sea
    const maxBounds: L.LatLngBoundsExpression = [
      [52.0, -5.0],  // South-West corner
      [72.0, 35.0],  // North-East corner
    ];

    mapRef.current = L.map(mapContainerRef.current, {
      center: [60.0, 22.0],
      zoom: 5.5,
      minZoom: 4,
      maxZoom: 19,
      maxBounds: maxBounds,
      maxBoundsViscosity: 1.0, // Makes bounds more restrictive
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // Fetch initial data
    fetchCyanoData();

    // Set up auto-refresh every 12 hours (43200000 ms)
    const refreshInterval = setInterval(() => {
      fetchCyanoData();
    }, 43200000);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for each location
    locations.forEach((location) => {
      const color =
        location.status === "detected"
          ? "#ef4444"
          : location.status === "suspected"
          ? "#eab308"
          : "#22c55e";

      const marker = L.circleMarker([location.lat, location.lon], {
        radius: 10,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapRef.current!);

      const formattedTime = new Date(location.timestamp).toLocaleString("en-FI", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const statusText =
        location.status === "detected"
          ? "Algae Detected"
          : location.status === "suspected"
          ? "Suspected"
          : "Clear";

      marker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${location.name}</h3>
          <p style="margin: 4px 0; color: ${color}; font-weight: 500;">Status: ${statusText}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #666;">Last updated: ${formattedTime}</p>
        </div>
      `);
    });
  }, [locations]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Baltic Sea Cyanobacteria Monitoring (Nordic Region)
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time monitoring of algae blooms across the Baltic Sea
                </p>
              </div>
            </div>
            <Button
              onClick={fetchCyanoData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Status Legend</h2>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                <span className="text-sm">Detected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
                <span className="text-sm">Suspected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                <span className="text-sm">Clear</span>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">
                Total locations: {locations.length}
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div
              ref={mapContainerRef}
              className="w-full h-[600px]"
              style={{ background: "hsl(var(--muted))" }}
            />
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              The map shows current cyanobacteria bloom conditions in the Baltic Sea and Nordic region, updated automatically every 12 hours.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CyanoMap;
