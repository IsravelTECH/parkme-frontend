"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  TrendingUp,
  Car,
  MapPin,
  Trash2,
  Upload,
  Navigation,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import { CONFIG, getStoredUser } from "@/lib/config";

interface HostSpace {
  id: string;
  name: string;
  city: string;
  landmark: string;
  address: string;
  price: number;
  total_slots: number;
  available_slots: number;
  active_bookings: number;
  earnings: number;
  image?: string;
  features?: string[];
  available_days?: string[];
}

interface HostDashboardData {
  total_parkings: number;
  total_slots: number;
  active_bookings: number;
  total_earnings: number;
  parkings: HostSpace[];
}

export default function HostPage() {
  const router = useRouter();
  const [data, setData] = useState<HostDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [city, setCity] = useState("Chennai");
  const [landmark, setLandmark] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("13.0827");
  const [lng, setLng] = useState("80.2707");
  const [pricePerHour, setPricePerHour] = useState("40");
  const [totalSlots, setTotalSlots] = useState("10");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "CCTV",
    "Security Guard",
  ]);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchHostData = async () => {
    const user = getStoredUser();
    if (!user || !user.token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/my-dashboard`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load host dashboard");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load host data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      (err) => alert("Could not fetch location: " + err.message)
    );
  };

  const handleToggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddParking = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getStoredUser();
    if (!user?.token) return;

    if (!imageFile) {
      alert("Please upload a photo of your parking space.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("landmark", landmark);
      formData.append("address", address);
      formData.append("lat", lat);
      formData.append("lng", lng);
      formData.append("price_per_hour", pricePerHour);
      formData.append("total_slots", totalSlots);
      formData.append("available_slots", totalSlots);

      selectedFeatures.forEach((f) => formData.append("features", f));
      selectedDays.forEach((d) => formData.append("available_days", d));
      formData.append("image", imageFile);

      const res = await fetch(`${CONFIG.API_BASE_URL}/add-parking`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.detail || resJson.error || "Failed to create listing");
      }

      alert("Parking space listed successfully!");
      setShowAddModal(false);
      // Reset form
      setName("");
      setLandmark("");
      setAddress("");
      setImageFile(null);
      setImagePreview(null);
      await fetchHostData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm("Are you sure you want to remove this parking space?")) return;

    const user = getStoredUser();
    if (!user?.token) return;

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/delete-parking/${spaceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.detail || "Failed to delete parking space");
      }

      alert("Space removed successfully.");
      await fetchHostData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Host & Monetization Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your driveways, view real-time occupancy rates, and monitor payouts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>List New Space</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Listed Facilities
          </span>
          <p className="text-2xl font-extrabold text-slate-900">
            {data?.total_parkings || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Total Slots Managed
          </span>
          <p className="text-2xl font-extrabold text-blue-600">
            {data?.total_slots || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Active Vehicles Parked
          </span>
          <p className="text-2xl font-extrabold text-emerald-600">
            {data?.active_bookings || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            Total Host Revenue
          </span>
          <p className="text-2xl font-extrabold text-indigo-600">
            ₹{data?.total_earnings || 0}
          </p>
        </div>
      </div>

      {/* My Listings Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">
          Your Listed Parking Properties
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-3"
              >
                <div className="w-full h-40 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : !data?.parkings || data.parkings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No properties listed yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start earning by publishing your empty parking space or commercial driveway.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>List Space Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.parkings.map((space) => {
              const imageUrl = space.image
                ? space.image.startsWith("http")
                  ? space.image
                  : `${CONFIG.API_BASE_URL}/${space.image}`
                : "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80";

              return (
                <div
                  key={space.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={space.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                      {space.available_slots} / {space.total_slots} Slots Free
                    </div>
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-xl text-xs font-extrabold shadow">
                      ₹{space.price}/hr
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{space.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{space.landmark || space.city}</span>
                      </p>

                      {/* Revenue pill */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Earned:</span>
                        <span className="font-extrabold text-emerald-600">
                          ₹{space.earnings}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleDeleteSpace(space.id)}
                        className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Listing</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Parking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">
                  List a New Parking Space
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish your location and receive guaranteed reservations
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddParking} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Space Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nexus Vijaya Mall Basement Parking"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Landmark
                  </label>
                  <input
                    type="text"
                    required
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near metro station"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Full Address
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="100 Feet Rd, Vadapalani, Chennai"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Coordinates with GPS Pin */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Latitude
                  </label>
                  <input
                    type="text"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Longitude
                  </label>
                  <input
                    type="text"
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-blue-600 flex items-center justify-center gap-1.5 transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Detect My Current Coordinates</span>
              </button>

              {/* Price & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Price Per Hour (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Total Slots
                  </label>
                  <input
                    type="number"
                    required
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Features Checkboxes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Features & Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {["CCTV", "Security Guard", "Covered", "EV Charging", "24/7 Access"].map(
                    (f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => handleToggleFeature(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          selectedFeatures.includes(f)
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {f}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Operating Days */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Operating Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        selectedDays.includes(day)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Upload Space Photo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Publish Space to ParkMe Network</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
