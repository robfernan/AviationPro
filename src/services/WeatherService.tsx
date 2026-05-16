// src/services/WeatherService.ts
import { WeatherReport } from '../types/aviation';

export const WeatherService = {
  fetchMetar: async (icao: string): Promise<WeatherReport> => {
    const code = icao.toUpperCase().trim();
    const timestamp = new Date().toLocaleTimeString();

    try {
      // 1. Check if we are running in Wails (Desktop)
      const wails = (window as any).go?.main?.App;
      
      if (wails) {
        // Call the Go backend function we just wrote in app.go
        const raw = await wails.GetWeather(code);
        return {
          raw,
          icao: code,
          timestamp,
          isOffline: raw.includes("ERROR") || raw.includes("OFFLINE")
        };
      }

      // 2. Fallback for Web/Mobile
      const response = await fetch(`https://aviationweather.gov/api/data/metar?ids=${code}`);
      const text = await response.text();
      return { raw: text, icao: code, timestamp, isOffline: false };

    } catch (err) {
      return { raw: "FETCH_FAILED", icao: code, timestamp, isOffline: true };
    }
  }
};