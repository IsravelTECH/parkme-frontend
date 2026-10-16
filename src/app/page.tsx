"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Car,
  Navigation,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Building,
  Smartphone,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { CONFIG } from "@/lib/config";

interface ParkingSpace {
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
}

export default function HomePage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    fetch(`${CONFIG.API_BASE_URL}/parkings`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSpaces(data.slice(0, 6));
        }
      })
      .catch((err) => console.error("Error loading parkings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set("query", searchCity);
    if (vehicleType) params.set("vehicle", vehicleType);
    router.push(`/explore?${params.toString()}`);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        router.push(
          `/explore?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=5`
        );
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation denied:", err.message);
        router.push("/explore");
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-400/20 to-indigo-500/20 blur-3xl -z-10 rounded-full pointer-events-none" />
        <div className="absolute -top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Real-time Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 shadow-sm shadow-blue-500/10">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-blue-900 tracking-wide uppercase">
              Live Urban Telemetry
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-600">
              Guaranteed Spot Availability
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Never Circle The <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              Block Again.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Reserve premium parking spaces in seconds. Real-time slot telemetry, in-app turn-by-turn navigation, and encrypted touchless gate access.
          </p>

          {/* 2. LUXURY SEARCH CAPSULE */}
          <div className="pt-4 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-900/10 flex flex-col md:flex-row items-stretch gap-3 transition-all"
            >
              {/* Location Input */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    City or Landmark
                  </label>
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="e.g. Anna Nagar, T Nagar, Chennai"
                    className="w-full bg-transparent border-none text-slate-900 font-semibold text-sm focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Vehicle Type Picker */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition min-w-[160px]">
                <Car className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-transparent border-none text-slate-900 font-semibold text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="car">Car (Sedan/Hatch)</option>
                    <option value="suv">SUV / Premium</option>
                    <option value="bike">Motorbike / Scooter</option>
                    <option value="ev">Electric Vehicle (EV)</option>
                  </select>
                </div>
              </div>

              {/* Buttons: Near Me & Find Parking */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNearMe}
                  disabled={isLocating}
                  title="Detect Current Location"
                  className="px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition shrink-0"
                >
                  <Navigation
                    className={`w-4 h-4 text-blue-600 ${isLocating ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Near Me</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition hover:shadow-xl hover:shadow-blue-500/40"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Parking</span>
                </button>
              </div>
            </form>

            {/* Quick tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Popular hubs:</span>
              {["Anna Nagar", "T Nagar", "Marina Beach", "Airport", "Velachery"].map(
                (hub) => (
                  <button
                    key={hub}
                    onClick={() => {
                      setSearchCity(hub);
                      router.push(`/explore?query=${encodeURIComponent(hub)}`);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition shadow-2xs"
                  >
                    {hub}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. METRIC / SOCIAL PROOF STRIP */}
      <section className="border-y border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">4.9 / 5</p>
            <p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Over 12,000+ Driver Reviews
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-blue-600 tracking-tight">99.8%</p>
            <p className="text-xs font-semibold text-slate-500">
              Guaranteed Reserved Bays
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">&lt; 30s</p>
            <p className="text-xs font-semibold text-slate-500">
              Instant Touchless Booking
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">24/7</p>
            <p className="text-xs font-semibold text-slate-500">
              CCTV Monitored & Guarded
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED REAL-TIME PARKING SPOTS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <Sparkles className="w-4 h-4" /> Live Availability
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Urban Parking Spaces
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Prime spots with instant booking confirmation and navigation.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 group"
          >
            <span>View all locations on map</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-4"
              >
                <div className="w-full h-48 bg-slate-200 rounded-2xl" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No spaces listed yet</h3>
            <p className="text-sm text-slate-400 mt-1">
              Be the first to list an open space and monetize it!
            </p>
            <Link
              href="/host"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md"
            >
              List a Parking Spot
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const isAvailable = space.available_slots > 0;
              const imageUrl = space.image
                ? space.image.startsWith("http")
                  ? space.image
                  : `${CONFIG.API_BASE_URL}/${space.image}`
                : "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80";

              return (
                <div
                  key={space._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Space Image & Live Badge */}
                  <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                    <img
                      src={imageUrl}
                      alt={space.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    {/* Live Slot Pill */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                          isAvailable
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {isAvailable
                          ? `${space.available_slots} / ${space.total_slots} Open`
                          : "Sold Out"}
                      </span>
                    </div>

                    {/* Price Pill */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-extrabold shadow-md">
                      ₹{space.price_per_hour}
                      <span className="text-[10px] font-normal text-slate-300">
                        /hr
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">
                          {space.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {space.landmark ? `${space.landmark}, ` : ""}
                          {space.city}
                        </span>
                      </p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {space.features && space.features.length > 0 ? (
                          space.features.slice(0, 3).map((f) => (
                            <span
                              key={f}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                            >
                              {f}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            Verified Host
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/explore?selected=${space._id}`}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                        isAvailable
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                      }`}
                    >
                      <span>{isAvailable ? "Reserve Spot" : "Fully Occupied"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. BENTO GRID ARCHITECTURE (WHY PARKME) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Engineered for Modern Drivers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The Smartest Way to Park in Any City
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Cut commute stress, avoid costly parking citations, and secure guaranteed spaces before arriving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Live Telemetry */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Live Slot Telemetry
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time slot availability syncs directly with facility gates. Never arrive at an unexpected "Lot Full" sign again.
            </p>
          </div>

          {/* Card 2: Contactless Pass */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Digital Pass & QR Gate Pass
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Show your high-contrast digital boarding pass or scan QR at the entry barrier. Zero ticket machines, zero physical cash.
            </p>
          </div>

          {/* Card 3: In-App Turn-by-Turn Navigation */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Direct In-App Navigation
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              One-click turn-by-turn guidance powered by Google Maps & Apple Maps straight into your designated parking bay.
            </p>
          </div>

          {/* Card 4 (Wide): Host & Monetize */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> Earn Passive Revenue
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Turn Your Unused Driveway Into a Monthly Revenue Machine
              </h3>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Homeowners and commercial property managers list spaces on ParkMe. Set your own hourly rates, define operating hours, and receive direct bank payouts.
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/host"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition"
              >
                <span>Become a Verified Host</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 5: Bank-Grade Security */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Bank-Grade Encryption
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Protected with Stripe 256-bit encryption. Your payment and vehicle credentials are encrypted with PCI DSS Level 1 security.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-14 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-500/25">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to park without the hassle?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">
              Join thousands of daily drivers who save 20+ minutes every commute.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/explore"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-sm shadow-lg text-center transition"
            >
              Explore Parking Map
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-800/60 hover:bg-blue-800 border border-blue-400/40 text-white font-bold text-sm text-center transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Car className="w-4 h-4" />
            </div>
            <span className="text-white font-extrabold text-lg">
              Park<span className="text-blue-500">Me</span>
            </span>
            <span className="text-xs text-slate-500 ml-2">
              © 2026 ParkMe Inc. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold">
            <Link href="/explore" className="hover:text-white transition">
              Explore Map
            </Link>
            <Link href="/host" className="hover:text-white transition">
              Host Space
            </Link>
            <Link href="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-white transition">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
