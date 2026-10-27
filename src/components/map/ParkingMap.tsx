"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, Navigation, Layers, Satellite, Map as MapIcon } from "lucide-react";

export interface ParkingSpace {
  _id: string;
  name: string;
  city: string;
  landmark?: string;
  address: string;
  price_per_hour: number;
  total_slots: number;
  available_slots: number;
  features?: string[];
  image?: string;
  location?: {
    type?: string;
    coordinates?: [number, number]; // [lng, lat]
  };
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

export function getParkingCoordinates(space: ParkingSpace): [number, number] | null {
  if (space.lat !== undefined && space.lng !== undefined && !isNaN(Number(space.lat)) && !isNaN(Number(space.lng))) {
    return [Number(space.lat), Number(space.lng)];
  }
  if (space.latitude !== undefined && space.longitude !== undefined && !isNaN(Number(space.latitude)) && !isNaN(Number(space.longitude))) {
    return [Number(space.latitude), Number(space.longitude)];
  }
  if (space.location?.coordinates && space.location.coordinates.length >= 2) {
    const lng = Number(space.location.coordinates[0]);
    const lat = Number(space.location.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
  }
  return null;
}

interface ParkingMapProps {
  spaces: ParkingSpace[];
  selectedSpaceId: string | null;
  onSelectSpace: (space: ParkingSpace) => void;
  userCoords?: [number, number] | null; // [lat, lng]
}

export default function ParkingMap({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  userCoords,
}: ParkingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Map Tile Style: 'osm' (OpenStreetMap) | 'esri' (ESRI Street Map) | 'satellite' (ESRI Satellite)
  const [mapStyle, setMapStyle] = useState<"osm" | "esri" | "satellite">("osm");

  const defaultCenter: [number, number] = [13.0450, 80.2400]; // Central Chennai hub coordinate

  const getTileUrl = (style: "osm" | "esri" | "satellite") => {
    switch (style) {
      case "esri":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
      case "satellite":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case "osm":
      default:
        return "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };

  // 1. Initialize Map Safely
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init in StrictMode

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 12.5,
      zoomControl: false,
      attributionControl: false,
    });

    const initialTiles = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    tileLayerRef.current = initialTiles;
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Invalidation to ensure tiles load correctly in dynamic containers
    const t1 = setTimeout(() => {
      if (mapInstanceRef.current && containerRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    const t2 = setTimeout(() => {
      if (mapInstanceRef.current && containerRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 450);

    timeoutsRef.current.push(t1, t2);

    const handleResize = () => {
      if (mapInstanceRef.current && containerRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Change Tile Layer Dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTiles = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newTiles;
  }, [mapStyle]);

  // 3. Render Parking Space Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // User GPS location beacon
    if (userCoords) {
      const userIcon = L.divIcon({
        className: "user-gps-marker",
        html: `
          <div style="position:relative;width:22px;height:22px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 0 14px rgba(37,99,235,0.7);">
            <div style="position:absolute;top:-8px;left:-8px;width:32px;height:32px;border-radius:50%;background:rgba(37,99,235,0.3);animation:ping 1.5s infinite;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      L.marker(userCoords, { icon: userIcon })
        .bindPopup("<div class='p-1 text-xs font-bold text-slate-800'>Your Current Location</div>")
        .addTo(layer);
    }

    // Parking spaces
    spaces.forEach((space) => {
      const coords = getParkingCoordinates(space);
      if (!coords) return;
      const [lat, lng] = coords;

      const isSelected = space._id === selectedSpaceId;
      const isAvailable = space.available_slots > 0;

      const markerHtml = `
        <div style="
          background: ${isSelected ? "#1e40af" : isAvailable ? "#2563eb" : "#64748b"};
          color: white;
          padding: 5px 11px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 11px;
          border: 2px solid ${isSelected ? "#f59e0b" : "white"};
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          transform: translate(-50%, -50%) scale(${isSelected ? "1.15" : "1.0"});
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          cursor: pointer;
        ">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${
            isAvailable ? "#10b981" : "#ef4444"
          };"></span>
          <span>₹${space.price_per_hour}</span>
          <span style="font-size:9px;opacity:0.85;font-weight:600;">/hr</span>
        </div>
      `;

      const icon = L.divIcon({
        className: "luxury-price-marker",
        html: markerHtml,
        iconSize: [75, 28],
        iconAnchor: [37, 14],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(layer);

      marker.on("click", () => {
        onSelectSpace(space);
      });
    });
  }, [spaces, selectedSpaceId, userCoords, onSelectSpace]);

  // 4. Center on Selected Space Smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedSpaceId) return;

    const selected = spaces.find((s) => s._id === selectedSpaceId);
    if (!selected) return;

    const coords = getParkingCoordinates(selected);
    if (coords) {
      map.flyTo(coords, 15, { duration: 0.9 });
    }
  }, [selectedSpaceId, spaces]);

  // 5. Pan or fit when filtered spaces change (search update)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || spaces.length === 0) return;
    if (selectedSpaceId) return; // Do not override explicit spot selection

    const validPoints: [number, number][] = [];
    spaces.forEach((s) => {
      const c = getParkingCoordinates(s);
      if (c) validPoints.push(c);
    });

    if (validPoints.length === 1) {
      map.flyTo(validPoints[0], 14.5, { duration: 0.8 });
    } else if (validPoints.length > 1) {
      const bounds = L.latLngBounds(validPoints);
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 13.5, duration: 0.8 });
    }
  }, [spaces, selectedSpaceId]);

  // Map Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userCoords, 14, { duration: 1 });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(defaultCenter, 12.5, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-2xl border border-slate-200/90 shadow-sm bg-slate-100">
      {/* Map DOM Element */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-10" />

      {/* Floating Controls Bar */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        {/* Style Switcher Menu */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 p-1 gap-1">
          <button
            onClick={() => setMapStyle("osm")}
            title="OpenStreetMap Standard"
            className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mapStyle === "osm"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setMapStyle("esri")}
            title="ESRI Clean Street Map"
            className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mapStyle === "esri"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setMapStyle("satellite")}
            title="Satellite Imagery"
            className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mapStyle === "satellite"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          title="Recenter Chennai"
          className="p-2.5 bg-white/95 hover:bg-white backdrop-blur-md rounded-xl shadow-md text-slate-700 hover:text-blue-600 border border-slate-200/80 transition"
        >
          <Navigation className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2.5 hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition border-b border-slate-100"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2.5 hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ambient Telemetry Pill */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Radar</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-200 font-normal">{spaces.length} Spaces Mapped</span>
        </div>
      </div>
    </div>
  );
}
