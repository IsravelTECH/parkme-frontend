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
  latitude?: number;
  longitude?: number;
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

  const defaultCenter: [number, number] = [13.0827, 80.2707]; // Chennai coordinates

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
      zoom: 13,
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

    // Safe Invalidation with stored timeouts
    const t1 = setTimeout(() => {
      if (mapInstanceRef.current && containerRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    const t2 = setTimeout(() => {
      if (mapInstanceRef.current && containerRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 500);

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
      let lat: number | null = null;
      let lng: number | null = null;

      if (space.location?.coordinates && space.location.coordinates.length >= 2) {
        lng = space.location.coordinates[0];
        lat = space.location.coordinates[1];
      } else if (space.latitude && space.longitude) {
        lat = space.latitude;
        lng = space.longitude;
      }

      if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) return;

      const isSelected = space._id === selectedSpaceId;
      const isAvailable = space.available_slots > 0;

      const markerHtml = `
        <div style="
          background: ${isSelected ? "#1e40af" : isAvailable ? "#2563eb" : "#475569"};
          color: white;
          padding: 6px 12px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 12px;
          border: 2px solid ${isSelected ? "#f59e0b" : "white"};
          box-shadow: 0 6px 18px rgba(0,0,0,0.3);
          transform: translate(-50%, -50%) scale(${isSelected ? "1.15" : "1.0"});
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          cursor: pointer;
        ">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${
            isAvailable ? "#34d399" : "#f87171"
          };"></span>
          <span>₹${space.price_per_hour}</span>
          <span style="font-size:10px;opacity:0.85;font-weight:500;">/hr</span>
        </div>
      `;

      const icon = L.divIcon({
        className: "luxury-price-marker",
        html: markerHtml,
        iconSize: [75, 30],
        iconAnchor: [37, 15],
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

    let lat: number | null = null;
    let lng: number | null = null;

    if (selected.location?.coordinates && selected.location.coordinates.length >= 2) {
      lng = selected.location.coordinates[0];
      lat = selected.location.coordinates[1];
    } else if (selected.latitude && selected.longitude) {
      lat = selected.latitude;
      lng = selected.longitude;
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
    }
  }, [selectedSpaceId, spaces]);

  // Map Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userCoords, 14, { duration: 1 });
    } else if (spaces.length > 0 && mapInstanceRef.current) {
      const first = spaces[0];
      const lat = first.location?.coordinates?.[1] || first.latitude || defaultCenter[0];
      const lng = first.location?.coordinates?.[0] || first.longitude || defaultCenter[1];
      mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1 });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(defaultCenter, 13, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl bg-slate-100">
      {/* Map DOM Element */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-10" />

      {/* Floating Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Style Switcher Menu */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-1 gap-1">
          <button
            onClick={() => setMapStyle("osm")}
            title="OpenStreetMap Standard"
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
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
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
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
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
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
          title="Recenter Map"
          className="p-3 bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl shadow-lg text-slate-700 hover:text-blue-600 border border-slate-200/80 transition"
        >
          <Navigation className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-3 hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition border-b border-slate-100"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-3 hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ambient Telemetry Pill */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Radar Telemetry</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 font-normal">{spaces.length} Spaces Mapped</span>
        </div>
      </div>
    </div>
  );
}
