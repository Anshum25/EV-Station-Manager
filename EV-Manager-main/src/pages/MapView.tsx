import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChargingStations } from "@/hooks/useChargingStations";
import { ChargingStation } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Zap,
  Settings,
  Power,
  LogOut,
  User,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const connectorTypeLabels = {
  type1: "Type 1",
  type2: "Type 2",
  ccs: "CCS",
  chademo: "CHAdeMO",
  tesla: "Tesla",
};

export default function MapView() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: stations = [], isLoading } = useChargingStations();
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Default center (New York City) or from URL params
  const defaultLat = parseFloat(searchParams.get("lat") || "40.7128");
  const defaultLng = parseFloat(searchParams.get("lng") || "-74.0060");

  const createCustomIcon = (isActive: boolean) => {
    const color = isActive ? "#10b981" : "#6b7280";
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      className: "custom-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(
      [defaultLat, defaultLng],
      13,
    );

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [defaultLat, defaultLng]);

  useEffect(() => {
    if (!mapRef.current || !stations.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    stations.forEach((station) => {
      if (!mapRef.current) return;

      const marker = L.marker([station.latitude, station.longitude], {
        icon: createCustomIcon(station.status === "active"),
      });

      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-lg mb-2">${station.name}</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                station.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }">
                ${station.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            <div class="text-sm text-gray-600">
              <div class="flex items-center mb-1">
                <span class="mr-1">📍</span>
                ${station.latitude.toFixed(6)}, ${station.longitude.toFixed(6)}
              </div>
              <div class="flex items-center mb-1">
                <span class="mr-1">⚡</span>
                ${station.power_output} kW
              </div>
              <div class="flex items-center">
                <span class="mr-1">🔌</span>
                ${connectorTypeLabels[station.connector_type]}
              </div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on("click", () => setSelectedStation(station));
      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    // If we have lat/lng params, find and select the corresponding station
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      const station = stations.find(
        (s) =>
          s.latitude === parseFloat(lat) && s.longitude === parseFloat(lng),
      );
      if (station) {
        setSelectedStation(station);
        mapRef.current.setView([station.latitude, station.longitude], 15);
      }
    }
  }, [stations, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Zap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Map View</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                {user?.email}
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        {/* Map */}
        <div
          ref={mapContainerRef}
          className="h-full w-full"
          style={{ height: "100%", width: "100%" }}
        />

        {/* Legend */}
        <Card className="absolute top-4 right-4 z-[1000] w-64">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow mr-3"></div>
                <span className="text-sm">Active Station</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow mr-3"></div>
                <span className="text-sm">Inactive Station</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t">
              <div className="text-sm text-gray-600">
                <strong>Total Stations:</strong> {stations.length}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Active:</strong>{" "}
                {stations.filter((s) => s.status === "active").length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Station Details Sidebar */}
        {selectedStation && (
          <Card className="absolute top-4 left-4 z-[1000] w-80">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">
                  {selectedStation.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStation(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      selectedStation.status === "active"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      selectedStation.status === "active"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }
                  >
                    <Power className="w-3 h-3 mr-1" />
                    {selectedStation.status === "active"
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span>
                      {selectedStation.latitude.toFixed(6)},{" "}
                      {selectedStation.longitude.toFixed(6)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="font-medium">
                      {selectedStation.power_output} kW
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-blue-500" />
                    <span>
                      {connectorTypeLabels[selectedStation.connector_type]}
                    </span>
                  </div>

                  <div className="pt-2 text-xs text-gray-500 border-t">
                    Created:{" "}
                    {new Date(selectedStation.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
