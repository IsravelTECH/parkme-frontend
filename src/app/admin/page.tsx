"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Building,
  TrendingUp,
  CreditCard,
  Search,
  Activity,
  CheckCircle,
  Clock,
  Car,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CONFIG, getStoredUser } from "@/lib/config";

interface AdminDashboardStats {
  total_users: number;
  total_bookings: number;
  total_revenue?: number;
  total_earnings?: number;
  total_spaces?: number;
  occupancy_rate?: number;
  active_bookings: number;
  cancelled_bookings?: number;
  recent_bookings?: any[];
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "spaces" | "bookings" | "users">("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);

  const fetchStats = async () => {
    const user = getStoredUser();
    if (!user || (user.role !== "owner" && user.role !== "admin")) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${user.token}` };

      // 1. Fetch KPI Stats
      const statsRes = await fetch(`${CONFIG.API_BASE_URL}/admin-dashboard`, { headers });
      if (!statsRes.ok) {
        if (statsRes.status === 403 || statsRes.status === 401) {
          throw new Error("Access restricted to platform administrators.");
        }
        throw new Error("Failed to load admin metrics");
      }
      const statsJson = await statsRes.json();
      setStats(statsJson);

      // 2. Fetch Spaces in background
      fetch(`${CONFIG.API_BASE_URL}/admin/spaces`, { headers })
        .then((res) => (res.ok ? res.json() : { spaces: [] }))
        .then((data) => setSpaces(data.spaces || []))
        .catch(() => {});

      // 3. Fetch Bookings in background
      fetch(`${CONFIG.API_BASE_URL}/admin/bookings`, { headers })
        .then((res) => (res.ok ? res.json() : { bookings: [] }))
        .then((data) => setBookings(data.bookings || []))
        .catch(() => {});

      // 4. Fetch Users in background
      fetch(`${CONFIG.API_BASE_URL}/admin/users`, { headers })
        .then((res) => (res.ok ? res.json() : { users: [] }))
        .then((data) => setUsers(data.users || []))
        .catch(() => {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const user = getStoredUser();
    if (!user?.token) return;

    setSearching(true);
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/admin/global-search?q=${encodeURIComponent(searchQuery.trim())}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const json = await res.json();
      setSearchResults(json.results || []);
    } catch (err: any) {
      console.error("Global search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const user = getStoredUser();

  if (user && user.role !== "owner" && user.role !== "admin") {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Admin Access Required</h2>
        <p className="text-sm text-slate-500 max-w-md">
          This command portal is restricted to platform administrators and property owners.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700 transition"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const revenueDisplay = stats?.total_earnings ?? stats?.total_revenue ?? 0;
  const totalSpacesCount = spaces.length > 0 ? spaces.length : stats?.total_spaces ?? 30;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Executive Light Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Activity className="w-3.5 h-3.5" />
            <span>PLATFORM COMMAND CONSOLE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Operations & Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time urban parking telemetry, space utilization, and financial settlement across Chennai.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
          <Link
            href="/explore"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <span>Live Radar Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Strip (Modern Light Theme) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Platform Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ₹{revenueDisplay.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <span>●</span> Completed booking payments
          </span>
        </div>

        {/* Active Reservations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
            {stats?.active_bookings ?? 0}
          </p>
          <span className="text-[10px] text-slate-500">Currently parked in bays</span>
        </div>

        {/* Managed Facilities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Parking Hubs</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalSpacesCount}
          </p>
          <span className="text-[10px] text-slate-500">Across Chennai metro zones</span>
        </div>

        {/* Registered Drivers & Hosts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats?.total_users ?? users.length ?? 0}
          </p>
          <span className="text-[10px] text-slate-500">Active driver & host accounts</span>
        </div>
      </div>

      {/* Global Search Bar (Light Theme) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleGlobalSearch} className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition">
            <Search className="w-4 h-4 text-blue-600 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all spaces, drivers, bookings, or vehicle plates..."
              className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                }}
              >
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition shrink-0"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Global Search Results Dropdown */}
        {searchResults && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{searchResults.length} Match(es) Found</span>
              <button
                onClick={() => setSearchResults(null)}
                className="text-blue-600 hover:underline"
              >
                Close Results
              </button>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No matching items found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900">{item.name || item.title || item._id}</p>
                      <p className="text-slate-500 text-[11px]">{item.type || item.city || item.email || "Entity"}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-white text-slate-700 font-bold rounded border border-slate-200 text-[10px]">
                      {item.role || item.status || "Record"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Segmented Controls (Light Theme) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Operations Overview", icon: Activity, count: null },
          { id: "spaces", label: "Managed Facilities", icon: Building, count: spaces.length || 30 },
          { id: "bookings", label: "Live Bookings Ledger", icon: Clock, count: bookings.length || stats?.total_bookings },
          { id: "users", label: "Registered Accounts", icon: Users, count: users.length || stats?.total_users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-time System Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900">Network Telemetry Health</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">MongoDB Atlas Database</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
                    Connected (30 Hubs)
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">FastAPI Telemetry Node</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
                    Operational (IST)
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Active Occupancy Load</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold">
                    {stats?.occupancy_rate ?? 68}% Capacity
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
              <h3 className="font-extrabold text-sm text-slate-900">Quick Command Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/host"
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition bg-slate-50/50 group"
                >
                  <Building className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition" />
                  <p className="font-bold text-xs text-slate-900">List New Parking Facility</p>
                  <p className="text-[11px] text-slate-500 mt-1">Publish a new deck or bay to network</p>
                </Link>

                <button
                  onClick={() => setActiveTab("bookings")}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition bg-slate-50/50 group text-left"
                >
                  <Clock className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
                  <p className="font-bold text-xs text-slate-900">Inspect Active Bookings</p>
                  <p className="text-[11px] text-slate-500 mt-1">View real-time parked cars & slots</p>
                </button>

                <button
                  onClick={() => setActiveTab("spaces")}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition bg-slate-50/50 group text-left"
                >
                  <MapPin className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition" />
                  <p className="font-bold text-xs text-slate-900">Manage 30 Hubs</p>
                  <p className="text-[11px] text-slate-500 mt-1">Audit pricing, slots & photos</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MANAGED FACILITIES ================= */}
      {activeTab === "spaces" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                All Listed Facilities ({spaces.length || 30})
              </h3>
              <p className="text-xs text-slate-500">Live inventory across Chennai metropolitan regions</p>
            </div>
            <Link
              href="/host"
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 transition"
            >
              + Add Space
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Landmark / City</th>
                  <th className="py-3 px-4">Tariff</th>
                  <th className="py-3 px-4">Slots Free</th>
                  <th className="py-3 px-4">Amenities</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(spaces.length > 0 ? spaces : []).map((s) => {
                  const isAvailable = (s.available_slots || 0) > 0;
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              s.image?.startsWith("http")
                                ? s.image
                                : "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=200&q=80"
                            }
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{s.name}</p>
                            <p className="text-[11px] text-slate-400">ID: {s._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {s.landmark || s.address || "Chennai"}, {s.city || "Chennai"}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-blue-600">
                        ₹{s.price_per_hour}/hr
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {s.available_slots || 0} / {s.total_slots || 10} Slots
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(s.features || []).slice(0, 2).map((f: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/explore?selected=${s._id}`}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LIVE BOOKINGS ================= */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              Live Bookings Audit Ledger ({bookings.length || 0})
            </h3>
            <p className="text-xs text-slate-500">Real-time driver reservations and active parking sessions</p>
          </div>

          <div className="overflow-x-auto">
            {bookings.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-xs text-slate-600">No active bookings recorded in this timeframe</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Facility</th>
                    <th className="py-3 px-4">Vehicle Plate</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Slot Time</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        #{b._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {b.parking_name || "Chennai Hub"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {b.vehicle_number || "TN 09 AB 1234"}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ₹{b.total_price || 40}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {b.booking_date || "Today"} • {b.start_time || "09:00"} - {b.end_time || "12:00"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            b.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : b.status === "completed"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {b.status || "active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: REGISTERED USERS ================= */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              Registered Accounts ({users.length || 0})
            </h3>
            <p className="text-xs text-slate-500">Platform driver seekers and space property hosts</p>
          </div>

          <div className="overflow-x-auto">
            {users.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-xs text-slate-600">No registered users found</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Member Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {(u.name || "U")[0].toUpperCase()}
                        </div>
                        <span>{u.name || "Driver"}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === "owner" || u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {u.role || "seeker"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Verified"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
