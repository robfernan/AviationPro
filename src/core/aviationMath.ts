// src/core/aviationMath.ts
// Mathematical flight computations based on standard ISA atmosphere and FAA guidelines.

export interface CrosswindResult {
  crosswindKt: number | null;
  side: 'L' | 'R' | null;
  headwindKt: number | null;
  tailwindKt: number | null;
  gustCrosswindKt?: number;
  error?: string;
}

export interface WindTriangleResult {
  heading: number | null;
  groundSpeed: number | null;
  windCorrectionAngle: number | null;
  error?: string;
}

export interface DensityAltitudeResult {
  exactFt: number | null;
  ruleOfThumbFt: number | null;
  error?: string;
}

export const AviationMath = {
  /**
   * 1. Wind Triangle (WCA & Groundspeed)
   * Solves the velocity vector triangle: V_ground = V_air + V_wind.
   * Input course and windDir in consistent angular degrees (0-360).
   * Guards against non-positive TAS, non-finite values, and wind exceeding TAS.
   */
  calculateWCA: (course: number, tas: number, windDir: number, windSpd: number): WindTriangleResult => {
    if (!Number.isFinite(course) || !Number.isFinite(tas) || !Number.isFinite(windDir) || !Number.isFinite(windSpd)) {
      return { heading: null, groundSpeed: null, windCorrectionAngle: null, error: "Invalid numeric input" };
    }
    if (tas <= 0) {
      return { heading: null, groundSpeed: null, windCorrectionAngle: null, error: "TAS must be positive" };
    }
    if (windSpd < 0) {
      return { heading: null, groundSpeed: null, windCorrectionAngle: null, error: "Wind speed cannot be negative" };
    }

    const courseRad = (course * Math.PI) / 180;
    const windDirRad = (windDir * Math.PI) / 180;
    const swc = (windSpd / tas) * Math.sin(windDirRad - courseRad);

    if (Math.abs(swc) > 1) {
      return { heading: null, groundSpeed: null, windCorrectionAngle: null, error: "Wind exceeds TAS" };
    }

    const wcaRad = Math.asin(swc);
    const gs = tas * Math.sqrt(1 - Math.pow(swc, 2)) - windSpd * Math.cos(windDirRad - courseRad);
    let trueHdg = (course + wcaRad * (180 / Math.PI)) % 360;
    if (trueHdg < 0) trueHdg += 360;
    const finalHdg = Math.round(trueHdg);

    return {
      heading: finalHdg === 0 ? 360 : finalHdg,
      groundSpeed: Math.round(gs),
      windCorrectionAngle: Math.round(wcaRad * (180 / Math.PI) * 10) / 10
    };
  },

  /**
   * 2. True Airspeed (TAS) from Calibrated Airspeed (CAS), Pressure Altitude (PA), and Temperature (OAT)
   * Formula:
   *   pressureRatio = (1 - 6.8756e-6 * pa_ft)^5.2559
   *   sigma = pressureRatio * 288.15 / (oatC + 273.15)
   *   TAS = CAS / sqrt(sigma)
   * Note: Compressibility is ignored (valid below ~200 kt in light aircraft).
   */
  calculateTAS: (cas: number, paFt: number, oatC: number): number | null => {
    if (!Number.isFinite(cas) || !Number.isFinite(paFt) || !Number.isFinite(oatC) || cas <= 0) {
      return null;
    }
    if (oatC <= -273.15 || paFt >= 145442) {
      return null;
    }
    const pressureRatio = Math.pow(1 - 6.8756e-6 * paFt, 5.2559);
    const sigma = (pressureRatio * 288.15) / (oatC + 273.15);
    if (!Number.isFinite(sigma) || sigma <= 0) return null;
    return Number((cas / Math.sqrt(sigma)).toFixed(1));
  },

  /**
   * 3. Pressure Altitude (PA)
   * Standard lapse approximation: PA = Field Elevation + (29.92 - Altimeter) * 1000
   */
  calculatePressureAltitude: (elevFt: number, altInHg: number): number | null => {
    if (!Number.isFinite(elevFt) || !Number.isFinite(altInHg) || altInHg <= 0) {
      return null;
    }
    return Math.round(elevFt + (29.92 - altInHg) * 1000);
  },

  /**
   * 4. Density Altitude (DA)
   * Computes both the exact atmospheric equation and the 120 ft/degC rule of thumb.
   * - Exact: Uses density ratio sigma = pressureRatio * (288.15 / (OAT + 273.15))
   *   exact = (1 - sigma^0.234969) / 6.8756e-6
   * - Rule of Thumb: DA = PA + 120 * (OAT - ISA)
   *   Common rule of thumb; FAA source not located.
   */
  calculateDensityAltitude: (paFt: number, oatC: number): DensityAltitudeResult => {
    if (!Number.isFinite(paFt) || !Number.isFinite(oatC) || oatC <= -273.15 || paFt >= 145442) {
      return { exactFt: null, ruleOfThumbFt: null, error: "Invalid pressure altitude or temperature" };
    }
    const isaTemp = 15 - 2 * (paFt / 1000);
    const ruleOfThumbFt = Math.round(paFt + 120 * (oatC - isaTemp));

    const pressureRatio = Math.pow(1 - 6.8756e-6 * paFt, 5.2559);
    const sigma = (pressureRatio * 288.15) / (oatC + 273.15);
    if (!Number.isFinite(sigma) || sigma <= 0) {
      return { exactFt: null, ruleOfThumbFt: null, error: "Atmospheric density out of bounds" };
    }
    const exactFt = Math.round((1 - Math.pow(sigma, 0.234969)) / 6.8756e-6);

    return { exactFt, ruleOfThumbFt };
  },

  /**
   * 5. Time-Speed-Distance (TSD)
   * Returns precise numeric calculations with zero-division and negative guards.
   * Distance in nautical miles (NM), Speed in knots (KT), Time in hours (HRS).
   */
  calculateTSD: (val1: number, val2: number, mode: 'distance' | 'time' | 'speed'): number | null => {
    if (!Number.isFinite(val1) || !Number.isFinite(val2) || val1 < 0 || val2 < 0) {
      return null;
    }
    if (mode === 'distance') {
      return Number((val1 * val2).toFixed(1)); // Time (hrs) * Speed (kts) = NM
    }
    if (mode === 'time') {
      if (val2 <= 0) return null;
      return Number((val1 / val2).toFixed(2)); // Distance (NM) / Speed (kts) = Hours
    }
    if (mode === 'speed') {
      if (val2 <= 0) return null;
      return Number((val1 / val2).toFixed(1)); // Distance (NM) / Time (hrs) = Knots
    }
    return null;
  },

  /**
   * 6. Fuel Consumption
   * Fuel (gal) = Flow (GPH) * Time (hours).
   */
  calculateFuel: (flowGPH: number, timeHours: number): number | null => {
    if (!Number.isFinite(flowGPH) || !Number.isFinite(timeHours) || flowGPH < 0 || timeHours < 0) {
      return null;
    }
    return Number((flowGPH * timeHours).toFixed(1));
  },

  /**
   * 7. Crosswind & Headwind Components (Single Source of Truth)
   * Doc comment: runwayHeadingDeg is magnetic (37-360, with 0 treated as 360).
   * Caller must supply wind in the same magnetic reference.
   * Rejects runway numbers 1-36 with an error.
   */
  calculateCrosswind: (
    runwayHeadingDeg: number,
    windDirDeg: number,
    windSpdKt: number,
    gustKt?: number
  ): CrosswindResult => {
    if (
      !Number.isFinite(runwayHeadingDeg) ||
      !Number.isFinite(windDirDeg) ||
      !Number.isFinite(windSpdKt) ||
      windSpdKt < 0
    ) {
      return { crosswindKt: null, side: null, headwindKt: null, tailwindKt: null, error: "Invalid numeric input" };
    }

    if (runwayHeadingDeg < 0 || runwayHeadingDeg > 360) {
      return {
        crosswindKt: null,
        side: null,
        headwindKt: null,
        tailwindKt: null,
        error: "Runway heading must be between 0 and 360 degrees"
      };
    }

    // Reject runway numbers 1-36 (must supply 3-digit heading 37-360, or 0 which is treated as 360)
    if (runwayHeadingDeg >= 1 && runwayHeadingDeg <= 36) {
      return {
        crosswindKt: null,
        side: null,
        headwindKt: null,
        tailwindKt: null,
        error: "Runway must be a heading in degrees (37-360, or 0 for 360), not a runway number (1-36)"
      };
    }

    const effectiveRwy = runwayHeadingDeg === 0 ? 360 : runwayHeadingDeg;
    const rad = ((windDirDeg - effectiveRwy) * Math.PI) / 180;
    const rawCrosswind = windSpdKt * Math.sin(rad);
    const rawHeadwind = windSpdKt * Math.cos(rad);

    const crosswindKt = Math.round(Math.abs(rawCrosswind));
    const headwindKt = rawHeadwind >= 0 ? Math.round(rawHeadwind) : 0;
    const tailwindKt = rawHeadwind < 0 ? Math.round(Math.abs(rawHeadwind)) : 0;

    let side: 'L' | 'R' | null = null;
    if (crosswindKt > 0) {
      side = Math.sin(rad) > 0 ? 'R' : 'L';
    }

    let gustCrosswindKt: number | undefined = undefined;
    if (gustKt !== undefined && Number.isFinite(gustKt) && gustKt > windSpdKt) {
      gustCrosswindKt = Math.round(Math.abs(gustKt * Math.sin(rad)));
    }

    return {
      crosswindKt,
      side,
      headwindKt,
      tailwindKt,
      gustCrosswindKt
    };
  }
};