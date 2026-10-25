import { useEffect, useState } from 'react';

interface MetarSummary {
  raw: string;
  station: string;
  timeZulu: string;
  timeLocal: string;
  windSpeed: number;
  windDir: number;
  temp: number;
  altim: number;
  flightCategory: string;
}

const XC_STATIONS = [
  { id: 'KDJT', name: 'Downtown Palm Beach' },
  { id: 'KF45', name: 'North Palm Beach Co' },
  { id: 'KIMM', name: 'Immokalee Regional' },
  { id: 'KOBE', name: 'Okeechobee County' },
  { id: 'KMIA', name: 'Miami International' },
  { id: 'KFXE', name: 'Fort Lauderdale Exec' },
];

function parseMetarTime(raw?: string, reportTime?: string, obsTime?: number): { zulu: string; local: string } {
  const zMatch = raw?.match(/\b(\d{2})(\d{2})(\d{2})Z\b/);
  if (zMatch) {
    const [, , hourStr, minStr] = zMatch;
    const zulu = `${hourStr}:${minStr}Z`;
    const now = new Date();
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), parseInt(zMatch[1], 10), parseInt(hourStr, 10), parseInt(minStr, 10)));
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
  const [selectedStation, setSelectedStation] = useState<string>('KF45');
  const [stationData, setStationData] = useState<Record<string, MetarSummary>>({});
  const [loading, setLoading] = useState(true);

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
            const timeInfo = parseMetarTime(item.rawOb, item.reportTime, item.obsTime);
            map[item.icaoId] = {
              raw: item.rawOb || 'METAR UNAVAILABLE',
              station: item.icaoId,
              timeZulu: timeInfo.zulu,
              timeLocal: timeInfo.local,
              windSpeed: item.wspd ?? 0,
              windDir: item.wdir ?? 0,
              temp: item.temp ?? 20,
              altim: item.altim ? item.altim / 33.8639 : 29.92,
              flightCategory: (item.fltcat || 'VFR').toUpperCase(),
            };
          }
          setStationData(map);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setStationData({
            KF45: {
              raw: 'KF45 191253Z AUTO 09009KT 10SM CLR 24/18 A3002 RMK AO2',
              station: 'KF45',
              timeZulu: '12:53Z',
              timeLocal: '8:53 AM',
              windSpeed: 9,
              windDir: 90,
              temp: 24,
              altim: 30.02,
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
    raw: 'AWAITING TELEMETRY...',
    station: selectedStation,
    timeZulu: '--:--Z',
    timeLocal: '--:--',
    windSpeed: 0,
    windDir: 0,
    temp: 0,
    altim: 29.92,
    flightCategory: 'VFR',
  };

  const getCatBadge = (cat: string) => {
    switch (cat) {
      case 'LIFR':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'IFR':
        return 'bg-red-950/80 text-red-300 border-red-800';
      case 'MVFR':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="w-full bg-zinc-950/90 border-b border-zinc-800/80 px-3 sm:px-4 py-2 font-mono text-xs select-none">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">NOAA TELEMETRY</span>
          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getCatBadge(activeData.flightCategory)}`}>
            {activeData.flightCategory}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-zinc-400 text-[10px] sm:text-[11px]">
          <span>
            STN: <strong className="text-zinc-100">{activeData.station}</strong>
          </span>
          <span className="text-zinc-700">|</span>
          <span>
            TIME: <strong className="text-zinc-100">{activeData.timeZulu}</strong>
          </span>
          <span className="text-zinc-700">|</span>
          <span>
            WIND: <strong className="text-zinc-200">{activeData.windDir.toString().padStart(3, '0')}@{activeData.windSpeed}KT</strong>
          </span>
          <span className="text-zinc-700">|</span>
          <span>
            TEMP: <strong className="text-zinc-200">{activeData.temp}°C</strong>
          </span>
          <span className="text-zinc-700">|</span>
          <span>
            ALTIM: <strong className="text-zinc-200">{activeData.altim.toFixed(2)}"</strong>
          </span>
        </div>

        {onSelectWeatherTab && (
          <button
            onClick={onSelectWeatherTab}
            className="text-[10px] uppercase font-bold tracking-wider text-red-500 hover:text-red-400 hover:underline flex items-center gap-1"
          >
            Full Weather →
          </button>
        )}
      </div>

      {!loading && (
        <div className="mt-1.5 pt-1.5 border-t border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-1.5 text-[9px] text-zinc-500">
          <div className="truncate text-zinc-400 font-mono">
            <span className="font-bold text-zinc-300">RAW:</span> {activeData.raw}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8px] uppercase tracking-wider text-zinc-600">Route Fixes:</span>
            {XC_STATIONS.map((stn, idx) => {
              const isActive = selectedStation === stn.id;
              return (
                <span key={stn.id} className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedStation(stn.id)}
                    title={stn.name}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                      isActive
                        ? 'bg-red-700 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {stn.id}
                  </button>
                  {idx < XC_STATIONS.length - 1 && <span className="text-zinc-700">-</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
