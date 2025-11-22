import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerMapProps {
  onLocationChange?: (coords: { lat: number; lon: number }) => void;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPickerMap({ onLocationChange }: LocationPickerMapProps) {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lon: number } | null>(null);

  const handleLocationSelect = (lat: number, lon: number) => {
    const coords = { lat, lon };
    setSelectedPosition(coords);
    onLocationChange?.(coords);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-[500px] w-full">
        <MapContainer
          center={[60.1699, 24.9384]} // Helsinki, Finland
          zoom={6}
          className="h-full w-full"
          style={{ zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {selectedPosition && (
            <Marker position={[selectedPosition.lat, selectedPosition.lon]} />
          )}
        </MapContainer>
      </div>
      <div className="p-4 border-t bg-card">
        {selectedPosition ? (
          <div className="text-sm">
            <span className="font-semibold text-foreground">Selected location:</span>{" "}
            <span className="text-muted-foreground">
              {selectedPosition.lat.toFixed(4)}, {selectedPosition.lon.toFixed(4)}
            </span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No location selected. Click on the map to choose a location.
          </div>
        )}
      </div>
    </Card>
  );
}
