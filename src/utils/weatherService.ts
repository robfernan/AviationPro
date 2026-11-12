/**
 * NOAA Aviation Weather Center integration
 * Fetches METAR and TAF data for flight planning with 30-minute caching and Wails/Web support.
 */
import { isNative, isWails } from './platform';

export interface METARData {
  icao: string;
  metar: string;
  wind: {
    direction: number;
    speed: number;
    gust?: number;
  };
  visibility: {
    value: number;
    unit: string;
  };
  temperature: number;
  dewpoint: number;
  altimeter: number;
  ceiling?: number;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  timestamp: string;
}

export interface TAFData {
  icao: string;
  taf: string;
  issuedTime: string;
  validStart: string;
  validEnd: string;
}

export interface WeatherResponse {
  metar?: METARData;
  taf?: TAFData;
  error?: string;
}

const weatherCache = new Map<string, { data: WeatherResponse; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const getWeatherUrls = (path: string, icaoCode: string): string[] => {
  const code = icaoCode.toUpperCase().trim();
  const target = `https://aviationweather.gov/api/data/${path}?ids=${code}&format=json`;
  if (isNative || isWails) {
    return [target];
  }
  return [
    `/aviationweather/api/data/${path}?ids=${code}&format=json`,
    target,
    `https://corsproxy.io/?url=${encodeURIComponent(target)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
  ];
};

async function fetchJsonWithFallback(urls: string[]): Promise<any> {
  let lastErr: unknown;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      lastErr = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Weather endpoint unreachable');
}

export async function fetchMETAR(icaoCode: string): Promise<METARData | null> {
  const code = icaoCode.toUpperCase().trim();
  const cacheKey = `metar-${code}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION && cached.data.metar) {
    return cached.data.metar;
  }

  try {
    const data = await fetchJsonWithFallback(getWeatherUrls('metar', code));

    if (data && Array.isArray(data) && data.length > 0) {
      const metarData = data[0];
      const category = (metarData.fltcat || metarData.flightCategory || 'VFR').toUpperCase() as METARData['flightCategory'];

      // Update Native Watch Bridge if available on Android Wear companion
      if (isNative && typeof window !== 'undefined' && (window as any).AndroidWatchBridge) {
        (window as any).AndroidWatchBridge.updateWatchWeather(category);
      }

      const rawAltim = typeof metarData.altim === 'number' ? metarData.altim : metarData.altim?.value || 29.92;
      const altimInHg = rawAltim > 100 ? Number((rawAltim / 33.8639).toFixed(2)) : Number(rawAltim.toFixed(2));

      const result: METARData = {
        icao: code,
        metar: metarData.rawOb || '',
        wind: {
          direction: typeof metarData.wdir === 'number' ? metarData.wdir : metarData.wdir?.value || 0,
          speed: typeof metarData.wspd === 'number' ? metarData.wspd : metarData.wspd?.value || 0,
          gust: typeof metarData.wgst === 'number' ? metarData.wgst : metarData.wgst?.value,
        },
        visibility: {
          value: typeof metarData.visib === 'number' ? metarData.visib : metarData.prevail?.value || 10,
          unit: 'SM',
        },
        temperature: typeof metarData.temp === 'number' ? metarData.temp : metarData.temp?.value || 15,
        dewpoint: typeof metarData.dewp === 'number' ? metarData.dewp : metarData.dewpt?.value || 10,
        altimeter: altimInHg,
        flightCategory: category,
        timestamp: metarData.reportTime || metarData.obsTime?.value || new Date().toISOString(),
      };

      weatherCache.set(cacheKey, {
        data: { metar: result },
        timestamp: Date.now(),
      });

      return result;
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch METAR for ${code}:`, error);
    return null;
  }
}

export async function fetchTAF(icaoCode: string): Promise<TAFData | null> {
  const code = icaoCode.toUpperCase().trim();
  const cacheKey = `taf-${code}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION && cached.data.taf) {
    return cached.data.taf;
  }

  try {
    const data = await fetchJsonWithFallback(getWeatherUrls('taf', code));

    if (data && Array.isArray(data) && data.length > 0) {
      const tafData = data[0];

      const result: TAFData = {
        icao: code,
        taf: tafData.rawTAF || '',
        issuedTime: tafData.issueTime || tafData.issueTime?.value || new Date().toISOString(),
        validStart: String(tafData.validTimeFrom || tafData.validTimeFrom?.value || ''),
        validEnd: String(tafData.validTimeTo || tafData.validTimeTo?.value || ''),
      };

      weatherCache.set(cacheKey, {
        data: { taf: result },
        timestamp: Date.now(),
      });

      return result;
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch TAF for ${code}:`, error);
    return null;
  }
}

export async function fetchAirportWeather(icaoCode: string): Promise<WeatherResponse> {
  try {
    const [metar, taf] = await Promise.all([fetchMETAR(icaoCode), fetchTAF(icaoCode)]);

    if (!metar && !taf) {
      return {
        error: `No live weather report returned for ${icaoCode.toUpperCase()}. Verify the 4-letter ICAO code.`,
      };
    }

    return {
      metar: metar || undefined,
      taf: taf || undefined,
    };
  } catch (error) {
    return {
      error: `Failed to fetch weather: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export function clearWeatherCache(): void {
  weatherCache.clear();
}

export function getWeatherCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: weatherCache.size,
    keys: Array.from(weatherCache.keys()),
  };
}
