"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Clock,
  Car,
  MapPin,
  QrCode,
  Navigation,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { CONFIG, getStoredUser } from "@/lib/config";
import DigitalPassModal, { BookingPassData } from "@/components/booking/DigitalPassModal";

interface BookingItem {
  booking_id: string;
  parking_name: string;
  address?: string;
  vehicle: string;
  time: string;
  amount?: number;
  status: string;
  image?: string;
}

interface DashboardData {
  summary: {
    total_bookings: number;
    cancelled_bookings: number;
    pending_bookings: number;
    total_spent: number;
  };
  active_booking: BookingItem[];
  history: BookingItem[];
}

export default function BookingsPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passData, setPassData] = useState<BookingPassData | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    const user = getStoredUser();
    if (!user || !user.token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/user-booking-dashboard`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Unable to retrieve booking records");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation? The slot will be released back to other drivers.")) {
      return;
    }

    const user = getStoredUser();
    if (!user?.token) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/cancel-booking/${bookingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail || json.error || "Failed to cancel booking");
      }

      alert("Reservation cancelled successfully.");
      await fetchBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const openPass = (booking: BookingItem) => {
    setPassData({
      booking_id: booking.booking_id,
      parking_name: booking.parking_name,
      parking_address: booking.address,
      vehicle_number: booking.vehicle,
      time_range: booking.time,
      total_price: booking.amount || 0,
      status: booking.status,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            My Parking Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your live gate boarding passes, GPS routing, and past receipt history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/explore"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
          >
            <span>Book New Spot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Reservations
            </span>
            <p className="text-2xl font-extrabold text-slate-900">
              {data.summary.total_bookings}
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Active Passes
            </span>
            <p className="text-2xl font-extrabold text-blue-600">
              {data.active_booking?.length || 0}
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Total Spent
            </span>
            <p className="text-2xl font-extrabold text-emerald-600">
              ₹{data.summary.total_spent}
            </p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cancelled
            </span>
            <p className="text-2xl font-extrabold text-slate-500">
              {data.summary.cancelled_bookings}
            </p>
          </div>
        </div>
      )}

      {/* Active Bookings Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-lg font-extrabold text-slate-900">
            Active Reserved Passes ({data?.active_booking?.length || 0})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-slate-200 animate-pulse space-y-3"
              >
                <div className="h-5 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : !data?.active_booking || data.active_booking.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
            <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No active passes</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You don't have any parking spots reserved right now. Search the map to secure a spot.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Explore Parking Spots
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.active_booking.map((booking) => (
              <div
                key={booking.booking_id}
                className="bg-white rounded-3xl border border-blue-200/80 shadow-md p-6 space-y-5 relative overflow-hidden"
              >
                {/* Accent strip */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Active Pass
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                      {booking.parking_name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{booking.address || "Chennai"}</span>
                    </p>
                  </div>
                </div>

                {/* Details Capsule */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Vehicle Plate
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {booking.vehicle}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Window
                    </span>
                    <span className="font-semibold text-slate-700">{booking.time}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => openPass(booking)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Boarding Pass & QR</span>
                  </button>

                  <button
                    onClick={() => handleCancelBooking(booking.booking_id)}
                    disabled={cancellingId === booking.booking_id}
                    title="Cancel Booking"
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
      <section className="space-y-4 pt-6">
        <h2 className="text-lg font-extrabold text-slate-900">
          Booking History & Receipts
        </h2>

        {!data?.history || data.history.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-xs text-slate-400">
            No previous reservations found.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Parking Facility</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Schedule</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.history.map((h) => (
                    <tr key={h.booking_id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {h.parking_name}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                        {h.vehicle}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{h.time}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{h.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            h.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : h.status === "cancelled"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Digital Pass Modal */}
      <DigitalPassModal passData={passData} onClose={() => setPassData(null)} />
    </div>
  );
}
