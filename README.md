# ✈️ AviationPro
### The Open-Source Tactical Flight Computer & Glass Cockpit Mission Suite
*A modern, offline-first alternative to E6BX, ASA CX-3, and subscription-heavy aviation tools.*

[![Live Web App](https://img.shields.io/badge/Live_App-GitHub_Pages-dc2626?style=for-the-badge&logo=github)](https://robfernan.github.io/AviationPro/)
[![Built with Bun](https://img.shields.io/badge/Built_with-Bun-fbf0df?style=for-the-badge&logo=bun)](https://bun.sh)
[![React 18](https://img.shields.io/badge/Frontend-React_18_%7C_SWC-61dafb.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Desktop](https://img.shields.io/badge/Desktop-Wails_v2_(Go)-00ADD8?style=for-the-badge&logo=go)](https://wails.io/)
[![Mobile](https://img.shields.io/badge/Mobile-Capacitor_%7C_Android-119EFF?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](./LICENSE)

---

## 🌟 Executive Overview

**AviationPro** is a professional-grade tactical flight computer and mission planning suite engineered by an FAA Student Pilot (129.2+ flight hours). Built with a **high-contrast glass-cockpit HUD architecture**, it delivers zero-latency aerodynamic calculations, real-time NOAA weather decoders, dynamic weight & balance physics, and one-click flight plan exports for **Garmin Pilot** and **ForeFlight**.

Designed to replace ad-heavy legacy websites like E6BX and \$200+ hardware calculators, AviationPro runs **100% offline** on browser tabs, cockpit kneeboard tablets (PWA / Android), and native frameless desktop shells (Wails / Go).

🔗 **Live Web Application**: [https://robfernan.github.io/AviationPro/](https://robfernan.github.io/AviationPro/)

---

## 🚀 Key Feature Suites

### 1. 📡 Live NOAA Telemetry Ribbon
* **Real-time METAR Decoders:** Real-time integration with `aviationweather.gov` across primary training corridors (`KF45`, `KDJT`, `KIMM`, `KOBE`, `KMIA`, `KFXE`).
* **Visual Flight Categories:** Instant color-coded categorization: **VFR** 🟢, **MVFR** 🔵, **IFR** 🔴, and **LIFR** 🟣.
* **Telemetry Teleprinter:** High-visibility Zulu/Local timestamps, wind direction & velocity, temperature, altimeter setting, and raw METAR strings with 1-click station switching.

### 2. 🧮 ASA CX-6 Digital Flight Computer
* **Wind Triangle & WCA:** Calculates True Heading, Groundspeed, and Wind Correction Angle (-L / +R).
* **True Airspeed (TAS):** Converts Indicated Airspeed (KIAS) to TAS using Pressure Altitude (PA) and Outside Air Temperature (OAT).
* **Time-Speed-Distance (TSD):** Instant leg time, decimal hours, and remaining distance estimates.
* **Fuel Burn Management:** GPH burn rates, endurance limits, and 100LL fuel weight conversions.
* **Crosswind & Headwind Components:** Instant runway alignment calculations with crosswind limit warnings.

### 3. ⚖️ Dynamic 2D CG Vector Envelope
* **C172 Vector Canvas:** Mathematical polygon plotting of **Normal Category** (up to 2,550 lbs) and **Utility Category** (up to 2,200 lbs) boundaries.
* **Real-time Physics:** Dynamic center-of-gravity coordinate tracking with visual flight path vectors (Ramp $\to$ Takeoff $\to$ Landing).
* **Safety Interlocks:** High-visibility cockpit alert (`ALERT: CG OUTSIDE ENVELOPE`) if weight or station moments exceed POH operating limitations.

### 4. 🗺️ NAVLOG & Pre-Flight Briefing Builder
* **Full-Width Navigation Log:** 2,400px wide master waypoint routing table tracking TC, ALT, Wind, TAS, WCA, TH, Var, MH, Dev, CH, Distance, Groundspeed, ETE/ATE, ETA/ATA, and VOR frequencies.
* **ForeFlight & Garmin Pilot Export:** 1-click export to official Garmin/ForeFlight XML-based `.fpl` flight plans ready for direct import into ForeFlight Mobile, Garmin Pilot, or avionics SD cards.
* **Printable PDF Briefing:** Auto-generates flight logs and weight & balance records into clean printable PDF documents.

### 5. 📒 Digital Pilot Logbook & Hangar Manager
* **Logbook Vault:** Local IndexedDB logbook recording total hours, PIC, cross-country, day/night landings, and dual-received time.
* **Custom Aircraft Hangar:** Save aircraft profiles (C172, PA-28, DA40) with custom Basic Empty Weight (BEW) and station arms.

---

## 📊 Comparison: AviationPro vs. Legacy Solutions

| Feature | **AviationPro** | **E6BX (Web)** | **ASA CX-3** | **ForeFlight** |
| :--- | :--- | :--- | :--- | :--- |
| **Pricing** | **100% Free & Open Source** | Ad-Supported | \$120–\$150 Hardware | \$120–\$360 / year |
| **User Interface** | **Glass-Cockpit Dark HUD** | Dated 2006 Web 2.0 | Segmented LCD Screen | Modern iOS |
| **Dynamic Vector CG Envelope**| **Interactive Canvas** | Static Tables | None | Yes |
| **Garmin / ForeFlight `.fpl`**| **Included (1-Click)** | None | None | Proprietary |
| **Offline Cockpit Capability** | **100% PWA + Desktop** | Breaks without signal | Yes (Handheld) | Yes |
| **Telemetry Ribbon** | **Live NOAA XC Feed** | Static lookup | None | Cellular / ADS-B |

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas/SVG Vector Graphics.
* **Build Engine:** Bun + Vite 5 + SWC (`@vitejs/plugin-react-swc`) with manual chunk splitting.
* **Desktop Shell:** Wails v2 (Go + WebKit/WebView2).
* **Mobile Bridge:** Capacitor for native Android deployment.
* **Storage:** Offline-first Dexie / IndexedDB for complete data sovereignty.

---

## ⚡ Quick Start & Development

```bash
# Clone repository
git clone https://github.com/robfernan/AviationPro.git
cd AviationPro

# Install dependencies with Bun
bun install

# Start local development server
bun run dev

# Build production bundle
bun run build
```

---

## 📄 License & Disclaimer
Licensed under the **MIT License**.

> **Aeronautical Disclaimer:** AviationPro is intended for flight simulation, pre-flight reference, and academic flight planning. Final responsibility for airworthiness and calculation verification rests solely with the Pilot in Command (PIC) per 14 CFR § 91.3.

**100% OFFLINE // GARMIN .FPL READY // FLIGHT DECK PRECISION**
