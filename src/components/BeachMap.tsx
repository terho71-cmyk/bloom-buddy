import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface BeachMapProps {
  lat: number;
  lon: number;
  beachName: string;
  status: "safe" | "caution" | "unsafe" | "unknown";
}

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export function BeachMap({ lat, lon, beachName, status }: BeachMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "safe":
        return "#22c55e"; // green
      case "caution":
        return "#eab308"; // yellow
      case "unsafe":
        return "#ef4444"; // red
      case "unknown":
        return "#6b7280"; // grey
      default:
        return "#6b7280";
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map if not already created
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([lat, lon], 12);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Create custom colored marker
    const markerColor = getMarkerColor(status);
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${markerColor};
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 12px;
            height: 12px;
            background-color: white;
            border-radius: 50%;
            position: absolute;
            top: 4px;
            left: 4px;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    // Remove old marker if exists
    if (marker.current) {
      map.current.removeLayer(marker.current);
    }

    // Add new marker
    marker.current = L.marker([lat, lon], { icon: customIcon })
      .addTo(map.current)
      .bindPopup(`<strong>${beachName}</strong><br/>${status.toUpperCase()}`)
      .openPopup();

    // Center map on new location
    map.current.setView([lat, lon], 12);

    // Cleanup
    return () => {
      if (marker.current && map.current) {
        map.current.removeLayer(marker.current);
      }
    };
  }, [lat, lon, beachName, status]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-64 rounded-lg border-2 border-border shadow-md"
      style={{ zIndex: 0 }}
    />
  );
}
