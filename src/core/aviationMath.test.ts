import { describe, it, expect } from 'bun:test';
import { AviationMath } from './aviationMath';

describe('AviationMath Core Unit Tests', () => {
  // --- TAS Tests ---
  it('calculates TAS accurately across PA and OAT conditions and returns null on invalid input', () => {
    // TAS 100 @ PA0/15C -> 100.0 [tolerance 0.5]
    const tas1 = AviationMath.calculateTAS(100, 0, 15);
    expect(tas1).not.toBeNull();
    expect(Math.abs((tas1 as number) - 100.0)).toBeLessThanOrEqual(0.5);

    // PA5000/5C -> 107.7 [tolerance 0.5]
    const tas2 = AviationMath.calculateTAS(100, 5000, 5);
    expect(tas2).not.toBeNull();
    expect(Math.abs((tas2 as number) - 107.7)).toBeLessThanOrEqual(0.5);

    // PA10000/-5C -> 116.3 [tolerance 0.5]
    const tas3 = AviationMath.calculateTAS(100, 10000, -5);
    expect(tas3).not.toBeNull();
    expect(Math.abs((tas3 as number) - 116.3)).toBeLessThanOrEqual(0.5);

    // PA10000/15C -> 120.6 [tolerance 0.5]
    const tas4 = AviationMath.calculateTAS(100, 10000, 15);
    expect(tas4).not.toBeNull();
    expect(Math.abs((tas4 as number) - 120.6)).toBeLessThanOrEqual(0.5);

    // Null on invalid TAS input (<= 0, NaN, out of bounds)
    expect(AviationMath.calculateTAS(0, 5000, 15)).toBeNull();
    expect(AviationMath.calculateTAS(-50, 5000, 15)).toBeNull();
    expect(AviationMath.calculateTAS(NaN, 5000, 15)).toBeNull();
    expect(AviationMath.calculateTAS(100, 5000, -300)).toBeNull();
  });

  // --- Density Altitude & Pressure Altitude Tests ---
  it('calculates exact Density Altitude and returns null on invalid input', () => {
    // PA19/25C -> 1184 [tolerance 15]
    const da1 = AviationMath.calculateDensityAltitude(19, 25);
    expect(da1.exactFt).not.toBeNull();
    expect(Math.abs((da1.exactFt as number) - 1184)).toBeLessThanOrEqual(15);

    // PA5000/30C -> 7801 [tolerance 15]
    const da2 = AviationMath.calculateDensityAltitude(5000, 30);
    expect(da2.exactFt).not.toBeNull();
    expect(Math.abs((da2.exactFt as number) - 7801)).toBeLessThanOrEqual(15);

    // PA8000/30C -> 11423 [tolerance 15]
    const da3 = AviationMath.calculateDensityAltitude(8000, 30);
    expect(da3.exactFt).not.toBeNull();
    expect(Math.abs((da3.exactFt as number) - 11423)).toBeLessThanOrEqual(15);

    // DA rule of thumb: PA5000/30C -> 8000 [tolerance 1]
    expect(da2.ruleOfThumbFt).not.toBeNull();
    expect(Math.abs((da2.ruleOfThumbFt as number) - 8000)).toBeLessThanOrEqual(1);

    // Invalid DA & PA input -> null
    const daBad = AviationMath.calculateDensityAltitude(NaN, 25);
    expect(daBad.exactFt).toBeNull();
    expect(daBad.ruleOfThumbFt).toBeNull();
    expect(AviationMath.calculatePressureAltitude(100, -29.92)).toBeNull();
    expect(AviationMath.calculatePressureAltitude(NaN, 29.92)).toBeNull();
  });

  // --- Wind Triangle Tests ---
  it('calculates Wind Triangle with correct heading, ground speed, WCA, and handles tas 0', () => {
    // crs 360, TAS 100, wind 090/20 -> WCA +11.5, hdg 012, GS 98 [tolerance 1]
    const w1 = AviationMath.calculateWCA(360, 100, 90, 20);
    expect(w1.heading).toBe(12);
    expect(Math.abs((w1.groundSpeed ?? 0) - 98)).toBeLessThanOrEqual(1);
    expect(Math.abs((w1.windCorrectionAngle ?? 0) - 11.5)).toBeLessThanOrEqual(0.1);

    // North as 360 check (course 0, calm wind -> heading 360)
    const wNorth = AviationMath.calculateWCA(0, 100, 360, 0);
    expect(wNorth.heading).toBe(360);

    // tas 0 -> error, null fields, no NaN
    const wZero = AviationMath.calculateWCA(360, 0, 90, 20);
    expect(wZero.error).toBeDefined();
    expect(wZero.heading).toBeNull();
    expect(wZero.groundSpeed).toBeNull();
    expect(wZero.windCorrectionAngle).toBeNull();
    expect(Number.isNaN(wZero.groundSpeed)).toBe(false);
  });

  // --- Crosswind Tests ---
  it('calculates Crosswind, Headwind, Tailwind, magnetic wraps, and rejects runway numbers 1-36', () => {
    // rwy 100 wind 120/12 -> xw 4 R, hw 11
    const x1 = AviationMath.calculateCrosswind(100, 120, 12);
    expect(x1.crosswindKt).toBe(4);
    expect(x1.side).toBe('R');
    expect(x1.headwindKt).toBe(11);
    expect(x1.tailwindKt).toBe(0);

    // rwy 100 wind 280/12 -> tailwind 12, xw 0
    const x2 = AviationMath.calculateCrosswind(100, 280, 12);
    expect(x2.tailwindKt).toBe(12);
    expect(x2.crosswindKt).toBe(0);
    expect(x2.headwindKt).toBe(0);

    // rwy 360 wind 010/10 -> xw 2 R (wrap)
    const x3 = AviationMath.calculateCrosswind(360, 10, 10);
    expect(x3.crosswindKt).toBe(2);
    expect(x3.side).toBe('R');

    // runway 0 treated as 360: rwy 0 wind 010/10 -> xw 2 R
    const xZero = AviationMath.calculateCrosswind(0, 10, 10);
    expect(xZero.error).toBeUndefined();
    expect(xZero.crosswindKt).toBe(2);
    expect(xZero.side).toBe('R');

    // wrap case from left: rwy 360 wind 340/10 -> xw 3 L (or rwy 040 wind 020/10 -> xw 3 L)
    const xWrapLeft = AviationMath.calculateCrosswind(360, 340, 10);
    expect(xWrapLeft.crosswindKt).toBe(3);
    expect(xWrapLeft.side).toBe('L');

    // runway input 9 -> error
    const xErr9 = AviationMath.calculateCrosswind(9, 120, 12);
    expect(xErr9.error).toBeDefined();
    expect(xErr9.crosswindKt).toBeNull();

    // runway input 27 -> error (reject 1-36)
    const xErr27 = AviationMath.calculateCrosswind(27, 120, 12);
    expect(xErr27.error).toBeDefined();
    expect(xErr27.crosswindKt).toBeNull();
  });

  // --- TSD & Fuel Null Guards ---
  it('returns null on divide-by-zero or negative inputs in TSD and Fuel', () => {
    expect(AviationMath.calculateTSD(100, 0, 'time')).toBeNull();
    expect(AviationMath.calculateTSD(100, -10, 'speed')).toBeNull();
    expect(AviationMath.calculateFuel(-8.5, 2)).toBeNull();
  });

  // --- Takeoff & Landing Distance Solver Tests ---
  it('calculates C172S Sea-Level ISA POH takeoff and landing distances and applies grass/wind penalties', () => {
    const seaLevelPaved = AviationMath.calculateTakeoffLandingPerformance({
      aircraftId: 'c172',
      pressureAltitudeFt: 0,
      oatC: 15,
      weightLbs: 2550,
      maxWeightLbs: 2550,
      headwindKt: 0,
      tailwindKt: 0,
      surface: 'PAVED',
      slopePercent: 0,
      availableRunwayFt: 5000,
    });
    expect(seaLevelPaved.takeoffGroundRollFt).toBe(960);
    expect(seaLevelPaved.takeoff50FtObstacleFt).toBe(1685);
    expect(seaLevelPaved.landingGroundRollFt).toBe(575);
    expect(seaLevelPaved.safetyMarginStatus).toBe('GO');

    // Grass runway adds +15% of ground roll to takeoff and +45% to landing
    const seaLevelGrass = AviationMath.calculateTakeoffLandingPerformance({
      aircraftId: 'c172',
      pressureAltitudeFt: 0,
      oatC: 15,
      weightLbs: 2550,
      maxWeightLbs: 2550,
      headwindKt: 0,
      tailwindKt: 0,
      surface: 'GRASS',
      slopePercent: 0,
      availableRunwayFt: 5000,
    });
    expect(seaLevelGrass.takeoffGroundRollFt).toBeGreaterThan(seaLevelPaved.takeoffGroundRollFt);
    expect(seaLevelGrass.landingGroundRollFt).toBeGreaterThan(seaLevelPaved.landingGroundRollFt);
  });

  // --- Climb (TOC), Descent (TOD) & Weight-Adjusted V-Speed Tests ---
  it('calculates TOC/TOD profile and weight-adjusted V_A maneuvering speed', () => {
    const climbDesc = AviationMath.calculateClimbAndDescent({
      departureElevFt: 500,
      cruiseAltitudeFt: 6500,
      patternAltitudeAglFt: 1000,
      climbSpeedKtas: 80,
      climbRateFpm: 600,
      climbFuelFlowGph: 12,
      descentGroundspeedKt: 120,
      descentRateFpm: 500,
    });
    expect(climbDesc.climbTimeMin).toBe(10.0);
    expect(climbDesc.tocDistanceNm).toBe(13.3);
    expect(climbDesc.descentTimeMin).toBe(10.0);
    expect(climbDesc.todDistanceNm).toBe(20.0);

    const vSpeeds = AviationMath.calculateVSpeedsAndGlide({
      actualWeightLbs: 2100,
      maxWeightLbs: 2550,
      vaAtMaxWeightKias: 105,
      bestGlideKias: 68,
      glideRatio: 9.0,
      altitudeAglFt: 6000,
    });
    expect(vSpeeds.adjustedVaKias).toBeLessThan(105);
    expect(vSpeeds.stillAirGlideNm).toBeGreaterThan(8.5);
  });
});

