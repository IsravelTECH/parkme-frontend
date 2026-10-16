"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  QrCode,
  MapPin,
  Clock,
  Car,
  Navigation,
  CheckCircle2,
  Share2,
  Download,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface BookingPassData {
  booking_id: string;
  parking_name: string;
  parking_address?: string;
  vehicle_number: string;
  date?: string;
  time_range?: string;
  total_price: number;
  status: string;
  lat?: number;
  lng?: number;
}

interface DigitalPassModalProps {
  passData: BookingPassData | null;
  onClose: () => void;
}

export default function DigitalPassModal({
  passData,
  onClose,
}: DigitalPassModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (passData) {
      // Trigger festive celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#2563eb", "#10b981", "#6366f1", "#f59e0b"],
      });
    }
  }, [passData]);

  if (!passData) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `ParkMe Pass - ${passData.parking_name}`,
          text: `Parking spot confirmed at ${passData.parking_name} for vehicle ${passData.vehicle_number}. Booking ID: ${passData.booking_id}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `ParkMe Pass: ${passData.parking_name} | ID: ${passData.booking_id} | Vehicle: ${passData.vehicle_number}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNavigate = () => {
    if (passData.lat && passData.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${passData.lat},${passData.lng}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          passData.parking_name + " " + (passData.parking_address || "")
        )}`,
        "_blank"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 text-white rounded-3xl border border-slate-700/80 shadow-2xl shadow-black/80 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pass Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center space-y-1 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED & ACTIVE</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {passData.parking_name}
          </h2>
          <p className="text-xs text-blue-100 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 text-blue-200" />
            <span className="truncate max-w-[240px]">
              {passData.parking_address || "Chennai, India"}
            </span>
          </p>
        </div>

        {/* Notch / Perforated Ticket Divider */}
        <div className="relative flex items-center justify-between px-2 bg-slate-900 -my-3 z-10">
          <div className="w-6 h-6 rounded-full bg-slate-950 -ml-5 border-r border-slate-700" />
          <div className="flex-1 border-b-2 border-dashed border-slate-700 mx-2" />
          <div className="w-6 h-6 rounded-full bg-slate-950 -mr-5 border-l border-slate-700" />
        </div>

        {/* Pass Body & QR Code */}
        <div className="p-6 space-y-6">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-inner max-w-[200px] mx-auto">
            {/* SVG stylized QR code representation with encoded booking ID */}
            <div className="relative p-2">
              <svg
                viewBox="0 0 120 120"
                className="w-36 h-36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background grid */}
                <rect width="120" height="120" fill="white" />
                {/* Corner Finder 1 */}
                <rect x="10" y="10" width="30" height="30" stroke="#0f172a" strokeWidth="6" />
                <rect x="19" y="19" width="12" height="12" fill="#0f172a" />
                {/* Corner Finder 2 */}
                <rect x="80" y="10" width="30" height="30" stroke="#0f172a" strokeWidth="6" />
                <rect x="89" y="19" width="12" height="12" fill="#0f172a" />
                {/* Corner Finder 3 */}
                <rect x="10" y="80" width="30" height="30" stroke="#0f172a" strokeWidth="6" />
                <rect x="19" y="89" width="12" height="12" fill="#0f172a" />
                {/* Stylized Data Pixels */}
                <rect x="50" y="15" width="8" height="8" fill="#2563eb" />
                <rect x="62" y="15" width="8" height="8" fill="#0f172a" />
                <rect x="50" y="27" width="14" height="6" fill="#0f172a" />
                <rect x="15" y="52" width="10" height="8" fill="#0f172a" />
                <rect x="30" y="50" width="18" height="8" fill="#2563eb" />
                <rect x="52" y="48" width="16" height="16" fill="#0f172a" />
                <rect x="72" y="52" width="10" height="8" fill="#0f172a" />
                <rect x="86" y="50" width="18" height="8" fill="#2563eb" />
                <rect x="50" y="70" width="8" height="18" fill="#0f172a" />
                <rect x="64" y="80" width="16" height="8" fill="#2563eb" />
                <rect x="85" y="75" width="22" height="8" fill="#0f172a" />
                <rect x="85" y="90" width="12" height="12" fill="#0f172a" />
              </svg>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider uppercase mt-1">
              ID: {passData.booking_id.slice(-8).toUpperCase()}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-left bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Vehicle
              </span>
              <span className="text-xs font-extrabold text-blue-400 font-mono">
                {passData.vehicle_number}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Paid
              </span>
              <span className="text-xs font-extrabold text-emerald-400">
                ₹{passData.total_price}
              </span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Scheduled Slot Window
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {passData.date ? `${passData.date} | ` : ""}
                {passData.time_range || "Valid for Today"}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2">
            <button
              onClick={handleNavigate}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Start Turn-by-Turn GPS Navigation</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "Pass Details Copied!" : "Share / Export Pass"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
