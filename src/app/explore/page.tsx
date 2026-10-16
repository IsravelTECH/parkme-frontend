"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Navigation,
  Car,
  X,
  Sparkles,
  ArrowRight,
  Map as MapIcon,
  List as ListIcon,
  Star,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { CONFIG } from "@/lib/config";
import { ParkingSpace } from "@/components/map/ParkingMap";
import BookingDrawer from "@/components/booking/BookingDrawer";
import DigitalPassModal, { BookingPassData } from "@/components/booking/DigitalPassModal";

// Dynamic import with SSR disabled for Leaflet Map
const DynamicParkingMap = dynamic(() => import("@/components/map/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3 animate-pulse border border-slate-200">
      <Car className="w-10 h-10 text-blue-500 animate-bounce" />
      <span className="text-xs font-bold text-slate-600">Initializing Urban Radar...</span>
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

  // Mobile view mode: 'list' or 'map'
  const [mobileTab, setMobileTab] = useState<"list" | "map">("list");

  // Booking states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [passData, setPassData] = useState<BookingPassData | null>(null);

  // Fetch all parking locations
  useEffect(() => {
    fetch(`${CONFIG.API_BASE_URL}/parkings`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSpaces(data);
          if (initialSelected) {
            const found = data.find((s) => s._id === initialSelected);
            if (found) setSelectedSpace(found);
          }
        }
      })
      .catch((err) => console.error("Error loading parkings:", err))
      .finally(() => setLoading(false));
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

  // Filter and search spaces
  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        space.name.toLowerCase().includes(query) ||
        space.city.toLowerCase().includes(query) ||
        (space.landmark && space.landmark.toLowerCase().includes(query)) ||
        (space.address && space.address.toLowerCase().includes(query));

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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100 relative overflow-hidden">
      {/* 50/50 Desktop Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 overflow-hidden">
        {/* LEFT COLUMN: LIST VIEW */}
        <aside
          className={`w-full md:w-[480px] lg:w-[520px] xl:w-[560px] h-full flex flex-col bg-white border-r border-slate-200 z-20 shrink-0 shadow-sm transition-all duration-300 ${
            mobileTab === "map" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search Capsule & Filters Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-white">
            {/* Search Input Box */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search landmark, area, or city..."
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              {/* GPS button */}
              <button
                onClick={handleLocateMe}
                title="Use Current Location"
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition shrink-0"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Chips Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              {[
                { id: "all", label: "All Spots" },
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

            {/* Results Counter Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="font-bold text-slate-800">
                {filteredSpaces.length} {filteredSpaces.length === 1 ? "Space" : "Spaces"} in Chennai
              </span>
              <span className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Space Telemetry
              </span>
            </div>
          </div>

          {/* Parking Spaces Scrollable Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-3xl border border-slate-200 animate-pulse flex gap-4 bg-white"
                  >
                    <div className="w-28 h-28 bg-slate-200 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2.5 py-1">
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-8 bg-slate-200 rounded-xl mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSpaces.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
                <Car className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-extrabold text-base text-slate-800">No matching spaces found</p>
                <p className="text-xs text-slate-400">
                  Try clearing the search query or changing active filter pills.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredSpaces.map((space) => {
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
                    onClick={() => {
                      setSelectedSpace(space);
                      if (window.innerWidth < 768) {
                        setMobileTab("map");
                      }
                    }}
                    className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-4 group ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md"
                        : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-full sm:w-36 h-36 sm:h-auto rounded-2xl overflow-hidden shrink-0 bg-slate-100">
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
                        className={`absolute top-2.5 left-2.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md ${
                          isAvailable
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {isAvailable ? `${space.available_slots} Open` : "Sold Out"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition leading-tight">
                            {space.name}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {space.landmark ? `${space.landmark}, ` : ""}
                            {space.city}
                          </span>
                        </p>

                        {/* Amenities Chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
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

                      {/* Bottom Price & Reserve Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">
                            Tariff
                          </span>
                          <span className="font-extrabold text-blue-600 text-lg">
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
                          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            isAvailable
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <span>{isAvailable ? "Reserve Spot" : "Occupied"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: FULL-HEIGHT LEAFLET MAP */}
        <main
          className={`flex-1 h-full min-h-[500px] p-3 sm:p-5 relative flex flex-col ${
            mobileTab === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          <DynamicParkingMap
            spaces={filteredSpaces}
            selectedSpaceId={selectedSpace?._id || null}
            onSelectSpace={(space) => setSelectedSpace(space)}
            userCoords={userCoords}
          />

          {/* Floating Selected Spot Drawer Preview on Map */}
          {selectedSpace && (
            <div className="absolute bottom-6 left-6 right-6 max-w-lg mx-auto z-30 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-900/15 animate-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shrink-0">
                    ₹{selectedSpace.price_per_hour}
                  </div>
                  <div className="truncate">
                    <h5 className="font-extrabold text-sm text-slate-900 leading-tight truncate">
                      {selectedSpace.name}
                    </h5>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {selectedSpace.landmark || selectedSpace.city} •{" "}
                      <span className="text-emerald-600 font-bold">
                        {selectedSpace.available_slots} slots free
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedSpace(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    disabled={selectedSpace.available_slots <= 0}
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition disabled:opacity-50"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Floating Toggle Switch (Map vs List) */}
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setMobileTab(mobileTab === "list" ? "map" : "list")}
          className="px-5 py-2.5 rounded-full bg-slate-900 text-white shadow-xl shadow-black/30 border border-slate-700 font-extrabold text-xs flex items-center gap-2 transition hover:scale-105 active:scale-95"
        >
          {mobileTab === "list" ? (
            <>
              <MapIcon className="w-4 h-4 text-blue-400" />
              <span>Show Map ({filteredSpaces.length})</span>
            </>
          ) : (
            <>
              <ListIcon className="w-4 h-4 text-blue-400" />
              <span>Show List</span>
            </>
          )}
        </button>
      </div>

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
