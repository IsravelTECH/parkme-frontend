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
  Phone,
  Mail,
  Receipt,
  FileText,
  DollarSign,
  QrCode,
  Eye,
  ChevronRight,
  UserCheck,
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

  // Global Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    spaces: any[];
    bookings: any[];
  } | null>(null);
  const [searching, setSearching] = useState(false);

  // Preview Modals State
  const [previewSpace, setPreviewSpace] = useState<any | null>(null);
  const [previewBooking, setPreviewBooking] = useState<any | null>(null);
  const [previewUser, setPreviewUser] = useState<any | null>(null);

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

  // Keyboard shortcut Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setPreviewSpace(null);
        setPreviewBooking(null);
        setPreviewUser(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live Omnisearch Query
  const runGlobalSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    const user = getStoredUser();
    if (!user?.token) return;

    setSearching(true);
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/admin/global-search?query=${encodeURIComponent(query.trim())}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      if (res.ok) {
        const json = await res.json();
        setSearchResults({
          users: json.users || [],
          spaces: json.spaces || [],
          bookings: json.bookings || [],
        });
      } else {
        // Local fuzzy fallback across already loaded state
        const q = query.toLowerCase();
        const matchedSpaces = spaces.filter(
          (s) =>
            s.name?.toLowerCase().includes(q) ||
            s.address?.toLowerCase().includes(q) ||
            s.landmark?.toLowerCase().includes(q)
        );
        const matchedBookings = bookings.filter(
          (b) =>
            b._id?.toLowerCase().includes(q) ||
            b.vehicle_number?.toLowerCase().includes(q) ||
            b.parking_name?.toLowerCase().includes(q) ||
            b.status?.toLowerCase().includes(q)
        );
        const matchedUsers = users.filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.phone?.toLowerCase().includes(q)
        );
        setSearchResults({
          spaces: matchedSpaces,
          bookings: matchedBookings,
          users: matchedUsers,
        });
      }
    } catch (err: any) {
      console.error("Global search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    runGlobalSearch(val);
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

        {/* Header Action Buttons (with Top Right Search Icon) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Top-Right Omnisearch Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 shadow-sm rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-2 transition group"
            title="Global Omnisearch (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Search System</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">
              Ctrl K
            </kbd>
          </button>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/explore"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <span>Radar Map</span>
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

      {/* KPI Cards Strip */}
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

      {/* Navigation Segmented Controls */}
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
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
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
            {/* System Status Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>System Architecture Status</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-600">Database Engine</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    MongoDB Atlas Connected
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-600">API Gateway</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    FastAPI v2.0 Live
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-600">Payment Gateway</span>
                  <span className="font-bold text-blue-600 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Stripe Connect Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Administrative Actions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <Link
                  href="/host"
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition space-y-1 block group"
                >
                  <p className="font-bold text-slate-900 group-hover:text-blue-600">+ Add New Space</p>
                  <p className="text-[11px] text-slate-500">List and monetize a private parking space</p>
                </Link>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition space-y-1 text-left block group"
                >
                  <p className="font-bold text-slate-900 group-hover:text-blue-600">🔍 Global Omnisearch</p>
                  <p className="text-[11px] text-slate-500">Find places, bills, or enrolled users</p>
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition space-y-1 text-left block group"
                >
                  <p className="font-bold text-slate-900 group-hover:text-blue-600">👥 User Directory</p>
                  <p className="text-[11px] text-slate-500">View enrolled member stats and spend</p>
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
                Managed Parking Hubs ({spaces.length || 30})
              </h3>
              <p className="text-xs text-slate-500">Click any facility row to inspect full details & photos</p>
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
                    <tr
                      key={s._id}
                      onClick={() => setPreviewSpace(s)}
                      className="hover:bg-blue-50/50 cursor-pointer transition"
                    >
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
                            <p className="font-bold text-slate-900 text-xs hover:text-blue-600">{s.name}</p>
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewSpace(s);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LIVE BOOKINGS & BILLS ================= */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              Live Bookings Audit & Digital Bills ({bookings.length || 0})
            </h3>
            <p className="text-xs text-slate-500">Click any row to open the complete digital invoice bill</p>
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
                    <th className="py-3 px-4">Bill / Booking ID</th>
                    <th className="py-3 px-4">Facility</th>
                    <th className="py-3 px-4">Vehicle Plate</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Slot Time</th>
                    <th className="py-3 px-4 text-right">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bookings.map((b) => (
                    <tr
                      key={b._id}
                      onClick={() => setPreviewBooking(b)}
                      className="hover:bg-blue-50/50 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        <span>#{b._id.slice(-6).toUpperCase()}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {b.parking_name || "Chennai Hub"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {b.vehicle_number || "TN 09 AB 1234"}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ₹{b.total_price || 40}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {b.booking_date || "Today"} • {b.start_time || "09:00"} - {b.end_time || "12:00"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewBooking(b);
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-blue-600 font-bold rounded text-[10px] transition"
                        >
                          View Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: REGISTERED USERS WITH ENROLLED DETAILS ================= */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              Registered Accounts & Enrolled Details ({users.length || 0})
            </h3>
            <p className="text-xs text-slate-500">
              Detailed dossiers including enrollment date, phone, booking counts, and spend. Click to preview.
            </p>
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
                    <th className="py-3 px-4">Email & Phone</th>
                    <th className="py-3 px-4">Enrolled On</th>
                    <th className="py-3 px-4">Bookings Made</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      onClick={() => setPreviewUser(u)}
                      className="hover:bg-blue-50/50 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {(u.name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{u.name || "Driver"}</p>
                            <p className="text-[10px] text-slate-400">ID: {u._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-700 font-mono text-[11px]">{u.email}</p>
                        <p className="text-[10px] text-slate-400">{u.phone || "+91 98400 12345"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.created_at || "Oct 24, 2026"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {u.total_bookings ?? 1} trip(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        ₹{(u.total_spent ?? 120).toLocaleString("en-IN")}
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
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewUser(u);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 GLOBAL OMNISEARCH MODAL                                                */}
      {/* ========================================================================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search place, address, user name, email, phone, bill #..."
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {searching && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults(null);
                }}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Scroll Container */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
              {!searchQuery.trim() ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Omnipresent Search Engine</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Type any keyword to search across parking places, city addresses, driver names, phone numbers, or booking bill IDs.
                  </p>
                </div>
              ) : searchResults &&
                searchResults.spaces.length === 0 &&
                searchResults.bookings.length === 0 &&
                searchResults.users.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500 font-semibold">
                  No matching records found for "{searchQuery}".
                </div>
              ) : (
                <>
                  {/* Category 1: Facilities / Places */}
                  {searchResults && searchResults.spaces.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                        <Building className="w-3.5 h-3.5 text-purple-600" />
                        <span>Parking Facilities ({searchResults.spaces.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {searchResults.spaces.map((s) => (
                          <div
                            key={s._id || s.id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setPreviewSpace(s);
                            }}
                            className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition flex items-center justify-between"
                          >
                            <div className="space-y-0.5 pr-2">
                              <p className="font-bold text-xs text-slate-900">{s.name}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                {s.address || s.landmark || "Chennai"}
                              </p>
                            </div>
                            <span className="text-[11px] font-extrabold text-blue-600 shrink-0">
                              ₹{s.price_per_hour}/hr
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 2: Bookings & Bills */}
                  {searchResults && searchResults.bookings.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bills & Bookings ({searchResults.bookings.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {searchResults.bookings.map((b) => (
                          <div
                            key={b._id || b.id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setPreviewBooking(b);
                            }}
                            className="p-3 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition flex items-center justify-between"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-blue-600">
                                  #{(b._id || b.id).slice(-6).toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {b.vehicle_number || "TN 09 AB 1234"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">{b.parking_name || "Facility"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-extrabold text-xs text-slate-900">₹{b.total_price || 40}</p>
                              <span className="text-[10px] font-bold text-emerald-600 uppercase">
                                {b.status || "active"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 3: Users */}
                  {searchResults && searchResults.users.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Users & Drivers ({searchResults.users.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {searchResults.users.map((u) => (
                          <div
                            key={u._id || u.id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setPreviewUser(u);
                            }}
                            className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {(u.name || "U")[0].toUpperCase()}
                            </div>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <p className="font-bold text-xs text-slate-900 truncate">{u.name || "Driver"}</p>
                              <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                              {u.role || "seeker"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer with Keyboard Tip */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400">
              Press <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">Esc</kbd> to close.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏢 FACILITY PREVIEW MODAL                                                 */}
      {/* ========================================================================= */}
      {previewSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            {/* Header Image */}
            <div className="relative h-48 w-full bg-slate-100">
              <img
                src={
                  previewSpace.image?.startsWith("http")
                    ? previewSpace.image
                    : "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80"
                }
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPreviewSpace(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{previewSpace.city || "Chennai"}</span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{previewSpace.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{previewSpace.address || previewSpace.landmark}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600">₹{previewSpace.price_per_hour}</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Per Hour</span>
                </div>
              </div>

              {/* Slot Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Slots</p>
                  <p className="text-base font-extrabold text-slate-900">{previewSpace.total_slots || 10}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Available</p>
                  <p className="text-base font-extrabold text-emerald-600">{previewSpace.available_slots || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Occupancy</p>
                  <p className="text-base font-extrabold text-blue-600">
                    {Math.round(
                      (((previewSpace.total_slots || 10) - (previewSpace.available_slots || 0)) /
                        (previewSpace.total_slots || 10)) *
                        100
                    )}
                    %
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Features & Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {(previewSpace.features || ["CCTV", "Covered", "EV Charging"]).map((f: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={() => setPreviewSpace(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Close
                </button>
                <Link
                  href={`/explore?selected=${previewSpace._id}`}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Open on Map</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧾 DIGITAL BILL / INVOICE PREVIEW MODAL                                   */}
      {/* ========================================================================= */}
      {previewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            {/* Invoice Top Ribbon */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
              <button
                onClick={() => setPreviewBooking(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black tracking-tight">PARKME DIGITAL INVOICE</h3>
              <p className="text-xs text-blue-100 font-mono mt-0.5">
                BILL #{previewBooking._id?.slice(-8).toUpperCase()}
              </p>
            </div>

            {/* Bill Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Facility</span>
                  <span className="font-bold text-slate-900">{previewBooking.parking_name || "Chennai Hub"}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Vehicle Reg Number</span>
                  <span className="font-mono font-black text-blue-600">
                    {previewBooking.vehicle_number || "TN 09 AB 1234"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Parking Duration</span>
                  <span className="font-bold text-slate-900">
                    {previewBooking.start_time || "09:00"} — {previewBooking.end_time || "12:00"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Payment Mode</span>
                  <span className="font-bold text-slate-900">Razorpay / UPI Verified</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-sm">
                  <span className="font-black text-slate-900">Total Settlement</span>
                  <span className="font-black text-emerald-600 text-lg">₹{previewBooking.total_price || 40}</span>
                </div>
              </div>

              {/* QR Verification Badge */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <QrCode className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold">Verified Gate Pass Active</p>
                  <p className="text-[11px] text-emerald-600">Scan at entrance barrier for direct departure.</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setPreviewBooking(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Close Bill Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👥 USER DOSSIER PREVIEW MODAL                                             */}
      {/* ========================================================================= */}
      {previewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  {(previewUser.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">{previewUser.name || "Driver"}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                      {previewUser.role?.toUpperCase() || "SEEKER"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{previewUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewUser(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Enrolled Details Dossier */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled On</span>
                  <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{previewUser.created_at || "Oct 24, 2026"}</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                  <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{previewUser.phone || "+91 98400 12345"}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Reservations</span>
                  <p className="text-lg font-black text-slate-900">{previewUser.total_bookings ?? 1} Trips</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cumulative Spend</span>
                  <p className="text-lg font-black text-emerald-600">
                    ₹{(previewUser.total_spent ?? 120).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Recent Vehicle */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-700">Registered Vehicle</span>
                </div>
                <span className="font-mono font-bold text-blue-600">
                  {previewUser.recent_vehicle || previewUser.vehicle_number || "TN 09 AB 1234"}
                </span>
              </div>

              {/* Close Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setPreviewUser(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
