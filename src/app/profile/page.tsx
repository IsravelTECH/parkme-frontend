"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Shield,
  CalendarCheck,
  TrendingUp,
  Camera,
  LogOut,
  Car,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CONFIG, getStoredUser, clearStoredUser } from "@/lib/config";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profile_image?: string;
  total_slots: number;
  total_bookings: number;
  active_bookings: number;
  total_earnings: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    const user = getStoredUser();
    if (!user || !user.token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Unable to retrieve profile records");
      }

      const json = await res.json();
      setProfile(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const user = getStoredUser();
    if (!user?.token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${CONFIG.API_BASE_URL}/upload-profile-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed to upload avatar");

      alert("Avatar updated successfully!");
      await fetchProfile();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    clearStoredUser();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Cover banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 relative" />

        <div className="px-6 sm:px-10 pb-8 -mt-16 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar with Upload Badge */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-3xl font-extrabold text-blue-600">
                {profile?.profile_image ? (
                  <img
                    src={
                      profile.profile_image.startsWith("http")
                        ? profile.profile_image
                        : `${CONFIG.API_BASE_URL}/${profile.profile_image}`
                    }
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md cursor-pointer transition transform group-hover:scale-110"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {profile?.name || "Driver Profile"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase border border-blue-200">
                  {profile?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="border-t border-slate-100 bg-slate-50/70 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Reservations
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {profile?.total_bookings || 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-blue-600 block">
              Active Passes
            </span>
            <span className="text-xl font-extrabold text-blue-600">
              {profile?.active_bookings || 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Managed Slots
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {profile?.total_slots || 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">
              Host Earnings
            </span>
            <span className="text-xl font-extrabold text-emerald-600">
              ₹{profile?.total_earnings || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900">
          Account Security & Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Phone Number
            </span>
            <span className="font-bold text-slate-800">
              {profile?.phone || "Not configured"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Account Role
            </span>
            <span className="font-bold text-slate-800 capitalize">
              {profile?.role === "owner" ? "Platform Administrator / Space Owner" : "Vehicle Driver / Seeker"}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href="/bookings"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            View Active Bookings
          </Link>
          <Link
            href="/host"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            Manage Host Spaces
          </Link>
        </div>
      </div>
    </div>
  );
}
