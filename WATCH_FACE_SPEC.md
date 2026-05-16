# AVPRO // Wear OS Watch Face Specification

## Objective
To provide a high-contrast, pilot-oriented watch face for Wear OS (Target: Google Pixel Watch) that bundles with the AVPRO Android application.

## 1. Visual Design (The "Cockpit" Aesthetic)
*   **Background**: True Black (#000000) for OLED battery efficiency on Pixel Watch.
*   **Primary Colors**: Aviation Red (#DC2626) for alerts and White (#F4F4F5) for primary data.
*   **Layout**: Circular "Glass Cockpit" style mimicking a modern PFD (Primary Flight Display).

## 2. Core Complications (At-a-Glance Data)
*   **Zulu Time (Primary)**: Large digital readout of UTC time. Pilots live by Zulu; it should be the most prominent element.
*   **Flight Category (METAR)**: A color-coded ring or icon based on the last fetched METAR from the phone:
    *   🟢 **VFR**: Visual Flight Rules
    *   🔵 **MVFR**: Marginal VFR
    *   🔴 **IFR**: Instrument Flight Rules
    *   🟣 **LIFR**: Low IFR
*   **Fuel Timer**: A quick-tap countdown timer (e.g., 30 mins) to remind pilots to switch fuel tanks.
*   **Battery Status**: Critical for electronic flight bag reliability.

## 3. Pixel Watch 1 Specific Optimizations
*   **Always-On Display (AOD)**: Optimized "Dimmed Red" mode to preserve night vision and battery.
*   **Haptic Feedback**: Subtle vibration for timer alerts using the Pixel Watch's high-quality linear actuator.

## 4. Technical Integration (Phone <-> Watch)
*   **Data Layer API**: Use the Android Wearable Data Layer to sync the "Favorite ICAO" weather from the MIAD01 phone app to the watch.
*   **Standalone Capability**: The watch face should be able to display the last cached weather even if the phone is disconnected (Offline-First).

## 5. Development Roadmap
1.  **Module Creation**: Add a `:wear` module to the existing `android/` project.
2.  **Watch Face Studio**: Design the basic XML layout using Google's Watch Face Studio for rapid prototyping.
3.  **Kotlin Service**: Implement a `WatchFaceService` in Kotlin to handle dynamic data (METAR/Zulu).
4.  **Bundling**: Update `app/build.gradle` to include `wearApp project(':wear')` for the 99-cent Play Store bundle.

---
*Suggested by AVPRO AI Development Suite*
