import { useSyncExternalStore } from 'react';
import sampleAircrafts from '../data/sampleAircrafts.json';
import { AviationMath, CrosswindResult, DensityAltitudeResult } from './aviationMath';

export interface AircraftProfile {
  id: string;
  name: string;
  emptyWeight: number;
  emptyArm: number;
  emptyMoment?: number;
  cgArm?: number;
  maxWeight: number;
  maxTakeoff?: number;
  maxLanding?: number;
  forwardCG: number;
  aftCG: number;
  fuelArm: number;
  fuelCapacityGal: number;
  usableFuelGal?: number;
  fuelWeightLbs?: number;
  fuelBurnGPH?: number;
  notes?: string;
}

export type SafetyStatus = 'OK' | 'EXCEEDS' | 'NO LIMIT SET';

export interface CrosswindEvaluation extends CrosswindResult {
  status: SafetyStatus;
}

export interface FlightState {
  // --- Active Aircraft Profile ---
  selectedAircraftId: string;
  aircraftList: AircraftProfile[];
  currentAircraft: AircraftProfile;
  setAircraft: (id: string) => void;

  // --- Active Flight & Atmospheric Conditions ---
  departureAirport: string;
  destinationAirport: string;
  runwayHeading: number; // 37 - 360 (0 normalized to 360)
  windDirection: number; // 1 - 360 (0 normalized to 360)
  windSpeed: number;     // knots (>= 0)
  windGust?: number;     // knots (> windSpeed or undefined)
  altimeterInHg: number; // e.g. 29.92
  temperatureC: number;  // OAT in Celsius
  fieldElevationFt: number; // MSL in feet

  // --- Pilot Personal & Endorsement Limits ---
  pilotMaxCrosswindKnots?: number;
  pilotMaxTailwindKnots?: number;

  // --- Actions ---
  setDepartureAirport: (icao: string) => void;
  setDestinationAirport: (icao: string) => void;
  setRunwayHeading: (hdg: number) => void;
  setWind: (dir: number, spd: number, gust?: number) => void;
  setAltimeter: (alt: number) => void;
  setTemperature: (temp: number) => void;
  setFieldElevation: (elev: number) => void;
  setPilotLimits: (crosswindLimit?: number, tailwindLimit?: number) => void;

  // --- Computed Pre-Flight Helpers (Delegated to aviationMath) ---
  getCrosswindComponent: () => CrosswindEvaluation;
  getPressureAltitude: () => number | null;
  getDensityAltitude: () => DensityAltitudeResult;
}

const initialAircrafts: AircraftProfile[] = sampleAircrafts as AircraftProfile[];

type Listener = () => void;
const listeners = new Set<Listener>();

function normalizeHeading360(deg: number): number {
  const norm = ((deg % 360) + 360) % 360;
  return norm === 0 ? 360 : norm;
}

let state: FlightState;

function setState(partial: Partial<FlightState>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

state = {
  selectedAircraftId: initialAircrafts[0]?.id || 'c172',
  aircraftList: initialAircrafts,
  currentAircraft: initialAircrafts[0],

  departureAirport: 'KPBI',
  destinationAirport: 'KBCT',
  runwayHeading: 100,
  windDirection: 120,
  windSpeed: 12,
  windGust: 18,
  altimeterInHg: 29.92,
  temperatureC: 25,
  fieldElevationFt: 19,

  pilotMaxCrosswindKnots: undefined,
  pilotMaxTailwindKnots: undefined,

  setAircraft: (id: string) => {
    const found = state.aircraftList.find((a) => a.id === id);
    if (found) {
      setState({ selectedAircraftId: id, currentAircraft: found });
    }
  },

  setDepartureAirport: (icao: string) => setState({ departureAirport: icao.toUpperCase() }),
  setDestinationAirport: (icao: string) => setState({ destinationAirport: icao.toUpperCase() }),

  setRunwayHeading: (hdg: number) => {
    if (!Number.isFinite(hdg)) return;
    // Normalize 0 to 360; keep 1-36 intact so calculateCrosswind can reject 1-36 explicitly if passed
    if (hdg >= 1 && hdg <= 36) {
      setState({ runwayHeading: hdg });
      return;
    }
    setState({ runwayHeading: normalizeHeading360(hdg) });
  },

  setWind: (dir: number, spd: number, gust?: number) => {
    if (!Number.isFinite(dir) || !Number.isFinite(spd)) return;
    const normDir = normalizeHeading360(dir);
    const validSpd = Math.max(0, spd);
    const validGust = gust !== undefined && Number.isFinite(gust) && gust > validSpd ? gust : undefined;
    setState({
      windDirection: normDir,
      windSpeed: validSpd,
      windGust: validGust
    });
  },

  setAltimeter: (alt: number) => setState({ altimeterInHg: alt }),
  setTemperature: (temp: number) => setState({ temperatureC: temp }),
  setFieldElevation: (elev: number) => setState({ fieldElevationFt: elev }),

  setPilotLimits: (crosswindLimit?: number, tailwindLimit?: number) =>
    setState({
      pilotMaxCrosswindKnots: crosswindLimit,
      pilotMaxTailwindKnots: tailwindLimit
    }),

  getCrosswindComponent: (): CrosswindEvaluation => {
    const { runwayHeading, windDirection, windSpeed, windGust, pilotMaxCrosswindKnots, pilotMaxTailwindKnots } = state;
    const res = AviationMath.calculateCrosswind(runwayHeading, windDirection, windSpeed, windGust);

    if (res.error || res.crosswindKt === null || res.tailwindKt === null) {
      return {
        ...res,
        status: 'NO LIMIT SET'
      };
    }

    // Status is NO LIMIT SET only when BOTH limits are undefined
    if (pilotMaxCrosswindKnots === undefined && pilotMaxTailwindKnots === undefined) {
      return {
        ...res,
        status: 'NO LIMIT SET'
      };
    }

    const effectiveCrosswind = res.gustCrosswindKt !== undefined ? res.gustCrosswindKt : res.crosswindKt;
    const crosswindExceeded =
      pilotMaxCrosswindKnots !== undefined && effectiveCrosswind > pilotMaxCrosswindKnots;
    const tailwindExceeded =
      pilotMaxTailwindKnots !== undefined && res.tailwindKt > pilotMaxTailwindKnots;

    const status: SafetyStatus = crosswindExceeded || tailwindExceeded ? 'EXCEEDS' : 'OK';

    return {
      ...res,
      status
    };
  },

  getPressureAltitude: () => {
    const { fieldElevationFt, altimeterInHg } = state;
    return AviationMath.calculatePressureAltitude(fieldElevationFt, altimeterInHg);
  },

  getDensityAltitude: () => {
    const pa = state.getPressureAltitude();
    if (pa === null) {
      return { exactFt: null, ruleOfThumbFt: null, error: 'Invalid pressure altitude' };
    }
    return AviationMath.calculateDensityAltitude(pa, state.temperatureC);
  }
};

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): FlightState {
  return state;
}

export const useFlightStore = Object.assign(
  function useFlightStoreHook(): FlightState {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  },
  {
    getState: (): FlightState => state,
    setState,
    subscribe
  }
);
