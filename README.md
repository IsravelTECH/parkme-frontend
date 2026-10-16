# ParkMe Next.js 16 Web Application ⚡

Next-Gen, high-performance smart city parking interface built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons, and Leaflet.

---

## 🎨 Design Philosophy & Features

- **Responsive Viewports:** Built with mobile-first layout guidelines, touch-friendly hit areas (&ge;48px), and bottom floating pill navigation ([`MobileNav.tsx`](src/components/layout/MobileNav.tsx)).
- **Interactive Mapping:** Direct Leaflet integration with OpenStreetMap & ESRI Street/Satellite tiles (100% free, sharp, zero watermarks).
- **Apple Wallet Style Boarding Pass:** High-contrast digital ticket with QR code scanner pass and 1-click in-app GPS navigation to the reserved bay.
- **One-Click Demo Accounts:** Instant one-tap credentials for Admin (`isravel@gmail.com`) and Driver (`saipraasad@gmail.com`).
- **Telemetry & Slot Counter:** Real-time occupancy indicators sync directly with MongoDB.

---

## 📂 Folder Structure

```
frontend-next/
├── public/                     # Static media & assets
├── src/
│   ├── app/
│   │   ├── admin/page.tsx      # Dark executive command portal
│   │   ├── bookings/page.tsx   # Driver reservations & QR boarding passes
│   │   ├── explore/page.tsx    # 50/50 split map & live space search
│   │   ├── host/page.tsx       # Space hosting & payout analytics
│   │   ├── login/page.tsx      # Authentication with demo quick-fill
│   │   ├── profile/page.tsx    # User profile & avatar photo management
│   │   ├── signup/page.tsx     # Fast registration
│   │   ├── globals.css         # Tailwind v4 luxury design tokens
│   │   ├── layout.tsx          # Root layout with fonts & safe-area insets
│   │   └── page.tsx            # Modern hero landing page with search capsule
│   ├── components/
│   │   ├── booking/
│   │   │   ├── BookingDrawer.tsx      # Slide-over reservation drawer
│   │   │   └── DigitalPassModal.tsx   # Boarding pass & QR code modal
│   │   ├── layout/
│   │   │   ├── MobileNav.tsx          # iOS-style bottom floating bar
│   │   │   └── Navbar.tsx             # Desktop/mobile sticky header
│   │   └── map/
│   │       └── ParkingMap.tsx         # Native Leaflet interactive map
│   └── lib/
│       ├── config.ts           # Central API & Auth storage utils
│       └── utils.ts            # Classnames merger helper
├── .env.local                  # Local frontend environment variables
├── .env.example                # Template configuration
├── package.json                # Dependencies & scripts
└── tsconfig.json               # TypeScript config
```

---

## ⚡ Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```powershell
npm run dev -- -p 3005
```
Open **`http://localhost:3005`** in your browser.

### 4. Build for Production
```powershell
npm run build
npm start
```
