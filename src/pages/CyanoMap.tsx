import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COMPANIES } from "@/data/companies";
import { BloomApi } from "@/services/bloomApi";

interface Beach {
  name: string;
  region: string;
  lat: number;
  lon: number;
}

interface BeachMarker {
  name: string;
  region: string;
  lat: number;
  lon: number;
  status: "detected" | "suspected" | "clear" | "unknown";
  timestamp?: string;
  severity?: string;
  description?: string;
}

const CyanoMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [beachMarkers, setBeachMarkers] = useState<BeachMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();

  const fetchLocalData = async () => {
    setLoading(true);
    try {
      // Load Finnish beaches from local JSON
      const beachesResponse = await fetch('/data/finnish_beaches.json');
      const beaches: Beach[] = await beachesResponse.json();

      // Load bloom observations from local JSON via BloomApi
      await BloomApi.loadData();
      const observations = BloomApi.getAllObservations();

      // Match beaches with observations to determine status
      const markers: BeachMarker[] = beaches.map(beach => {
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
          timestamp: latestObs.date,
          description: `Week ${latestObs.week} observation`,
        };
      });

      setBeachMarkers(markers);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading local data:", error);
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
    fetchLocalData();

    // Set up auto-refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      fetchLocalData();
    }, 60000);

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
      if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add beach markers
    beachMarkers.forEach((beach) => {
      const color =
        beach.status === "detected"
          ? "#ef4444"
          : beach.status === "suspected"
          ? "#eab308"
          : beach.status === "clear"
          ? "#22c55e"
          : "#9ca3af"; // grey for unknown

      const marker = L.circleMarker([beach.lat, beach.lon], {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapRef.current!);

      const statusText =
        beach.status === "detected"
          ? "Bloom Detected"
          : beach.status === "suspected"
          ? "Suspected Bloom"
          : beach.status === "clear"
          ? "Clear / Safe"
          : "Data Not Available";

      // Build popup content
      let popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${beach.name}</h3>
          <p style="margin: 4px 0; color: ${color}; font-weight: 500;">Status: ${statusText}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #666;">Region: ${beach.region}</p>
      `;

      if (beach.timestamp) {
        const formattedTime = new Date(beach.timestamp).toLocaleDateString("en-FI", {
          dateStyle: "medium",
        });
        popupContent += `<p style="margin: 4px 0; font-size: 14px; color: #666;">Last updated: ${formattedTime}</p>`;
      }

      popupContent += `<p style="margin: 4px 0; font-size: 13px; color: #888;">Coordinates: ${beach.lat.toFixed(4)}, ${beach.lon.toFixed(4)}</p>`;

      if (beach.severity) {
        popupContent += `<p style="margin: 4px 0; font-size: 14px; color: #666;">Severity: ${beach.severity}</p>`;
      }

      if (beach.description) {
        popupContent += `<p style="margin: 6px 0 0 0; font-size: 13px; color: #555; line-height: 1.4;">${beach.description}</p>`;
      }

      if (beach.status === "unknown") {
        popupContent += `<p style="margin: 6px 0 0 0; font-size: 13px; color: #888; line-height: 1.4; font-style: italic;">No recent data available. Exercise caution.</p>`;
      }

      popupContent += `</div>`;

      marker.bindPopup(popupContent);
    });

    // Add company markers
    COMPANIES.forEach((company) => {
      // Create a custom icon for companies (different from beach markers)
      const companyIcon = L.divIcon({
        className: "custom-company-marker",
        html: `<div style="
          background-color: hsl(var(--primary));
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        ">🏢</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([company.latitude, company.longitude], {
        icon: companyIcon,
      }).addTo(mapRef.current!);

      const categoryColors: Record<string, string> = {
        cleanup: "#3b82f6",
        biorefinery: "#8b5cf6",
        biotech: "#10b981",
        monitoring: "#f59e0b",
        project: "#ec4899",
      };

      const categoryColor = categoryColors[company.category] || "#6b7280";

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${company.name}</h3>
          <p style="margin: 4px 0; font-size: 13px; color: #666;">
            <span style="display: inline-block; padding: 2px 8px; background-color: ${categoryColor}; color: white; border-radius: 12px; font-size: 11px; font-weight: 500;">
              ${company.category}
            </span>
          </p>
          <p style="margin: 4px 0; font-size: 14px; color: #666;">📍 ${company.city}</p>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #555; line-height: 1.4;">${company.description}</p>
          ${company.website ? `
            <p style="margin: 8px 0 0 0;">
              <a href="${company.website}" target="_blank" rel="noopener noreferrer" style="color: ${categoryColor}; text-decoration: none; font-size: 13px; font-weight: 500;">
                Visit website →
              </a>
            </p>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }, [beachMarkers]);

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
              onClick={fetchLocalData}
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
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white"></div>
                <span className="text-sm">No Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-primary border-2 border-white text-[10px]">🏢</div>
                <span className="text-sm">Companies</span>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">
                Total beaches: {beachMarkers.length}
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
              Click any marker on the map to view details. All data is loaded from local files in public/data directory. Data refreshes automatically every 60 seconds.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CyanoMap;
