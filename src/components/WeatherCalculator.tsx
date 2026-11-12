import React, { useState } from 'react';
import { AlertCircle, Cloud, CloudRain, Gauge, Loader2, Thermometer, Check, Copy } from 'lucide-react';
import { fetchAirportWeather } from '../utils/weatherService';
import { useFlightStore } from '../core/flightStore';
import { buildPreflightNotes, copyPreflightNotesToClipboard } from '../core/preflightNotes';

interface WeatherCalculatorProps {
  darkMode: boolean;
}

const WeatherCalculator: React.FC<WeatherCalculatorProps> = () => {
  const flightStore = useFlightStore();
  const [icaoCode, setIcaoCode] = useState<string>(flightStore.departureAirport || 'KPBI');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [metar, setMetar] = useState<string>('');
  const [taf, setTaf] = useState<string>('');
  const [flightCategory, setFlightCategory] = useState<'VFR' | 'MVFR' | 'IFR' | 'LIFR' | null>(null);
  const [dewPoint, setDewPoint] = useState<string>('18');
  const [activeTool, setActiveTool] = useState<'density' | 'cloudbase'>('density');
  const [copied, setCopied] = useState(false);

  const handleCopyNotes = async () => {
    const notes = buildPreflightNotes(flightStore);
    const ok = await copyPreflightNotesToClipboard(notes);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const fetchWeather = async () => {
    const code = icaoCode.trim().toUpperCase();

    if (!code) {
      setWeatherError('Enter a 4-letter ICAO code first');
      return;
    }

    setWeatherLoading(true);
    setWeatherError(null);
    flightStore.setDepartureAirport(code);

    try {
      const weather = await fetchAirportWeather(code);

      if (weather.error) {
        setWeatherError(weather.error);
        return;
      }

      const rawMetar = weather.metar?.metar || 'No METAR returned for this airport';
      setMetar(rawMetar);
      setTaf(weather.taf?.taf || 'No TAF returned for this airport');
      setFlightCategory(weather.metar?.flightCategory || null);

      // Parse wind, temperature, and altimeter from fetched METAR into global flightStore
      const windMatch = rawMetar.match(/\b(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT\b/);
      if (windMatch) {
        const dir = windMatch[1] === 'VRB' ? 360 : parseInt(windMatch[1], 10);
        const spd = parseInt(windMatch[2], 10);
        const gst = windMatch[3] ? parseInt(windMatch[3], 10) : undefined;
        flightStore.setWind(dir, spd, gst);
      }

      const tempMatch = rawMetar.match(/\b(M?\d{2})\/(M?\d{2})\b/);
      if (tempMatch) {
        const parseMetarTemp = (s: string) => (s.startsWith('M') ? -parseInt(s.slice(1), 10) : parseInt(s, 10));
        flightStore.setTemperature(parseMetarTemp(tempMatch[1]));
        setDewPoint(String(parseMetarTemp(tempMatch[2])));
      }

      const altMatch = rawMetar.match(/\bA(\d{4})\b/);
      if (altMatch) {
        flightStore.setAltimeter(parseInt(altMatch[1], 10) / 100);
      }
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : 'Failed to fetch weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  const pa = flightStore.getPressureAltitude();
  const da = flightStore.getDensityAltitude();
  const isaTemp = pa !== null ? 15 - (pa / 1000) * 2 : null;
  const isaDeviation = isaTemp !== null ? flightStore.temperatureC - isaTemp : null;

  const calculateCloudBase = (): number | null => {
    const temp = flightStore.temperatureC;
    const dew = parseFloat(dewPoint);
    if (!Number.isFinite(temp) || !Number.isFinite(dew)) {
      return null;
    }
    return Math.round(((temp - dew) / 2.5) * 1000);
  };

  const cloudBaseResult = calculateCloudBase();

  const resetStandardAtmosphere = () => {
    flightStore.setFieldElevation(19);
    flightStore.setTemperature(15);
    flightStore.setAltimeter(29.92);
    setDewPoint('10');
  };

  return (
    <div className="rounded-xl shadow-xl border border-slate-800/80 bg-slate-950/90 overflow-hidden">
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Weather, Altimetry & Density Altitude</h2>
            <p className="text-xs text-slate-400">
              Live METAR/TAF lookup and exact ISA atmospheric calculations synced across all calculators.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyNotes}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md border border-slate-700 transition-all active:scale-95"
          title="Copy preflight notes"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy preflight notes'}</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Airport Weather Lookup Card */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Departure / Reference ICAO Code
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="KPBI"
                value={icaoCode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setIcaoCode(val);
                  if (val.length >= 3) flightStore.setDepartureAirport(val);
                }}
                className="w-full p-2.5 border rounded-md bg-slate-950 border-slate-800 text-slate-100 font-mono uppercase tracking-widest"
              />
            </div>
            <button
              onClick={fetchWeather}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              {weatherLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              Fetch METAR & Sync Desk
            </button>
          </div>

          {weatherError && (
            <div className="flex items-start gap-3 rounded-md border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              <span>{weatherError}</span>
            </div>
          )}

          {(metar || taf) && !weatherError && (
            <div className="space-y-3 pt-2">
              {flightCategory && (
                <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-md">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Flight Category:</div>
                  <div
                    className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                      flightCategory === 'VFR'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : flightCategory === 'MVFR'
                        ? 'bg-sky-950/80 text-sky-400 border border-sky-800/60'
                        : flightCategory === 'IFR'
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                        : 'bg-purple-950/80 text-purple-400 border border-purple-800/60'
                    }`}
                  >
                    {flightCategory}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">METAR</div>
                  <p className="text-xs font-mono text-slate-200 break-words whitespace-pre-wrap">{metar}</p>
                </div>
                <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">TAF</div>
                  <p className="text-xs font-mono text-slate-200 break-words whitespace-pre-wrap">{taf}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sub-Tool Selector */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1 max-w-md">
          <button
            onClick={() => setActiveTool('density')}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTool === 'density'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Density & Pressure Altitude
          </button>
          <button
            onClick={() => setActiveTool('cloudbase')}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTool === 'cloudbase'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Cloud Base (AGL)
          </button>
        </div>

        {activeTool === 'density' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  <Gauge className="w-3.5 h-3.5 inline mr-1.5 text-sky-400" />
                  Field Elevation (ft MSL)
                </label>
                <input
                  type="number"
                  value={flightStore.fieldElevationFt}
                  onChange={(e) => flightStore.setFieldElevation(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border rounded-md font-mono text-base"
                  min="-1000"
                  max="20000"
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  <Thermometer className="w-3.5 h-3.5 inline mr-1.5 text-sky-400" />
                  Outside Air Temp (°C)
                </label>
                <input
                  type="number"
                  step="1"
                  value={flightStore.temperatureC}
                  onChange={(e) => flightStore.setTemperature(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border rounded-md font-mono text-base"
                  min="-60"
                  max="60"
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  <Gauge className="w-3.5 h-3.5 inline mr-1.5 text-sky-400" />
                  Altimeter Setting (inHg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={flightStore.altimeterInHg}
                  onChange={(e) => flightStore.setAltimeter(parseFloat(e.target.value) || 29.92)}
                  className="w-full p-2.5 border rounded-md font-mono text-base"
                  min="25.00"
                  max="35.00"
                />
              </div>
            </div>

            {/* Results Readout Card */}
            <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Computed Atmospheric Performance
                </h4>
                <button
                  onClick={resetStandardAtmosphere}
                  className="px-3 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Reset to Standard (29.92" / 15°C)
                </button>
              </div>

              {da.error || da.exactFt === null || pa === null ? (
                <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-200 text-sm font-semibold">
                  {da.error || 'Invalid atmospheric parameters'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Pressure Altitude
                    </div>
                    <div className="text-2xl font-bold font-mono text-slate-100">{pa.toLocaleString()} FT</div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950 border border-sky-500/40">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 mb-1">
                      Exact Density Altitude
                    </div>
                    <div className="text-2xl font-bold font-mono text-sky-400">{da.exactFt.toLocaleString()} FT</div>
                    <div className="text-[10px] text-slate-400 mt-1">Primary Exact ISA Method</div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      120 Rule Cross-Check
                    </div>
                    <div className="text-2xl font-bold font-mono text-slate-200">
                      {da.ruleOfThumbFt !== null ? `${da.ruleOfThumbFt.toLocaleString()} FT` : '--'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">PA + 120 × (OAT − ISA)</div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      ISA Temp Deviation
                    </div>
                    <div
                      className={`text-2xl font-bold font-mono ${
                        isaDeviation && isaDeviation > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {isaDeviation !== null
                        ? `${isaDeviation > 0 ? '+' : ''}${isaDeviation.toFixed(1)}°C`
                        : '--'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Std Temp: {isaTemp !== null ? `${isaTemp.toFixed(1)}°C` : '--'}
                    </div>
                  </div>
                </div>
              )}

              {da.exactFt !== null && (
                <div
                  className={`p-3.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                    da.exactFt > 5000
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      : da.exactFt > 3000
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                      : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  }`}
                >
                  <span>
                    {da.exactFt > 5000
                      ? 'High Density Altitude: Expect longer takeoff roll and reduced climb performance. Consult POH.'
                      : da.exactFt > 3000
                      ? 'Moderate Density Altitude: Monitor takeoff roll and leaning procedures per POH.'
                      : 'Standard / Low Density Altitude: Normal aircraft performance expected.'}
                  </span>
                  <span className="font-mono font-bold uppercase ml-4 shrink-0">
                    {da.exactFt > 5000 ? 'HIGH DA' : da.exactFt > 3000 ? 'MODERATE DA' : 'NOMINAL'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTool === 'cloudbase' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  <Thermometer className="w-3.5 h-3.5 inline mr-1.5 text-sky-400" />
                  Outside Air Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={flightStore.temperatureC}
                  onChange={(e) => flightStore.setTemperature(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border rounded-md font-mono text-base"
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  <CloudRain className="w-3.5 h-3.5 inline mr-1.5 text-sky-400" />
                  Dew Point (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={dewPoint}
                  onChange={(e) => setDewPoint(e.target.value)}
                  className="w-full p-2.5 border rounded-md font-mono text-base"
                />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Estimated Cloud Base (AGL)
              </div>
              <div className="text-3xl font-bold font-mono text-sky-400">
                {cloudBaseResult !== null ? `${cloudBaseResult.toLocaleString()} FT AGL` : '--'}
              </div>
              <p className="text-xs text-slate-400 pt-1">
                Formula: <code className="font-mono text-slate-300">((Temperature − Dew Point) / 2.5) × 1,000 ft</code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherCalculator;