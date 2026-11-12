import { useEffect, useState } from 'react';
import { useFlightStore } from '../core/flightStore';

interface MetarSummary {
  raw: string;
  station: string;
  timeZulu: string;
  timeLocal: string;
  windSpeed: number;
  windGust?: number;
  windDir: number;
  temp: number;
  altim: number;
  elevFt: number;
  flightCategory: string;
}

const XC_STATIONS = [
  { id: 'KPBI', name: 'Palm Beach Intl', elevFt: 19 },
  { id: 'KBCT', name: 'Boca Raton', elevFt: 13 },
  { id: 'KF45', name: 'North Palm Beach Co', elevFt: 22 },
  { id: 'KFXE', name: 'Fort Lauderdale Exec', elevFt: 13 },
  { id: 'KIMM', name: 'Immokalee Regional', elevFt: 37 },
  { id: 'KMIA', name: 'Miami International', elevFt: 9 },
];

function parseMetarTime(raw?: string, reportTime?: string, obsTime?: number): { zulu: string; local: string } {
  const zMatch = raw?.match(/\b(\d{2})(\d{2})(\d{2})Z\b/);
  if (zMatch) {
    const [, , hourStr, minStr] = zMatch;
    const zulu = `${hourStr}:${minStr}Z`;
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        parseInt(zMatch[1], 10),
        parseInt(hourStr, 10),
        parseInt(minStr, 10)
      )
    );
    const local = utcDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York',
    });
    return { zulu, local };
  }

  if (reportTime || obsTime) {
    const date = reportTime ? new Date(reportTime) : new Date((obsTime as number) * 1000);
    const zulu = `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}Z`;
    const local = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York',
    });
    return { zulu, local };
  }

  return { zulu: '12:53Z', local: '8:53 AM' };
}

interface TelemetryRibbonProps {
  onSelectWeatherTab?: () => void;
}

export default function AviationTelemetryRibbon({ onSelectWeatherTab }: TelemetryRibbonProps) {
  const flightStore = useFlightStore();
  const [selectedStation, setSelectedStation] = useState<string>('KPBI');
  const [stationData, setStationData] = useState<Record<string, MetarSummary>>({});
  const [loading, setLoading] = useState(true);
  const [syncedBadge, setSyncedBadge] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadMetars() {
      try {
        const stationIds = XC_STATIONS.map((s) => s.id).join(',');
        const res = await fetch(`https://aviationweather.gov/api/data/metar?ids=${stationIds}&format=json`);
        if (!res.ok) throw new Error('NOAA unavailable');
        const data = await res.json();

        if (isMounted && Array.isArray(data) && data.length > 0) {
          const map: Record<string, MetarSummary> = {};
          for (const item of data) {
            const stnMeta = XC_STATIONS.find((s) => s.id === item.icaoId);
            const timeInfo = parseMetarTime(item.rawOb, item.reportTime, item.obsTime);
            map[item.icaoId] = {
              raw: item.rawOb || 'METAR UNAVAILABLE',
              station: item.icaoId,
              timeZulu: timeInfo.zulu,
              timeLocal: timeInfo.local,
              windSpeed: item.wspd ?? 0,
              windGust: item.wgst ?? undefined,
              windDir: item.wdir ?? 360,
              temp: item.temp ?? 25,
              altim: item.altim ? Number((item.altim / 33.8639).toFixed(2)) : 29.92,
              elevFt: stnMeta?.elevFt ?? 19,
              flightCategory: (item.fltcat || 'VFR').toUpperCase(),
            };
          }
          setStationData(map);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setStationData({
            KPBI: {
              raw: 'KPBI 121653Z 12012G18KT 10SM FEW035 25/18 A2992 RMK AO2',
              station: 'KPBI',
              timeZulu: '16:53Z',
              timeLocal: '11:53 AM',
              windSpeed: 12,
              windGust: 18,
              windDir: 120,
              temp: 25,
              altim: 29.92,
              elevFt: 19,
              flightCategory: 'VFR',
            },
          });
          setLoading(false);
        }
      }
    }

    loadMetars();
    const interval = setInterval(loadMetars, 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeData = stationData[selectedStation] || {
    raw: `${selectedStation} 121653Z 12012G18KT 10SM FEW035 25/18 A2992`,
    station: selectedStation,
    timeZulu: '16:53Z',
    timeLocal: '11:53 AM',
    windSpeed: flightStore.windSpeed,
    windGust: flightStore.windGust,
    windDir: flightStore.windDirection,
    temp: flightStore.temperatureC,
    altim: flightStore.altimeterInHg,
    elevFt: flightStore.fieldElevationFt,
    flightCategory: 'VFR',
  };

  const applyStationToDesk = (stnId: string) => {
    setSelectedStation(stnId);
    const data = stationData[stnId];
    const meta = XC_STATIONS.find((s) => s.id === stnId);
    flightStore.setDepartureAirport(stnId);
    if (meta) {
      flightStore.setFieldElevation(meta.elevFt);
    }
    if (data) {
      flightStore.setWind(data.windDir || 360, data.windSpeed, data.windGust);
      flightStore.setTemperature(data.temp);
      flightStore.setAltimeter(data.altim);
    }
    setSyncedBadge(true);
    setTimeout(() => setSyncedBadge(false), 1800);
  };

  const getCatBadge = (cat: string) => {
    switch (cat) {
      case 'LIFR':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'IFR':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'MVFR':
        return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border-b border-slate-800/80 px-2.5 sm:px-5 py-1.5 sm:py-2 text-xs select-none shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-x-2 sm:gap-x-3 gap-y-1">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-slate-300 uppercase">METAR</span>
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono ${getCatBadge(activeData.flightCategory)}`}>
            {activeData.flightCategory}
          </span>
          {syncedBadge && (
            <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/80 border border-sky-800/60 px-1.5 py-0.5 rounded">
              Synced
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-400 text-[10px] sm:text-[11px] font-mono">
          <span>
            <strong className="text-slate-100">{activeData.station}</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            <strong className="text-slate-100">
              {flightStore.windDirection.toString().padStart(3, '0')}°/{flightStore.windSpeed}
              {flightStore.windGust ? `G${flightStore.windGust}` : ''}KT
            </strong>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            <strong className="text-slate-100">{flightStore.temperatureC}°C</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            <strong className="text-slate-100">{flightStore.altimeterInHg.toFixed(2)}"</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            PA <strong className="text-sky-400">{flightStore.getPressureAltitude() ?? '--'}'</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            DA <strong className="text-sky-400">{flightStore.getDensityAltitude().exactFt ?? '--'}'</strong>
          </span>
        </div>

        {onSelectWeatherTab && (
          <button
            onClick={onSelectWeatherTab}
            className="hidden sm:flex text-[11px] font-semibold tracking-wide text-sky-400 hover:text-sky-300 items-center gap-1 shrink-0"
          >
            Weather & DA →
          </button>
        )}
      </div>

      {!loading && (
        <div className="mt-1 pt-1 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
          <div className="hidden sm:block truncate font-mono text-slate-400 max-w-[55%] lg:max-w-[65%]">
            <span className="font-semibold text-slate-300">RAW:</span> {activeData.raw}
          </div>

          <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mr-1">
              Quick WX:
            </span>
            <div className="flex items-center gap-1">
              {XC_STATIONS.map((stn) => {
                const isActive = flightStore.departureAirport === stn.id;
                return (
                  <button
                    key={stn.id}
                    type="button"
                    onClick={() => applyStationToDesk(stn.id)}
                    title={`${stn.name} (${stn.elevFt} ft MSL)`}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {stn.id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
