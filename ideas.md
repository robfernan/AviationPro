# AviationPro — Ideas & Feature Roadmap

This file collects feature ideas, product options, and technical recommendations to evolve AviationPro into a competitive, offline-first student-pilot app similar in spirit to e6bx.

## High-level product directions
- Core: accurate flight planning (route, fuel, weight & balance, performance) with robust, auditable calculations.
- Briefing: integrated METAR/TAF/NOTAM/PIREPs/MOS and printable pre-flight briefing packs.
- Charts & Maps: keep this lightweight. Focus on airport diagrams, IFR approach plates, SID/STAR references, and static overlays instead of a moving map.
- Offline-first: local cache of charts, airports, weather snapshots, and aircraft profiles for in-flight/offline use.
- Student-pilot first: optimize every workflow for homework, training, checkride prep, and quick offline study.
- Multi-platform: web (PWA), desktop native, and mobile apps with sync across devices.
- Ecosystem: import/export (GPX, KML, CSV), logbook sync, third‑party integrations (ForeFlight, Garmin, FlightAware API, ADS-B receivers).

## Desktop packaging options (pros/cons)
- NW.js
  - Pros: complete Chromium stack, mature ecosystem, easy packaging for all OSes, access to Node APIs.
  - Cons: large binary size, higher memory footprint.
- Wails (Go backend + webview)
  - Pros: small native binary, native access via Go, good for performance and memory, simple native menus.
  - Cons: smaller ecosystem; requires Go knowledge for native features.
- Recommendation: For this project, prefer NW.js or Wails. Electron and Tauri can work, but NW.js or Wails keep the maintenance story simpler for this use case.
## Mobile options
- Capacitor (Ionic)
  - Pros: wraps web app with native bridges, access to file system, GPS, background tasks.
  - Cons: plugin-based; plugin maintenance overhead.
- React Native / Expo
  - Pros: native UI, performant, great for complex native screens, reusable JS logic.
  - Cons: separate native code and build pipelines; greater dev overhead if web parity required.
- Recommendation: Start with PWA first. If mobile packaging is needed later, use Capacitor to wrap the same offline-first app rather than splitting into a separate product.
- For mobile, keep core features free and avoid paywalling basic calculators or logs.

## Architecture & infrastructure
- Local DB: SQLite (via sql.js/wasm or native SQLite for desktop/mobile) for offline storage of user data, aircraft profiles, and cached charts.
- Backend (optional): Supabase or Firebase for sync, auth, and hosted storage. Use a small custom API for paid features/subscriptions.
- Data sources: AOPA/FAA airport data, OurAirports, NOAA METAR/TAF, AviationWeather.gov, SkyVector tiles, OpenAIP, ADS‑B (local receivers), Open-MET.
- Caching: tile + chart bundling for offline; incremental updates; delta sync for aircraft/profile changes.

## Monetization & business
- Free-first model: keep the core planner, CX-6, weather, W&B, nav tools, and flight logs free.
- Optional support only: donations, sponsorships, or a one-time supporter badge if you ever want revenue without paywalling homework tools.
- Avoid paid mobile gating for essential features if the goal is student-pilot adoption.

## UX / UI recommendations (competitive parity & advantage)
- Clean, uncluttered planner UI with one-click briefings and printable navlog sheets.
- Fast multi-leg editing with drag-to-reorder legs, distance/time recalculation, and auto-route suggestions.
- Split-view: form + reference pane with quick calculations, rather than a moving map.
- Clear, auditable calculation logs and citation links for every performance result.
- Responsive first: design for phone, tablet, and laptop before desktop-only layouts.
- Keep table text and form text readable in dark mode with strong contrast and no opacity tricks.

## Feature ideas (large list)
- Route planning
  - Auto-route suggestions and airway snapping
  - SID/STAR-aware routing and altitudes
  - Alternate airport selection & ETA comparison
  - Flight plan filing export (email/ICAO/CSV) and support for online filing APIs
- Performance & weight & balance
  - Detailed takeoff/landing performance calculator with runway slope, temperature, pressure altitude, flap & anti-ice config
  - Runway analysis (TOD, accelerate-stop, obstacle clearance)
  - Load sheet + printable PDF
  - Configurable aircraft profiles: weights, fuel flow curves, moment arms, CG envelope
- Weather & briefing
  - METAR/TAF/NOTAM aggregation, TAF trend visualization
  - Wind aloft, GRIB overlay, icing forecast, SIGMET/AIRMET, surface analysis charts
  - Briefing pack builder (PDF) including METAR/TAF, NOTAMs, route wx, fuel plan
- Charts & maps
  - Static airport diagrams and approach plate viewer
  - Aerodrome diagrams and SIDs/STARs/Approaches galleries
  - Optional static overlays for airspace and weather, not a live moving-map stack
- Navigation aids & calculators
  - Radio nav station lookup and frequency suggestions
  - CX-6 exact feature parity: full wind triangle, E6B functions, conversions, drift/GS, celestial (optional)
  - GPS/serial integration (USB/COM) for live position and simulated logs
  - NavLog generation (printable) with leg-by-leg headings, distances, times, fuel
- Logs & records
  - Electronic logbook with endorsements, multi-aircraft tracking, export to CSV/PDF
  - Maintenance tracking (next inspection, hours tracking)
- Simulation & training
  - Scenario builder for crosswind/engine failure, weight changes, and training lessons
  - Instructor mode with shared flight plan review
- Integrations
  - ADS‑B receiver (e.g., dump1090) integration for traffic overlays
  - Flight tracking (FlightAware/ADS‑B) and dispatch sync
  - Export to ForeFlight/Garmin/GPX/KML
- Offline & performance
  - Background sync for weather updates, local caching of airport and chart data
  - Delta updates for charts to reduce bandwidth
- Security & compliance
  - Encrypted local storage for sensitive user data
  - Audit trail for any automated calculation used for dispatch/briefing
- Accessibility
  - High-contrast themes, keyboard navigation, screen reader labels on forms
- Quality & trust
  - Unit-tested calculation library (separate package) with validation vectors and reference data
  - Calculation provenance UI: show inputs, formulas, and assumptions for any computed value

## Asset usage ideas
- Use `assets/compass-arrow.svg` and `assets/compass-2024.svg` for nav-tool empty states, loading states, and the app hero.
- Use `assets/overcast.svg` and `assets/night-14.svg` for weather and night-planning cards.
- Use `assets/centerofgravitycessna172.png` in the W&B or aircraft-profile area as a visual reference for CG and loading demonstrations.
- Keep these illustrations responsive so they scale cleanly on phone, tablet, and desktop.
- Consider a lightweight visual header or welcome panel that rotates these SVG assets based on the active tab.

## Priority roadmap (MVP -> v1 -> advanced)
- MVP (0.1)
  - Core planner: multi-leg route editing, distance/time calculations, basic weather (METAR), basic W&B
  - Solid calculation logs + export GPX/CSV
  - PWA with offline cache for basic data
- v1 (0.5)
  - Detailed performance calculations, takeoff/landing, aircraft profiles
  - Briefing pack (METAR/TAF/NOTAM) + printable navlog
  - Moving map + airport lookup
  - Desktop packaging (Tauri or Wails) and installers
- v2 (1.0)
  - Charts (approach plates, airport diagrams), offline charts, ADS‑B integration
  - Advanced weather overlays (GRIB), auto-route, filing integrations, monetization
  - Mobile native builds (Capacitor first, React Native later)

## Engineering recommendations
- Split heavy numeric logic into an independent, well-tested calculation module (publish as npm package). This enables reuse across web, desktop, mobile.
- Use SQLite for local persistence; sync via background service worker for PWA and native background tasks for mobile/desktop.
- CI/CD: automated tests for calculation correctness, and e2e tests for core flows; nightly builds for desktop installers.
- Logging & telemetry (opt-in): capture errors and usage patterns to prioritize features.

## Next immediate priorities (active development)
### Flight Logs CRUD + Persistence (In Progress)
- Full CRUD: edit, delete, search/filter flight logs
- IndexedDB persistence so logs survive page reloads
- Export logs to JSON for file-based sync across devices
- Import logs from JSON file to restore data

### Live METAR/TAF/NOTAM Integration
- Fetch live METAR/TAF/NOTAM from free aviation APIs (CheckWX, Aviation Weather Center)
- Cache results in IndexedDB to avoid rate limits and enable offline fallback
- Display in Weather tab and include in briefing builder
- Fallback to external links (ForeFlight/Garmin) if API unavailable

### Custom Aircraft Profiles
- Allow users to create and save custom aircraft profiles in IndexedDB instead of using hardcoded samples
- Store: empty weight, arm, fuel capacity, fuel burn rates, CG envelope limits
- Use profiles across: W&B calculator, fuel planning, CX-6 performance calculations
- Export/import aircraft profiles with flight logs for cross-device sync
- Maintain library of common aircraft (Cessna 172, 182, Piper PA-28, etc.)

### Printable Briefing Builder (PDF Export)
- Combine flight plan + live weather + NOTAMs + aircraft profile into single briefing document
- Generate PDF with: route overview, checkpoint table, fuel plan, W&B analysis, weather summary, briefing checklist
- Similar to ForeFlight/Garmin briefing output, but built-in and customizable
- Export as PDF for offline reference or sharing
- Include print-to-PDF option as fallback

### Customizable Checklists
- Pre-flight, cruise, descent, landing checklist templates (editable by user)
- Users can check off items and add custom notes as they go through checklist
- Save checklist state with flight log
- Export checklists to PDF for physical use
- Allow duplicate/modify standard checklists (e.g., "VFR Pre-flight", "IFR Pre-flight")

## Next immediate UI fixes (quick wins)
- Remove translucent backgrounds on header/tabs (done) so the header and tab areas are always fully opaque.
- Improve CX-6 visual feedback: show clear active states and disable invalid inputs with inline validations.
- Add unit tests for CX-6 calculation functions (wind triangle, TAS) to catch numeric bugs.
- Make dark mode control the whole page background, footer, cards, and empty-state illustrations.
- Replace low-contrast opacity text with explicit dark/light text colors for readability.
- Normalize table cell text colors in dark mode across the whole app.

## Final notes
- Competitiveness depends heavily on: calculation accuracy, offline capabilities, and high-quality briefing/printing features. Charts and moving-map features are expensive to implement, so prioritize a great core planner + briefing first, then add charts and integrations.


-- end of ideas.md
