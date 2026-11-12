export interface Aircraft {
  id?: number;
  tailNumber: string;
  model: string;
  emptyWeight: number;
  emptyArm: number;
  maxGrossWeight: number;
}

export interface FlightLog {
  id?: number;
  date: string;
  aircraftNNumber: string;
  flightTime: string;
  night: boolean;
  crossCountry: boolean;
  solo: boolean;
  dual: boolean;
  notes: string;
  timestamp: number;
}

export interface WCAResult {
  heading: number;
  groundSpeed: number;
  windCorrectionAngle: number;
  error?: string;
}

export interface WeatherReport {
  raw: string;
  icao: string;
  timestamp: string;
  isOffline: boolean;
}