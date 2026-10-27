"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Navigation,
  Car,
  Radar,
  Radio,
} from "lucide-react";

export default function SmartParking3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [parkProgress, setParkProgress] = useState(0); // 0 to 1
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeSlot, setActiveSlot] = useState(2); // Slot 2 is our target
  const [sensorView, setSensorView] = useState<"standard" | "lidar">("standard");

  // Continuous loop for parking animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setParkProgress((prev) => {
        if (prev >= 1) {
          // Pause briefly at parked state, then loop
          setTimeout(() => setParkProgress(0), 1200);
          return 1;
        }
        return prev + 0.008;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle 3D perspective tilt from mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Compute car position based on progress
  // Phase 1 (0 to 0.45): Driving along entry lane (X: -120 to 40, Y: 110)
  // Phase 2 (0.45 to 0.70): Turn & align (Rotating from 0deg to -90deg, Y: 110 to 70)
  // Phase 3 (0.70 to 1.0): Reverse docking into Slot 2 (Y: 70 to -10, X: 40)
  let carX = -130;
  let carY = 110;
  let carRotate = 0;
  let distanceDisplay = "3.2m";
  let sensorStatus = "APPROACHING";

  if (parkProgress < 0.45) {
    const t = parkProgress / 0.45;
    carX = -130 + t * 170; // moves from -130 to 40
    carY = 110;
    carRotate = 0;
    distanceDisplay = `${(3.2 - t * 1.5).toFixed(1)}m`;
    sensorStatus = "NAVIGATING TO BAY 02";
  } else if (parkProgress < 0.7) {
    const t = (parkProgress - 0.45) / 0.25;
    carX = 40 + Math.sin(t * Math.PI * 0.5) * 8;
    carY = 110 - t * 45;
    carRotate = -t * 90;
    distanceDisplay = `${(1.7 - t * 1.0).toFixed(1)}m`;
    sensorStatus = "ALIGNING REVERSE BAY";
  } else {
    const t = (parkProgress - 0.7) / 0.3;
    carX = 40;
    carY = 65 - t * 75; // docks into slot at -10
    carRotate = -90;
    distanceDisplay = t >= 0.95 ? "0.0m (LOCKED)" : `${(0.7 - t * 0.65).toFixed(1)}m`;
    sensorStatus = t >= 0.95 ? "PARKED & ENCRYPTED" : "DOCKING IN PROGRESS";
  }

  const isParked = parkProgress >= 0.95;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-xl mx-auto h-[440px] rounded-3xl bg-gradient-to-b from-slate-900 via-[#0B1120] to-[#070D18] border border-blue-500/20 p-5 overflow-hidden shadow-2xl shadow-blue-950/60 flex flex-col justify-between select-none"
      style={{ perspective: 1200 }}
    >
      {/* Background Ambient Glow & Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* TOP TELEMETRY HUD BAR */}
      <div className="relative z-20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 backdrop-blur-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-200">
            3D Urban Radar
          </span>
          <span className="text-slate-500 text-xs">|</span>
          <span className="text-[10px] font-bold text-emerald-400">
            {sensorStatus}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSensorView(sensorView === "standard" ? "lidar" : "standard")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1.5 ${
              sensorView === "lidar"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white"
            }`}
          >
            <Radio className="w-3 h-3 text-indigo-400" />
            <span>LiDAR</span>
          </button>

          <button
            onClick={() => {
              setParkProgress(0);
              setIsPlaying(true);
            }}
            title="Replay Maneuver"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D ISOMETRIC PARKING STAGE */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <motion.div
          animate={{
            rotateX: 38 - mousePos.y * 18,
            rotateZ: -28 + mousePos.x * 22,
          }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-[340px] h-[260px] bg-slate-900/90 rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/80"
        >
          {/* Surface Floor Markings */}
          <div className="absolute inset-2 border-2 border-dashed border-slate-700/60 rounded-xl pointer-events-none" />

          {/* Access Lane Centerline */}
          <div className="absolute bottom-[38px] left-4 right-4 h-0.5 border-t-2 border-dashed border-slate-600/40 pointer-events-none" />

          {/* PARKING BAYS (SLOTS 01, 02, 03, 04) */}
          <div className="absolute top-5 left-5 right-5 flex justify-between gap-3">
            {/* Slot 01: Occupied Sedan */}
            <div className="relative flex-1 h-[105px] rounded-xl border border-slate-700 bg-slate-800/40 flex flex-col items-center justify-between p-2">
              <div className="w-full flex items-center justify-between text-[9px] font-bold text-slate-400">
                <span>01</span>
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500" />
              </div>
              {/* Parked Vehicle (Ruby) */}
              <div className="relative w-11 h-18 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg border border-slate-500/40 shadow-lg flex items-center justify-center">
                <div className="w-8 h-8 rounded bg-slate-900/60 border border-slate-500/20" />
                <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
              </div>
              <span className="text-[8px] font-extrabold text-red-400 uppercase tracking-tighter">
                Occupied
              </span>
            </div>

            {/* Slot 02: TARGET AVAILABLE BAY */}
            <div
              onClick={() => setActiveSlot(2)}
              className={`relative flex-1 h-[105px] rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between p-2 ${
                isParked
                  ? "border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/20"
                  : "border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/20"
              }`}
            >
              {/* Overhead Sensor Pulse */}
              <div className="w-full flex items-center justify-between text-[9px] font-bold text-emerald-400">
                <span>02</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>

              {/* Bay Target Projection Ring */}
              {!isParked && (
                <div className="relative w-full flex-1 flex flex-col items-center justify-center">
                  <div className="w-12 h-14 rounded-lg border border-dashed border-emerald-400/60 flex items-center justify-center bg-emerald-500/5">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                </div>
              )}

              <span
                className={`text-[8px] font-extrabold uppercase tracking-tighter ${
                  isParked ? "text-blue-400" : "text-emerald-400 animate-pulse"
                }`}
              >
                {isParked ? "Reserved" : "Available"}
              </span>
            </div>

            {/* Slot 03: Occupied SUV */}
            <div className="relative flex-1 h-[105px] rounded-xl border border-slate-700 bg-slate-800/40 flex flex-col items-center justify-between p-2">
              <div className="w-full flex items-center justify-between text-[9px] font-bold text-slate-400">
                <span>03</span>
                <span className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              {/* Parked Vehicle (Graphite) */}
              <div className="relative w-11 h-18 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg border border-slate-600/50 shadow-lg flex items-center justify-center">
                <div className="w-8 h-8 rounded bg-slate-900/60 border border-slate-500/20" />
                <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
              </div>
              <span className="text-[8px] font-extrabold text-red-400 uppercase tracking-tighter">
                Occupied
              </span>
            </div>

            {/* Slot 04: VIP Reserved */}
            <div className="relative flex-1 h-[105px] rounded-xl border border-amber-600/40 bg-amber-950/20 flex flex-col items-center justify-between p-2">
              <div className="w-full flex items-center justify-between text-[9px] font-bold text-amber-400">
                <span>04</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-400/80" />
              </div>
              <span className="text-[8px] font-extrabold text-amber-400 uppercase tracking-tighter">
                EV Supercharge
              </span>
            </div>
          </div>

          {/* AUTONOMOUS ELECTRIC VEHICLE (3D MODEL) */}
          <div
            className="absolute z-30 transition-transform duration-75 pointer-events-none"
            style={{
              transform: `translate3d(${carX + 130}px, ${carY}px, 20px) rotate(${carRotate}deg)`,
              transformOrigin: "center center",
            }}
          >
            {/* 3D Car Body Container */}
            <div className="relative w-12 h-20 bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-700 rounded-xl border border-blue-300/60 shadow-2xl shadow-blue-500/50 flex flex-col items-center justify-between p-1.5">
              {/* Front Headlights & Light Cones */}
              <div className="w-full flex justify-between px-1">
                <div className="relative">
                  <div className="w-2 h-1 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
                  {/* Projected Headlight Beams */}
                  <div className="absolute top-0 -left-2 w-8 h-14 bg-gradient-to-b from-white/30 to-transparent blur-sm -rotate-12 pointer-events-none" />
                </div>
                <div className="relative">
                  <div className="w-2 h-1 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
                  <div className="absolute top-0 -right-2 w-8 h-14 bg-gradient-to-b from-white/30 to-transparent blur-sm rotate-12 pointer-events-none" />
                </div>
              </div>

              {/* Panoramic Glass Windshield */}
              <div className="w-9 h-7 rounded-lg bg-slate-950/80 border border-blue-200/30 shadow-inner flex items-center justify-center">
                <div className="w-6 h-1 rounded-full bg-blue-400/30" />
              </div>

              {/* Roof & Solar Telemetry Panel */}
              <div className="w-7 h-4 rounded bg-slate-900/60 border border-blue-400/20 flex items-center justify-center">
                <span className="text-[6px] font-black text-blue-200 tracking-widest">
                  PARKME
                </span>
              </div>

              {/* Rear Tail Lamps */}
              <div className="w-full flex justify-between px-1">
                <div className="w-2.5 h-1 bg-red-500 rounded-sm shadow-[0_0_6px_#ef4444]" />
                <div className="w-2.5 h-1 bg-red-500 rounded-sm shadow-[0_0_6px_#ef4444]" />
              </div>
            </div>

            {/* Ultrasonic Distance Sensor Beam Line */}
            {sensorView === "lidar" && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-t from-emerald-400 to-transparent animate-pulse" />
            )}
          </div>
        </motion.div>
      </div>

      {/* BOTTOM TELEMETRY STATUS CAPSULE */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md rounded-2xl px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Radar className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">BAY 02 SMART DOCK</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ₹50/HR
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Sensor distance: <span className="font-mono text-white font-bold">{distanceDisplay}</span> • Accuracy: <span className="text-emerald-400 font-bold">99.9%</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Drag cursor to rotate 3D view
          </span>
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
