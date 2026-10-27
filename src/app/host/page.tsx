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
  Pencil,
  Image as ImageIcon,
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
  lat?: number;
  lng?: number;
}

interface HostDashboardData {
  total_parkings: number;
  total_slots: number;
  active_bookings: number;
  total_earnings: number;
  parkings: HostSpace[];
}

const IMAGE_PRESETS = [
  {
    title: "Commercial Bay",
    url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Covered Deck",
    url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Tech Park MLCP",
    url: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Open Paved Lot",
    url: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HostPage() {
  const router = useRouter();
  const [data, setData] = useState<HostDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState<HostSpace | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Form States
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
    "Sun",
  ]);
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0].url);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(IMAGE_PRESETS[0].url);

  // Edit Form States
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("Chennai");
  const [editLandmark, setEditLandmark] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPrice, setEditPrice] = useState("40");
  const [editSlots, setEditSlots] = useState("10");
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [editDays, setEditDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

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

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
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

  const handleToggleEditFeature = (feat: string) => {
    setEditFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleToggleEditDay = (day: string) => {
    setEditDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleOpenEditModal = (space: HostSpace) => {
    setEditingSpace(space);
    setEditName(space.name || "");
    setEditCity(space.city || "Chennai");
    setEditLandmark(space.landmark || "");
    setEditAddress(space.address || "");
    setEditPrice((space.price || 40).toString());
    setEditSlots((space.total_slots || 10).toString());
    setEditFeatures(space.features || ["CCTV", "Security Guard"]);
    setEditDays(space.available_days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    const img = space.image || IMAGE_PRESETS[0].url;
    setEditImageUrl(img);
    setEditImagePreview(img.startsWith("http") ? img : `${CONFIG.API_BASE_URL}/${img}`);
    setEditImageFile(null);
    setShowEditModal(true);
  };

  const handleAddParking = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getStoredUser();
    if (!user?.token) return;

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
      if (imageUrl && imageUrl.trim()) {
        formData.append("image_url", imageUrl.trim());
      }

      selectedFeatures.forEach((f) => formData.append("features", f));
      selectedDays.forEach((d) => formData.append("available_days", d));

      if (imageFile) {
        formData.append("image", imageFile);
      }

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
      await fetchHostData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateParking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpace) return;
    const user = getStoredUser();
    if (!user?.token) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("city", editCity);
      formData.append("landmark", editLandmark);
      formData.append("address", editAddress);
      formData.append("slots", editSlots);
      formData.append("price_per_hour", editPrice);

      if (editImageUrl && editImageUrl.trim()) {
        formData.append("image_url", editImageUrl.trim());
      }
      if (editImageFile) {
        formData.append("image", editImageFile);
      }

      editFeatures.forEach((f) => formData.append("features", f));
      editDays.forEach((d) => formData.append("days", d));

      const res = await fetch(`${CONFIG.API_BASE_URL}/update-parking/${editingSpace.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.detail || resJson.error || "Failed to update space");
      }

      alert("Parking space updated successfully!");
      setShowEditModal(false);
      setEditingSpace(null);
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
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition"
                >
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={space.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                          {space.name}
                        </h3>
                      </div>
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

                    {/* Actions: Edit & Remove Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(space)}
                        className="flex-1 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit Slot</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSpace(space.id)}
                        className="py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        title="Remove Space"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= EDIT PARKING MODAL ================= */}
      {showEditModal && editingSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-blue-600" />
                  <span>Edit Parking Space</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update slot capacity, pricing, amenities, and photo
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSpace(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateParking} className="space-y-4">
              {/* Photo Preview & Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Property Photo
                </label>
                {editImagePreview && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {/* Photo Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setEditImageUrl(preset.url);
                        setEditImagePreview(preset.url);
                        setEditImageFile(null);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 shrink-0 ${
                        editImageUrl === preset.url
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
                {/* Custom Photo URL */}
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => {
                    setEditImageUrl(e.target.value);
                    setEditImagePreview(e.target.value);
                  }}
                  placeholder="Or enter custom image URL..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Space Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* City and Landmark */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
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
                    value={editLandmark}
                    onChange={(e) => setEditLandmark(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Street Address
                </label>
                <textarea
                  required
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Price & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Hourly Tariff (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
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
                    value={editSlots}
                    onChange={(e) => setEditSlots(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Amenities & Security
                </label>
                <div className="flex flex-wrap gap-2">
                  {["CCTV", "Security Guard", "Covered", "EV Charging", "24/7 Access", "Automated Lift"].map(
                    (f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => handleToggleEditFeature(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          editFeatures.includes(f)
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

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD PARKING MODAL ================= */}
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
              {/* Photo Preview & Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Property Photo
                </label>
                {imagePreview && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {/* Photo Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setImagePreview(preset.url);
                        setImageFile(null);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 shrink-0 ${
                        imageUrl === preset.url
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
                {/* Custom Photo URL */}
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="Or enter custom image URL..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

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
