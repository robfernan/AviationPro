// NOAA Aviation Weather Center integration
// Fetches METAR and TAF data for flight planning

interface METARData {
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

interface TAFData {
  icao: string;
  taf: string;
  issuedTime: string;
  validStart: string;
  validEnd: string;
}

interface WeatherResponse {
  metar?: METARData;
  taf?: TAFData;
  error?: string;
}

// Cache for weather data to avoid hitting API limits
const weatherCache = new Map<string, { data: WeatherResponse; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch METAR data from NOAA Aviation Weather Center
 * Uses the free API at api.aviationweather.gov
 */
export async function fetchMETAR(icaoCode: string): Promise<METARData | null> {
  const cacheKey = `metar-${icaoCode.toUpperCase()}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data.metar || null;
  }

  try {
    const response = await fetch(
      `https://api.aviationweather.gov/data/metar?ids=${icaoCode.toUpperCase()}&format=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // NOAA returns array, take first result
    if (data && Array.isArray(data) && data.length > 0) {
      const metarData = data[0];

      // Parse the METAR string to extract key information
      const parsed = parseMETAR(metarData.rawOb);

      const result: METARData = {
        icao: icaoCode.toUpperCase(),
        metar: metarData.rawOb,
        wind: {
          direction: metarData.wdir?.value || 0,
          speed: metarData.wspd?.value || 0,
          gust: metarData.wgst?.value,
        },
        visibility: {
          value: metarData.prevail?.value || 10,
          unit: 'SM',
        },
        temperature: metarData.temp?.value || 0,
        dewpoint: metarData.dewpt?.value || 0,
        altimeter: metarData.altim?.value || 0,
        flightCategory: (metarData.flightCategory || 'VFR') as METARData['flightCategory'],
        timestamp: metarData.obsTime?.value || new Date().toISOString(),
      };

      // Cache the result
      weatherCache.set(cacheKey, {
        data: { metar: result },
        timestamp: Date.now(),
      });

      return result;
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch METAR for ${icaoCode}:`, error);
    return null;
  }
}

/**
 * Fetch TAF (Terminal Aerodrome Forecast) data
 */
export async function fetchTAF(icaoCode: string): Promise<TAFData | null> {
  const cacheKey = `taf-${icaoCode.toUpperCase()}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data.taf || null;
  }

  try {
    const response = await fetch(
      `https://api.aviationweather.gov/data/taf?ids=${icaoCode.toUpperCase()}&format=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && Array.isArray(data) && data.length > 0) {
      const tafData = data[0];

      const result: TAFData = {
        icao: icaoCode.toUpperCase(),
        taf: tafData.rawTAF,
        issuedTime: tafData.issueTime?.value || new Date().toISOString(),
        validStart: tafData.validTimeFrom?.value || '',
        validEnd: tafData.validTimeTo?.value || '',
      };

      // Cache the result
      weatherCache.set(cacheKey, {
        data: { taf: result },
        timestamp: Date.now(),
      });

      return result;
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch TAF for ${icaoCode}:`, error);
    return null;
  }
}

/**
 * Fetch both METAR and TAF for a given airport
 */
export async function fetchAirportWeather(icaoCode: string): Promise<WeatherResponse> {
  try {
    const [metar, taf] = await Promise.all([
      fetchMETAR(icaoCode),
      fetchTAF(icaoCode),
    ]);

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

/**
 * Simple METAR parser to extract basic information
 * This is a simplified version; a full parser would handle all METAR codes
 */
function parseMETAR(metarString: string): {
  ceiling?: number;
  visibility?: number;
} {
  const result: { ceiling?: number; visibility?: number } = {};

  // Look for ceiling height (e.g., "BKN025" = broken clouds at 2500ft)
  const ceilingMatch = metarString.match(/(OVC|BKN)(\d{3})/);
  if (ceilingMatch) {
    result.ceiling = parseInt(ceilingMatch[2]) * 100; // Convert to feet
  }

  // Look for visibility (e.g., "10SM" = 10 statute miles)
  const visMatch = metarString.match(/(\d+)SM/);
  if (visMatch) {
    result.visibility = parseInt(visMatch[1]);
  }

  return result;
}

/**
 * Clear the weather cache (useful for manual refresh)
 */
export function clearWeatherCache(): void {
  weatherCache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getWeatherCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: weatherCache.size,
    keys: Array.from(weatherCache.keys()),
  };
}
