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
} from "lucide-react";
import { CONFIG, getStoredUser } from "@/lib/config";

interface AdminDashboardStats {
  total_users: number;
  total_bookings: number;
  total_revenue: number;
  total_spaces: number;
  occupancy_rate: number;
  active_bookings: number;
  recent_bookings?: Array<{
    id: string;
    user_name: string;
    parking_name: string;
    amount: number;
    status: string;
    time: string;
  }>;
  top_locations?: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);

  const fetchStats = async () => {
    const user = getStoredUser();
    if (!user || user.role !== "owner") {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/admin-dashboard`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          throw new Error("Access restricted to platform administrators.");
        }
        throw new Error("Failed to load admin metrics");
      }

      const json = await res.json();
      setStats(json);
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
        `${CONFIG.API_BASE_URL}/admin/global-search?q=${encodeURIComponent(
          searchQuery.trim()
        )}`,
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

  if (user && user.role !== "owner") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Admin Access Required
        </h2>
        <p className="text-sm text-slate-500 max-w-md">
          This portal is restricted to system administrators and lot owners. Please log in with admin credentials (e.g. isravel@gmail.com).
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>EXECUTIVE COMMAND PORTAL</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Platform Operations & Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time urban parking telemetry, revenue settlement, and space utilization across Chennai.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Total Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
            ₹{stats?.total_revenue?.toLocaleString("en-IN") || 0}
          </p>
          <span className="text-[10px] text-slate-400">Aggregated payments</span>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Occupancy Rate
            </span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 tracking-tight">
            {stats?.occupancy_rate || 0}%
          </p>
          <span className="text-[10px] text-slate-400">Real-time slot load</span>
        </div>

        {/* Active Reservations */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Active Bookings
            </span>
            <Car className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
            {stats?.active_bookings || 0}
          </p>
          <span className="text-[10px] text-slate-400">Currently in bays</span>
        </div>

        {/* Managed Spaces */}
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Parking Facilities
            </span>
            <Building className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 tracking-tight">
            {stats?.total_spaces || 0}
          </p>
          <span className="text-[10px] text-slate-400">Across {stats?.total_users || 0} accounts</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="bg-slate-800/60 p-4 rounded-3xl border border-slate-700/60">
        <form onSubmit={handleGlobalSearch} className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-900 rounded-2xl border border-slate-700 focus-within:border-blue-500 transition">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by driver name, vehicle plate, or parking facility name..."
              className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl transition disabled:opacity-50"
          >
            {searching ? "Searching..." : "Global Search"}
          </button>
        </form>

        {searchResults && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase">
              Search Results ({searchResults.length})
            </h4>
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-500">No records found matching query.</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">
                        {item.name || item.vehicle_number || item.parking_name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.email || item.address || item.booking_date || "Record"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300">
                      {item.type || "Match"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Bookings Feed */}
      <div className="bg-slate-800/60 rounded-3xl border border-slate-700/60 p-6 space-y-4">
        <h3 className="text-lg font-extrabold text-white">
          Live Transaction Feed & Reservations
        </h3>

        {!stats?.recent_bookings || stats.recent_bookings.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No recent bookings reported by telemetry daemon.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700 pb-2">
                <tr>
                  <th className="py-3 px-4">Transaction / ID</th>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Time Window</th>
                  <th className="py-3 px-4">Settlement</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.recent_bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      {booking.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {booking.parking_name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{booking.time}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-400">
                      ₹{booking.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          booking.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : booking.status === "completed"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
