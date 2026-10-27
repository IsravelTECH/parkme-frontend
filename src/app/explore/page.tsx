"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Navigation,
  Car,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { CONFIG } from "@/lib/config";
import { ParkingSpace } from "@/components/map/ParkingMap";
import BookingDrawer from "@/components/booking/BookingDrawer";
import DigitalPassModal, { BookingPassData } from "@/components/booking/DigitalPassModal";

// Dynamic import with SSR disabled for Leaflet Map
const DynamicParkingMap = dynamic(() => import("@/components/map/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[320px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3 animate-pulse border border-slate-200">
      <Car className="w-8 h-8 text-blue-500 animate-bounce" />
      <span className="text-xs font-bold text-slate-600">Loading Chennai Parking Radar...</span>
    </div>
  ),
});

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialSelected = searchParams.get("selected") || null;
  const initialLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
  const initialLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;

  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );

  // Booking states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [passData, setPassData] = useState<BookingPassData | null>(null);

  // Fetch all parking locations
  useEffect(() => {
    let isMounted = true;
    async function loadParkings() {
      try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/parkings`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setSpaces(data);
          if (initialSelected) {
            const found = data.find((s) => s._id === initialSelected);
            if (found) setSelectedSpace(found);
          }
        }
      } catch (err) {
        console.warn("Could not load parkings from backend:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadParkings();
    return () => {
      isMounted = false;
    };
  }, [initialSelected]);

  // Handle GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
      },
      (err) => {
        console.warn("Location access denied:", err.message);
      }
    );
  };

  // Filter and search spaces across name, city, landmark, address, and features
  const filteredSpaces = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return spaces.filter((space) => {
      const matchesSearch =
        !query ||
        space.name.toLowerCase().includes(query) ||
        space.city.toLowerCase().includes(query) ||
        (space.landmark && space.landmark.toLowerCase().includes(query)) ||
        (space.address && space.address.toLowerCase().includes(query)) ||
        (space.features && space.features.some((f) => f.toLowerCase().includes(query)));

      if (!matchesSearch) return false;

      if (activeFilter === "cheap") return space.price_per_hour <= 50;
      if (activeFilter === "ev")
        return (
          space.features?.some((f) => f.toLowerCase().includes("ev")) ||
          space.name.toLowerCase().includes("ev")
        );
      if (activeFilter === "cctv")
        return space.features?.some((f) => f.toLowerCase().includes("cctv"));
      if (activeFilter === "covered")
        return space.features?.some((f) => f.toLowerCase().includes("covered"));
      if (activeFilter === "available") return space.available_slots > 0;

      return true;
    });
  }, [spaces, searchQuery, activeFilter]);

  // Handler when selecting a space from the map
  const handleSelectFromMap = (space: ParkingSpace) => {
    setSelectedSpace(space);
    // Smooth scroll down to the card in the lower grid
    const el = document.getElementById(`space-card-${space._id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ================= UPPER PART: SEARCH & INTERACTIVE MAP ================= */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          {/* Search Box & Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search Input Box */}
            <div className="w-full flex-1 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition">
              <Search className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search landmark, area, city, or features (e.g. Vadapalani, Beach, EV, CCTV)..."
                className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} title="Clear search">
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* GPS Locate Me Button */}
            <button
              onClick={handleLocateMe}
              title="Use Current Location"
              className="w-full sm:w-auto px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition flex items-center justify-center gap-2 text-xs font-bold shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Locate Me</span>
            </button>
          </div>

          {/* Filter Chips Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            {[
              { id: "all", label: `All Spots (${spaces.length})` },
              { id: "available", label: "Open Now" },
              { id: "cheap", label: "< ₹50/hr" },
              { id: "cctv", label: "CCTV Guarded" },
              { id: "covered", label: "Covered Roof" },
              { id: "ev", label: "EV Station" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-[11px] ${
                  activeFilter === filter.id
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upper Interactive Map Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
          <div className="w-full h-[360px] md:h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <DynamicParkingMap
              spaces={filteredSpaces}
              selectedSpaceId={selectedSpace?._id || null}
              onSelectSpace={handleSelectFromMap}
              userCoords={userCoords}
            />
          </div>
        </div>
      </div>

      {/* ================= DOWN PART: SLOTS LIST & GRID ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Results Counter & Telemetry Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">
              {filteredSpaces.length} {filteredSpaces.length === 1 ? "Parking Hub" : "Parking Hubs"} Available in Chennai
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any card to fly to its position on the map or reserve your spot immediately.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedSpace && (
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-200">
                Active: {selectedSpace.name}
              </span>
            )}
            <span className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="pt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-3xl border border-slate-200 animate-pulse bg-white space-y-3"
                >
                  <div className="w-full h-40 bg-slate-200 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredSpaces.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
              <Car className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-extrabold text-base text-slate-800">No matching spaces found</p>
              <p className="text-xs text-slate-500">
                Try searching a different landmark or click below to reset active filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredSpaces.map((space) => {
                const isSelected = selectedSpace?._id === space._id;
                const isAvailable = space.available_slots > 0;
                const imageUrl = space.image
                  ? space.image.startsWith("http")
                    ? space.image
                    : `${CONFIG.API_BASE_URL}/${space.image}`
                  : "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80";

                return (
                  <div
                    key={space._id}
                    id={`space-card-${space._id}`}
                    onClick={() => {
                      setSelectedSpace(space);
                      // Scroll page to top so user can see map location
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group bg-white shadow-sm hover:shadow-md ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-500/20 shadow-lg"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      {/* Thumbnail Image with Status Badge */}
                      <div className="relative w-full h-44 overflow-hidden bg-slate-100">
                        <img
                          src={imageUrl}
                          alt={space.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                        {/* Availability Pill */}
                        <span
                          className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md ${
                            isAvailable
                              ? "bg-emerald-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {isAvailable ? `${space.available_slots} Slots Free` : "Sold Out"}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition leading-snug truncate">
                          {space.name}
                        </h4>

                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {space.landmark ? `${space.landmark}, ` : ""}
                            {space.city}
                          </span>
                        </p>

                        {/* Amenities Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {space.features && space.features.length > 0 ? (
                            space.features.slice(0, 3).map((feat) => (
                              <span
                                key={feat}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                              >
                                {feat}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              Verified Space
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Tariff & Reserve Button */}
                    <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">
                          Tariff
                        </span>
                        <span className="font-extrabold text-blue-600 text-base">
                          ₹{space.price_per_hour}
                          <span className="text-[10px] text-slate-400 font-normal">
                            /hr
                          </span>
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSpace(space);
                          setIsBookingOpen(true);
                        }}
                        className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                          isAvailable
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <span>{isAvailable ? "Reserve" : "Occupied"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Booking Drawer Slide-over */}
      <BookingDrawer
        space={selectedSpace}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={(pass) => setPassData(pass)}
      />

      {/* Digital Boarding Pass Modal */}
      <DigitalPassModal passData={passData} onClose={() => setPassData(null)} />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading Parking Map...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
