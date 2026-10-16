"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Car,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Zap,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { CONFIG, getStoredUser } from "@/lib/config";
import { ParkingSpace } from "@/components/map/ParkingMap";
import { BookingPassData } from "@/components/booking/DigitalPassModal";

interface BookingDrawerProps {
  space: ParkingSpace | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (passData: BookingPassData) => void;
}

export default function BookingDrawer({
  space,
  isOpen,
  onClose,
  onSuccess,
}: BookingDrawerProps) {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [durationHours, setDurationHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setBookingDate(`${yyyy}-${mm}-${dd}`);

    const nextHour = (today.getHours() + 1) % 24;
    setStartTime(`${String(nextHour).padStart(2, "0")}:00`);

    const savedVehicle = localStorage.getItem("lastVehicleNumber");
    if (savedVehicle) setVehicleNumber(savedVehicle);
  }, [isOpen]);

  if (!isOpen || !space) return null;

  // Calculate End Time
  const calculateEndTime = (start: string, hours: number) => {
    const [h, m] = start.split(":").map(Number);
    const endH = (h + hours) % 24;
    return `${String(endH).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
  };

  const endTime = calculateEndTime(startTime, durationHours);
  const totalPrice = durationHours * space.price_per_hour;

  // Determine day of the week
  const getDayAbbreviation = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[d.getDay()];
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = getStoredUser();
    if (!user || !user.token) {
      setError("Please sign in first to complete your reservation.");
      return;
    }

    if (!vehicleNumber.trim()) {
      setError("Please enter your vehicle plate number.");
      return;
    }

    const bookingDay = getDayAbbreviation(bookingDate);
    const availableDays = space.features || []; // or space.available_days

    setLoading(true);

    try {
      // 1. Initiate Booking via /book-slot
      const bookRes = await fetch(`${CONFIG.API_BASE_URL}/book-slot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          parking_id: space._id,
          vehicle_number: vehicleNumber.trim().toUpperCase(),
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          selected_days: [bookingDay],
        }),
      });

      const bookData = await bookRes.json();

      if (bookData.error) {
        throw new Error(bookData.error);
      }

      const bookingId =
        bookData.booking_details?._id || bookData.booking_id || bookData._id;

      if (!bookingId) {
        throw new Error("Unable to retrieve booking identifier.");
      }

      // Save vehicle for future reuse
      localStorage.setItem("lastVehicleNumber", vehicleNumber.trim().toUpperCase());

      // 2. Complete/Activate booking atomically
      const completeRes = await fetch(
        `${CONFIG.API_BASE_URL}/complete-booking/${bookingId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const completeData = await completeRes.json();
      if (completeData.error) {
        throw new Error(completeData.error);
      }

      let lat = space.location?.coordinates?.[1] || space.latitude;
      let lng = space.location?.coordinates?.[0] || space.longitude;

      onClose();
      onSuccess({
        booking_id: bookingId,
        parking_name: space.name,
        parking_address: space.address || space.city,
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        date: bookingDate,
        time_range: `${startTime} - ${endTime} (${durationHours}h)`,
        total_price: totalPrice,
        status: "active",
        lat,
        lng,
      });
    } catch (err: any) {
      setError(err.message || "Failed to finalize reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const user = getStoredUser();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
              Reserve Parking Bay
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{space.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Space Quick Metrics */}
          <div className="flex items-center justify-between p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                Hourly Tariff
              </span>
              <span className="text-xl font-extrabold text-blue-900">
                ₹{space.price_per_hour}
                <span className="text-xs font-normal text-blue-700">/hr</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Availability
              </span>
              <span className="text-sm font-bold text-emerald-600 inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {space.available_slots} / {space.total_slots} Slots Free
              </span>
            </div>
          </div>

          {!user && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You need to be signed in to reserve.</span>
              </div>
              <Link
                href="/login"
                className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700"
              >
                Sign In
              </Link>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleBooking} className="space-y-4">
            {/* Vehicle Number */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Vehicle Plate Number
              </label>
              <div className="relative flex items-center">
                <Car className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. TN 09 AB 1234"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold tracking-wide uppercase text-slate-900 focus:outline-none focus:border-blue-500 transition font-mono"
                />
              </div>
            </div>

            {/* Date & Start Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Date
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Start Time
                </label>
                <div className="relative flex items-center">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Duration Selector Buttons */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Duration (Hours)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      durationHours === h
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  Rate: ₹{space.price_per_hour} × {durationHours} hr
                  {durationHours > 1 ? "s" : ""}
                </span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Platform & Sensor Surcharge</span>
                <span className="text-emerald-400">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Total Payable</span>
                <span className="text-xl font-extrabold text-blue-400">
                  ₹{totalPrice}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !user || space.available_slots <= 0}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Confirm Reservation (₹{totalPrice})</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
