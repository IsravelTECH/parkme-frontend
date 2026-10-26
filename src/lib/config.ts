/**
 * ParkMe Central Application Configuration & Auth State
 */
export const CONFIG = {
  get API_BASE_URL() {
    let url = process.env.NEXT_PUBLIC_API_URL || "https://parkme-backend.onrender.com";
    return url.replace(/\/+$/, ""); // Strip trailing slash to eliminate //parkings double-slash bugs
  },
  STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_KEY ||
    "pk_test_51RZu0JRhETa6xdVHdqX8dJsFXxfLb6Gba2eDBWFgjBAK9oMxNt69OxAGqjDLy9NOOMXDKTC203V1j3C09DZAp6Nx00nMGoEUGY",
};

export interface UserSession {
  token: string;
  name: string;
  role: "seeker" | "owner" | string;
  profileImage?: string;
}

export function getStoredUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    token,
    name: localStorage.getItem("username") || "User",
    role: localStorage.getItem("role") || "seeker",
    profileImage: localStorage.getItem("profileImage") || undefined,
  };
}

export function setStoredUser(session: UserSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", session.token);
  localStorage.setItem("username", session.name);
  localStorage.setItem("role", session.role);
  if (session.profileImage) {
    localStorage.setItem("profileImage", session.profileImage);
  }
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("profileImage");
  localStorage.removeItem("bookingData");
}
