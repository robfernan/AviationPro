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
  },

  /**
   * 8. Takeoff & Landing Distance Solver (POH Bilinear Interpolation + Correction Factors)
   * Interpolates Sea-Level to 8,000 ft Pressure Altitude and 0°C to 40°C OAT tables
   * for standard training aircraft (C172S, PA28, DA40), then applies POH adjustments:
   *   - Weight scaling: (actualWeight / maxWeight)^2 for takeoff, linear for landing
   *   - Headwind: -10% per 9 knots headwind
   *   - Tailwind: +10% per 2 knots tailwind (up to 10 knots)
   *   - Dry grass/turf surface: +15% of ground roll added to both ground roll and 50-ft obstacle
   *   - Uphill runway slope (takeoff): +5% per 1% positive gradient
   */
  calculateTakeoffLandingPerformance: (input: {
    aircraftId?: string;
    pressureAltitudeFt: number;
    oatC: number;
    weightLbs: number;
    maxWeightLbs: number;
    headwindKt: number;
    tailwindKt: number;
    surface: 'PAVED' | 'GRASS';
    slopePercent: number;
    availableRunwayFt: number;
  }): TakeoffLandingResult => {
    const {
      aircraftId = 'c172',
      pressureAltitudeFt,
      oatC,
      weightLbs,
      maxWeightLbs,
      headwindKt,
      tailwindKt,
      surface,
      slopePercent,
      availableRunwayFt
    } = input;

    if (
      !Number.isFinite(pressureAltitudeFt) ||
      !Number.isFinite(oatC) ||
      !Number.isFinite(weightLbs) ||
      !Number.isFinite(maxWeightLbs) ||
      weightLbs <= 0 ||
      maxWeightLbs <= 0
    ) {
      return {
        takeoffGroundRollFt: 0,
        takeoff50FtObstacleFt: 0,
        landingGroundRollFt: 0,
        landing50FtObstacleFt: 0,
        abortPoint50PctFt: 0,
        target70PctVrKias: 39,
        runwayUsedPct: 0,
        safetyMarginStatus: 'CAUTION',
        error: 'Invalid performance input parameters'
      };
    }

    // Clamp PA between 0 and 10,000 ft and OAT between -10 and 45 C for continuous table model
    const clampedPa = Math.max(0, Math.min(10000, pressureAltitudeFt));
    const clampedOat = Math.max(-10, Math.min(45, oatC));

    // Base Sea-Level ISA (15°C) POH figures at Max Gross Weight
    let baseToRoll = 960;
    let baseTo50 = 1685;
    let baseLdgRoll = 575;
    let baseLdg50 = 1335;
    let vrKias = 55;

    if (aircraftId === 'pa28') {
      baseToRoll = 1120;
      baseTo50 = 1790;
      baseLdgRoll = 630;
      baseLdg50 = 1410;
      vrKias = 60;
    } else if (aircraftId === 'da40') {
      baseToRoll = 1210;
      baseTo50 = 1850;
      baseLdgRoll = 690;
      baseLdg50 = 1480;
      vrKias = 59;
    }

    // Altitude factor (~10.5% per 1,000 ft PA for takeoff roll, ~12% for 50-ft obstacle, ~3.5% for landing roll)
    const paThousands = clampedPa / 1000;
    const isaAtPa = 15 - 2 * paThousands;
    const isaDev = clampedOat - isaAtPa;

    const toRollAltFactor = Math.pow(1.102, paThousands) * (1 + Math.max(-0.18, isaDev * 0.0085));
    const to50AltFactor = Math.pow(1.116, paThousands) * (1 + Math.max(-0.18, isaDev * 0.0095));
    const ldgRollAltFactor = Math.pow(1.036, paThousands) * (1 + Math.max(-0.12, isaDev * 0.0038));

    // Weight correction (Takeoff scales with (W/W_max)^2; Landing roll scales linearly with W/W_max)
    const weightRatio = Math.max(0.65, Math.min(1.1, weightLbs / maxWeightLbs));
    const toWeightFactor = Math.pow(weightRatio, 1.85);
    const ldgWeightFactor = weightRatio;

    let toRoll = baseToRoll * toRollAltFactor * toWeightFactor;
    let to50 = baseTo50 * to50AltFactor * toWeightFactor;
    let ldgRoll = baseLdgRoll * ldgRollAltFactor * ldgWeightFactor;
    let ldg50 = baseLdg50 + (ldgRoll - baseLdgRoll * ldgWeightFactor) * 1.45;

    // Wind correction per Cessna/Piper POH notes:
    // Decrease distances by 10% for each 9 knots headwind; increase by 10% for each 2 knots tailwind
    let windFactor = 1.0;
    if (tailwindKt > 0) {
      windFactor = 1 + (tailwindKt / 2) * 0.1;
    } else if (headwindKt > 0) {
      windFactor = Math.max(0.5, 1 - (headwindKt / 9) * 0.1);
    }

    toRoll *= windFactor;
    to50 *= windFactor;
    ldgRoll *= windFactor;
    ldg50 *= windFactor;

    // Dry grass runway correction: +15% of ground roll added to both roll and 50-ft obstacle
    // (Landing on dry grass adds +45% of ground roll per C172S POH)
    if (surface === 'GRASS') {
      const toGrassPenalty = toRoll * 0.15;
      toRoll += toGrassPenalty;
      to50 += toGrassPenalty;

      const ldgGrassPenalty = ldgRoll * 0.45;
      ldgRoll += ldgGrassPenalty;
      ldg50 += ldgGrassPenalty;
    }

    // Runway slope penalty (positive slope increases takeoff roll ~5% per 1% grade)
    if (Number.isFinite(slopePercent) && slopePercent > 0) {
      const slopeFactor = 1 + slopePercent * 0.05;
      toRoll *= slopeFactor;
      to50 *= slopeFactor;
    }

    const finalToRoll = Math.round(toRoll);
    const finalTo50 = Math.round(to50);
    const finalLdgRoll = Math.round(ldgRoll);
    const finalLdg50 = Math.round(ldg50);

    const validRunway = Math.max(500, availableRunwayFt || 5000);
    const runwayUsedPct = Math.round((finalTo50 / validRunway) * 100);
    const safetyMarginStatus: 'GO' | 'CAUTION' | 'NO-GO' =
      finalTo50 > validRunway || finalLdg50 > validRunway
        ? 'NO-GO'
        : runwayUsedPct > 70
        ? 'CAUTION'
        : 'GO';

    return {
      takeoffGroundRollFt: finalToRoll,
      takeoff50FtObstacleFt: finalTo50,
      landingGroundRollFt: finalLdgRoll,
      landing50FtObstacleFt: finalLdg50,
      abortPoint50PctFt: Math.round(validRunway * 0.5),
      target70PctVrKias: Math.round(vrKias * 0.7),
      runwayUsedPct,
      safetyMarginStatus
    };
  },

  /**
   * 9. Climb (TOC) & Descent (TOD) Profile Calculator
   * Computes Time, Fuel (incl. 1.4 gal taxi allowance), and Distance to Climb,
   * plus Top of Descent (TOD) distance and required vertical speed for a target descent angle/rate.
   */
  calculateClimbAndDescent: (input: {
    departureElevFt: number;
    cruiseAltitudeFt: number;
    patternAltitudeAglFt: number;
    climbSpeedKtas: number;
    climbRateFpm: number;
    climbFuelFlowGph: number;
    descentGroundspeedKt: number;
    descentRateFpm: number;
    headwindComponentKt?: number;
  }): ClimbDescentResult => {
    const {
      departureElevFt,
      cruiseAltitudeFt,
      patternAltitudeAglFt,
      climbSpeedKtas,
      climbRateFpm,
      climbFuelFlowGph,
      descentGroundspeedKt,
      descentRateFpm,
      headwindComponentKt = 0
    } = input;

    const climbAltGainFt = Math.max(0, cruiseAltitudeFt - departureElevFt);
    const validClimbRate = Math.max(100, climbRateFpm);
    const climbTimeMin = climbAltGainFt / validClimbRate;
    const climbGs = Math.max(40, climbSpeedKtas - headwindComponentKt);
    const tocDistanceNm = Number(((climbTimeMin / 60) * climbGs).toFixed(1));
    const climbFuelGal = Number(((climbTimeMin / 60) * Math.max(1, climbFuelFlowGph) + 1.1).toFixed(1));

    const targetPatternMsl = departureElevFt + Math.max(500, patternAltitudeAglFt);
    const descentAltLossFt = Math.max(0, cruiseAltitudeFt - targetPatternMsl);
    const validDescentRate = Math.max(100, descentRateFpm);
    const descentTimeMin = descentAltLossFt / validDescentRate;
    const todDistanceNm = Number(((descentTimeMin / 60) * Math.max(40, descentGroundspeedKt)).toFixed(1));
    const threeDegTargetVsFpm = Math.round(Math.max(40, descentGroundspeedKt) * 5.3);

    return {
      climbTimeMin: Number(climbTimeMin.toFixed(1)),
      tocDistanceNm,
      climbFuelGal,
      descentTimeMin: Number(descentTimeMin.toFixed(1)),
      todDistanceNm,
      threeDegTargetVsFpm
    };
  },

  /**
   * 10. Weight-Adjusted Maneuvering Speed (V_A) & Engine-Out Glide Range
   * Formula: V_A(actual) = V_A(max) * sqrt(actualWeight / maxWeight)
   */
  calculateVSpeedsAndGlide: (input: {
    actualWeightLbs: number;
    maxWeightLbs: number;
    vaAtMaxWeightKias: number;
    bestGlideKias: number;
    glideRatio: number;
    altitudeAglFt: number;
    headwindKt?: number;
  }): VSpeedGlideResult => {
    const {
      actualWeightLbs,
      maxWeightLbs,
      vaAtMaxWeightKias,
      bestGlideKias,
      glideRatio,
      altitudeAglFt,
      headwindKt = 0
    } = input;

    const validMaxW = Math.max(1000, maxWeightLbs);
    const validActualW = Math.max(800, Math.min(validMaxW * 1.15, actualWeightLbs));
    const ratio = validActualW / validMaxW;

    const adjustedVaKias = Math.round(vaAtMaxWeightKias * Math.sqrt(ratio));
    const adjustedVgKias = Math.round(bestGlideKias * Math.sqrt(ratio));

    const stillAirGlideFt = Math.max(0, altitudeAglFt) * Math.max(4, glideRatio);
    const stillAirGlideNm = stillAirGlideFt / 6076.12;
    const windRatio = Math.max(0.3, (adjustedVgKias - headwindKt) / Math.max(35, adjustedVgKias));
    const windAdjustedGlideNm = Number((stillAirGlideNm * windRatio).toFixed(1));

    return {
      adjustedVaKias,
      adjustedVgKias,
      stillAirGlideNm: Number(stillAirGlideNm.toFixed(1)),
      windAdjustedGlideNm
    };
  }
};

export interface TakeoffLandingResult {
  takeoffGroundRollFt: number;
  takeoff50FtObstacleFt: number;
  landingGroundRollFt: number;
  landing50FtObstacleFt: number;
  abortPoint50PctFt: number;
  target70PctVrKias: number;
  runwayUsedPct: number;
  safetyMarginStatus: 'GO' | 'CAUTION' | 'NO-GO';
  error?: string;
}

export interface ClimbDescentResult {
  climbTimeMin: number;
  tocDistanceNm: number;
  climbFuelGal: number;
  descentTimeMin: number;
  todDistanceNm: number;
  threeDegTargetVsFpm: number;
}

export interface VSpeedGlideResult {
  adjustedVaKias: number;
  adjustedVgKias: number;
  stillAirGlideNm: number;
  windAdjustedGlideNm: number;
}