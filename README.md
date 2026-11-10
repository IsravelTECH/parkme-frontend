# ParkMe Next.js 16 Web Application ⚡🅿️

<p align="center">
  <img src="../showcase_assets/hero_mockup.jpg" alt="ParkMe Web & Mobile Mockup" width="100%" style="border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,0.12);" />
</p>

<p align="center">
  <b>High-performance, luxury smart city parking web portal engineered with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, and Leaflet.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet" alt="Leaflet" />
</p>

---

## 🌟 Web Portal Features

1. **Stacked Explore Layout (`/explore`)**
   - Clean split architecture: interactive Leaflet map locked at the upper half, with real-time parking slots list stacked cleanly below.
   - Solved background bleed and unwanted scrolling under the header.
   - Custom map pins centered on Chennai metro hubs with zoom level `12.5`.

2. **Executive Light Theme Admin Console (`/admin`)**
   - **Top-Right Global Omnisearch:** Accessible via button or keyboard shortcut (`Ctrl + K` / `Cmd + K`). Searches across:
     - 🏢 **Facilities:** Name, address, landmark, city.
     - 🧾 **Bills & Bookings:** Bill ID, vehicle plate, facility name, status.
     - 👥 **Users & Drivers:** Name, email, phone number, role.
   - **User Directory with Enrolled Details:** Displays enrollment date, contact phone, total reservations made, and cumulative spending in ₹.
   - **Interactive Detail Modals:** Click any table row or search result to open rich preview modals (Facility Preview, Digital Invoice with QR pass, and User Profile Dossier).

3. **Host & Monetize Portal (`/host`)**
   - List private spaces with address geocoding.
   - **Edit Slot Functionality:** Inline edit button (`Pencil` icon) on each managed property card with prefilled values, tariff adjustment, and image preset selectors.

4. **Solid Opaque Navigation Bar**
   - Features desktop links with an explicit **Home (`/`)** link, mobile drawer navigation, and clean profile status indicators.

---

## 📁 Web Folder Structure

```text
Frontend/
├── public/                      # Static assets, branding icons, and mockups
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Global HTML layout & fonts
│   │   ├── page.tsx             # Landing hero, 3D smart bay telemetry, search
│   │   ├── admin/page.tsx       # Light theme admin console with omnisearch & modals
│   │   ├── explore/page.tsx     # Stacked upper map and lower slots list
│   │   ├── host/page.tsx        # Host & monetize management with edit slot modal
│   │   ├── bookings/page.tsx    # User reservations & digital boarding passes
│   │   ├── login/page.tsx       # Auth with one-click demo quick-fill credentials
│   │   ├── signup/page.tsx      # Driver & host registration
│   │   └── profile/page.tsx     # Profile settings & avatar management
│   ├── components/
│   │   ├── layout/Navbar.tsx    # Solid opaque header with Home, Explore, Host, Admin
│   │   ├── layout/MobileNav.tsx # Bottom floating pill navigation
│   │   └── map/ParkingMap.tsx   # Dynamic Leaflet geospatial component
│   └── lib/config.ts            # API base URLs & localStorage session helpers
├── package.json                 # Dependencies & build scripts
└── next.config.ts               # Next.js compiler options
```

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Development Mode
```bash
npm run dev
```
Open [`http://localhost:3000`](http://localhost:3000) in your browser.

### 3. Production Build & Start
```bash
npm run build
npm start
```
Compiles static and dynamic routes with zero TypeScript or ESLint errors.

---

## 🔑 Demo Quick-Fill Accounts

- **Admin Account:** `isravel@gmail.com` / `12345`  
- **Driver Account:** `saipraasad@gmail.com` / `123456`
