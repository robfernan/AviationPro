import { useState } from 'react';
import { AlertCircle, Cloud, CloudRain, Gauge, Loader2, Thermometer } from 'lucide-react';
import React from 'react';
import { fetchAirportWeather } from '../utils/weatherService';
interface WeatherCalculatorProps {
  darkMode: boolean;
}

const WeatherCalculator: React.FC<WeatherCalculatorProps> = ({ darkMode }) => {
  const [icaoCode, setIcaoCode] = useState<string>('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [metar, setMetar] = useState<string>('');
  const [taf, setTaf] = useState<string>('');
  const [airportElevation, setAirportElevation] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [altimeterSetting, setAltimeterSetting] = useState<string>('29.92');
  const [dewPoint, setDewPoint] = useState<string>('');
  const [activeTool, setActiveTool] = useState<'density' | 'cloudbase'>('density');

  const fetchWeather = async () => {
    const code = icaoCode.trim().toUpperCase();

    if (!code) {
      setWeatherError('Enter a 4-letter ICAO code first');
      return;
    }

    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const weather = await fetchAirportWeather(code);

      if (weather.error) {
        setWeatherError(weather.error);
        return;
      }

      setMetar(weather.metar?.metar || 'No METAR returned for this airport');
      setTaf(weather.taf?.taf || 'No TAF returned for this airport');
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : 'Failed to fetch weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  const calculateDensityAltitude = () => {
    const elevation = parseFloat(airportElevation);
    const tempCelsius = parseFloat(temperature);
    const altimeter = parseFloat(altimeterSetting);

    if (isNaN(elevation) || isNaN(tempCelsius) || isNaN(altimeter)) {
      return null;
    }

    // Input validation for Celsius
    if (elevation < -1000 || elevation > 20000) {
      return { error: 'Airport elevation must be between -1,000 and 20,000 feet' };
    }
    if (tempCelsius < -60 || tempCelsius > 60) {
      return { error: 'Temperature must be between -60°C and 60°C' };
    }
    if (altimeter < 28.00 || altimeter > 32.00) {
      return { error: 'Altimeter setting must be between 28.00 and 32.00 inHg' };
    }

    // Pressure altitude calculation
    const pressureAltitude = elevation + (29.92 - altimeter) * 1000;

    // Density altitude calculation using Celsius
    // DA = PA + (120 * (OAT - ISA))
    // ISA temperature at pressure altitude = 15°C - (2°C per 1000 ft)
    const isaTempCelsius = 15 - (pressureAltitude / 1000) * 2;
    const densityAltitude = pressureAltitude + (120 * (tempCelsius - isaTempCelsius));

    return {
      pressureAltitude: Math.round(pressureAltitude),
      densityAltitude: Math.round(densityAltitude),
      isaDeviation: tempCelsius - isaTempCelsius
    };
  };

  const calculateCloudBase = () => {
    const temp = parseFloat(temperature);
    const dew = parseFloat(dewPoint);

    if (isNaN(temp) || isNaN(dew)) {
      return null;
    }

    // Cloud base formula: (Temperature - Dew Point) / 2.5 * 1000 feet
    const cloudBase = ((temp - dew) / 2.5) * 1000;
    return Math.round(cloudBase);
  };

  const clearInputs = () => {
    setAirportElevation('');
    setTemperature('');
    setAltimeterSetting('29.92');
    setDewPoint('');
  };

  const densityResults = calculateDensityAltitude();
  const cloudBaseResult = calculateCloudBase();

  return (
    <div className="rounded-lg shadow-lg border border-zinc-800 bg-black">
      <div className="bg-zinc-900 border-b border-zinc-800 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Cloud className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold">Weather Calculator</h2>
        </div>
        <p className="text-sm opacity-75">
          Calculate pressure/density altitude and cloud base for accurate flight planning.
        </p>
      </div>

      <div className="p-6">
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">ICAO Airport Code</label>
              <input
                type="text"
                maxLength={4}
                placeholder="KPHX"
                value={icaoCode}
                onChange={(e) => setIcaoCode(e.target.value.toUpperCase())}
                className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white focus:border-red-600 uppercase tracking-widest"
              />
            </div>
            <button
              onClick={fetchWeather}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-red-700 hover:bg-red-800 text-white text-sm font-black uppercase tracking-widest transition-colors"
            >
              {weatherLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              Fetch Weather
            </button>
          </div>

          {weatherError && (
            <div className="flex items-start gap-3 rounded-md border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-100">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
              <span>{weatherError}</span>
            </div>
          )}

          {(metar || taf) && !weatherError && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-md border border-zinc-800 bg-black p-3">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">METAR</div>
                <p className="text-sm text-zinc-200 break-words whitespace-pre-wrap">{metar}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-black p-3">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">TAF</div>
                <p className="text-sm text-zinc-200 break-words whitespace-pre-wrap">{taf}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tool Selector */}
        <div className="flex flex-wrap bg-black border border-zinc-800 rounded-sm overflow-hidden mb-6">
          <button
            onClick={() => setActiveTool('density')}
            className={`flex-1 min-w-[120px] py-4 px-4 text-[9px] font-black tracking-widest border-r border-zinc-800 transition-all ${
              activeTool === 'density'
                ? 'bg-red-700 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <Gauge className="w-4 h-4 inline mr-2" />
            Density Altitude
          </button>
          <button
            onClick={() => setActiveTool('cloudbase')}
            className={`flex-1 min-w-[120px] py-4 px-4 text-[9px] font-black tracking-widest transition-all ${
              activeTool === 'cloudbase'
                ? 'bg-red-700 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <Cloud className="w-4 h-4 inline mr-2" />
            Cloud Base
          </button>
        </div>

        {activeTool === 'density' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Gauge className="w-4 h-4 inline mr-2" />
                  Airport Elevation (ft)
                </label>
                <input
                  type="number"
                  placeholder="Enter airport elevation"
                  value={airportElevation}
                  onChange={(e) => setAirportElevation(e.target.value)}
                  className={`w-full p-3 border rounded-md ${
                    'bg-black border-zinc-800 text-white focus:border-red-600'
                  }`}
                  min="-1000"
                  max="20000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Thermometer className="w-4 h-4 inline mr-2" />
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className={`w-full p-3 border rounded-md ${
                    'bg-black border-zinc-800 text-white focus:border-red-600'
                  }`}
                  min="-60"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Gauge className="w-4 h-4 inline mr-2" />
                  Altimeter Setting (inHg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="29.92"
                  value={altimeterSetting}
                  onChange={(e) => setAltimeterSetting(e.target.value)}
                  className={`w-full p-3 border rounded-md ${
                    'bg-black border-zinc-800 text-white focus:border-red-600'
                  }`}
                  min="28.00"
                  max="32.00"
                />
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <button
                onClick={clearInputs}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  'bg-zinc-900 hover:bg-zinc-800 text-zinc-100'
                }`}
              >
                Clear All Inputs
              </button>
            </div>

            <div className="p-6 rounded-lg bg-zinc-900">
              <h4 className="text-lg font-semibold mb-4">Density Altitude Results</h4>
              {densityResults && !('error' in densityResults) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm opacity-75 mb-1">Pressure Altitude</div>
                      <div className="text-2xl font-bold text-red-500">
                        {densityResults.pressureAltitude.toLocaleString()} ft
                      </div>
                    </div>

                    <div>
                      <div className="text-sm opacity-75 mb-1">ISA Temperature Deviation</div>
                      <div className={`text-lg font-semibold ${
                        densityResults.isaDeviation > 0 ? 'text-red-500' : 'text-red-300'
                      }`}>
                        {densityResults.isaDeviation > 0 ? '+' : ''}{densityResults.isaDeviation.toFixed(1)}°C
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm opacity-75 mb-1">Density Altitude</div>
                      <div className="text-3xl font-bold text-red-500">
                        {densityResults.densityAltitude.toLocaleString()} ft
                      </div>
                    </div>

                    <div className="text-sm opacity-75">
                      <div className={`p-3 rounded-lg ${
                        densityResults.densityAltitude > 5000 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        densityResults.densityAltitude > 3000 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        {densityResults.densityAltitude > 5000 ? '⚠️ High density altitude - significant performance degradation' :
                         densityResults.densityAltitude > 3000 ? '⚠️ Moderate density altitude - monitor performance' :
                         '✓ Normal density altitude conditions'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : densityResults && 'error' in densityResults ? (
                <div className="text-center py-8">
                  <div className="text-red-600 dark:text-red-400 mb-2">⚠️ Input Error</div>
                  <div className="text-sm opacity-75">{densityResults.error}</div>
                </div>
              ) : (
                <div className="text-center py-8 opacity-50">
                  <Cloud className="w-16 h-16 mx-auto mb-4" />
                  <p>Enter airport elevation, temperature, and altimeter setting</p>
                </div>
              )}

              {densityResults && !('error' in densityResults) && (
                <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
                  <h5 className="font-medium mb-2 text-white">Performance Impact:</h5>
                  <div className="text-sm space-y-1 text-zinc-300">
                    <div>• Higher density altitude reduces engine power and propeller efficiency</div>
                    <div>• Takeoff distance increases, climb rate decreases</div>
                    <div>• Cruise speed may be lower than expected</div>
                    <div>• Landing distance may increase</div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-medium mb-2">Formulas Used:</h4>
                <div className="text-sm p-3 rounded bg-black font-mono space-y-2">
                  <div>PA = Elevation + (29.92 - Altimeter) × 1000</div>
                  <div>DA = PA + (120 × (OAT - ISA))</div>
                  <div>ISA = 15°C - (PA ÷ 1000) × 2°C</div>
                </div>
                <div className="text-xs mt-2 opacity-75">
                  PA = Pressure Altitude, DA = Density Altitude, OAT = Outside Air Temperature (°C), ISA = International Standard Atmosphere
                </div>
              </div>
            </div>
          </>
        )}

        {activeTool === 'cloudbase' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Thermometer className="w-4 h-4 inline mr-2" />
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <CloudRain className="w-4 h-4 inline mr-2" />
                  Dew Point (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter dew point"
                  value={dewPoint}
                  onChange={(e) => setDewPoint(e.target.value)}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white focus:border-red-600"
                />
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <button
                onClick={clearInputs}
                className="px-6 py-2 rounded-md text-sm font-medium transition-colors bg-zinc-900 hover:bg-zinc-800 text-zinc-100"
              >
                Clear Inputs
              </button>
            </div>

            <div className="p-6 rounded-lg bg-zinc-900">
              <h4 className="text-lg font-semibold mb-4">Cloud Base Result</h4>
              {cloudBaseResult !== null ? (
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-red-500">
                    {cloudBaseResult.toLocaleString()} ft
                  </div>
                  <div className="text-sm opacity-75">AGL Cloud Base</div>
                  <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> This is an approximation. Always check current METAR/TAF reports for official ceiling information.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 opacity-50">
                  <Cloud className="w-16 h-16 mx-auto mb-4" />
                  <p>Enter temperature and dew point to calculate cloud base</p>
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-medium mb-2">Formula Used:</h4>
                <div className="text-sm p-3 rounded bg-black font-mono">
                  Cloud Base = (Temp - Dew Point) / 2.5 × 1000 ft
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherCalculator;