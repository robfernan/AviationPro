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
  origin: string;
  destination: string;
  route: string;
  duration: number;
  aircraftId?: number;
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