"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, CalendarCheck, PlusCircle, User, ShieldAlert } from "lucide-react";
import { getStoredUser, UserSession } from "@/lib/config";

export default function MobileNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const items = [
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Bookings", href: "/bookings", icon: CalendarCheck },
    { label: "Host Space", href: "/host", icon: PlusCircle },
    user?.role === "owner"
      ? { label: "Admin", href: "/admin", icon: ShieldAlert }
      : { label: "Profile", href: user ? "/profile" : "/login", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 shadow-2xl shadow-black/40 rounded-2xl px-2 py-2 flex items-center justify-around safe-bottom">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-blue-400 bg-blue-500/10 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-400 stroke-[2.5]" : "stroke-2"}`} />
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
