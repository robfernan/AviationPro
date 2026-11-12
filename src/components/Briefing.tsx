import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, AlertCircle, RefreshCw, Share2, Check } from 'lucide-react';
import { generateBriefingPDF } from '../utils/briefingBuilder';
import { downloadForeFlightFPL } from '../utils/fplExport';
import { fetchAirportWeather } from '../utils/weatherService';
import { db } from '../services/PersistenceService';
import { Aircraft } from '../types/aviation';
import { useFlightStore } from '../core/flightStore';
import { buildPreflightNotes, copyPreflightNotesToClipboard } from '../core/preflightNotes';

interface BriefingComponentProps {
  darkMode: boolean;
}

const Briefing: React.FC<BriefingComponentProps> = () => {
  const flightStore = useFlightStore();
  const [hangar, setHangar] = useState<Aircraft[]>([]);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [briefingData, setBriefingData] = useState({
    date: new Date().toISOString().split('T')[0],
    departureAirport: flightStore.departureAirport || 'KPBI',
    arrivalAirport: flightStore.destinationAirport || 'KBCT',
    aircraftType: flightStore.currentAircraft?.name || 'Cessna 172S',
    nNumber: '',
    pilot: '',
    metar: '',
    taf: '',
    notams: '',
    fuelPlan: {
      totalDistance: '120',
      totalTime: '1.1',
      fuelBurned: String(((flightStore.currentAircraft?.fuelBurnGPH || 8.5) * 1.1).toFixed(1)),
      reserve: String(((flightStore.currentAircraft?.fuelBurnGPH || 8.5) * 0.75).toFixed(1)),
    },
    weightBalance: {
      rampWeight: '',
      takeoffWeight: '',
      cg: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const loadHangar = async () => {
      const planes = await db.getAllAircraft();
      setHangar(planes);
    };
    loadHangar();
  }, []);

  useEffect(() => {
    setBriefingData((prev) => ({
      ...prev,
      departureAirport: flightStore.departureAirport || prev.departureAirport,
      arrivalAirport: flightStore.destinationAirport || prev.arrivalAirport,
      aircraftType: flightStore.currentAircraft?.name || prev.aircraftType,
    }));
  }, [flightStore.departureAirport, flightStore.destinationAirport, flightStore.selectedAircraftId]);

  const handleSyncLatest = () => {
    const latestWind = localStorage.getItem('latest_wind_result');
    const latestWB = localStorage.getItem('latest_wb_result');

    setBriefingData((prev) => {
      const updated = {
        ...prev,
        departureAirport: flightStore.departureAirport || prev.departureAirport,
        arrivalAirport: flightStore.destinationAirport || prev.arrivalAirport,
        aircraftType: flightStore.currentAircraft?.name || prev.aircraftType,
      };

      if (latestWind) {
        try {
          const data = JSON.parse(latestWind);
          if (Date.now() - data.timestamp < 3600000) {
            updated.notams = prev.notams
              ? prev.notams
              : `WIND TRIANGLE: CRS ${data.course}° | TAS ${data.tas} KT | HDG ${data.heading}° | GS ${data.gs} KT | WCA ${data.wca}°`;
          }
        } catch {}
      }

      if (latestWB) {
        try {
          const data = JSON.parse(latestWB);
          if (Date.now() - data.timestamp < 3600000) {
            updated.weightBalance = {
              rampWeight: data.rampWeight,
              takeoffWeight: data.takeoffWeight,
              cg: data.cg,
            };
          }
        } catch {}
      }

      return updated;
    });

    setSyncMessage('Synced latest calculator & W&B data into briefing.');
    setTimeout(() => setSyncMessage(null), 2500);
  };

  const handleCopyNotes = async () => {
    const notes = buildPreflightNotes(flightStore);
    const ok = await copyPreflightNotesToClipboard(notes);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const applyAircraftToBriefing = (planeId: string) => {
    const plane = hangar.find((p) => String(p.id) === planeId);
    if (plane) {
      setBriefingData((prev) => ({
        ...prev,
        nNumber: plane.tailNumber,
        aircraftType: plane.model || prev.aircraftType,
      }));
    }
  };

  const fetchWeatherData = async (icao: string) => {
    if (!icao.trim()) {
      setWeatherError('Please enter an ICAO code');
      return;
    }

    setLoading(true);
    setWeatherError(null);

    try {
      const weather = await fetchAirportWeather(icao.toUpperCase());

      if (weather.error) {
        setWeatherError(weather.error);
        return;
      }

      setBriefingData((prev) => ({
        ...prev,
        metar: weather.metar ? weather.metar.metar : prev.metar,
        taf: weather.taf ? weather.taf.taf : prev.taf,
      }));

      setWeatherError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch weather data';
      setWeatherError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    const fromAirport = briefingData.departureAirport.trim().toUpperCase() || 'KPBI';
    const toAirport = briefingData.arrivalAirport.trim().toUpperCase() || 'KBCT';

    const doc = generateBriefingPDF({
      date: briefingData.date,
      departureAirport: fromAirport,
      arrivalAirport: toAirport,
      aircraftType: briefingData.aircraftType,
      nNumber: briefingData.nNumber,
      pilot: briefingData.pilot,
      metar: briefingData.metar,
      taf: briefingData.taf,
      notams: briefingData.notams ? briefingData.notams.split('\n').filter((n) => n.trim()) : [],
      fuelPlan: {
        totalDistance: briefingData.fuelPlan.totalDistance,
        totalTime: briefingData.fuelPlan.totalTime,
        fuelBurned: briefingData.fuelPlan.fuelBurned,
        reserve: briefingData.fuelPlan.reserve,
      },
      weightBalance: {
        rampWeight: briefingData.weightBalance.rampWeight,
        takeoffWeight: briefingData.weightBalance.takeoffWeight,
        cg: briefingData.weightBalance.cg,
      },
    });

    doc.save(`Briefing_${fromAirport}_${toAirport}_${briefingData.date}.pdf`);
  };

  const handleExportFPL = () => {
    const fromAirport = briefingData.departureAirport.trim().toUpperCase() || 'KPBI';
    const toAirport = briefingData.arrivalAirport.trim().toUpperCase() || 'KBCT';
    downloadForeFlightFPL({
      departure: fromAirport,
      destination: toAirport,
      aircraftType: briefingData.aircraftType,
      tailNumber: briefingData.nNumber,
    });
  };

  const inputClass =
    'bg-slate-950 text-slate-100 border border-slate-800 rounded-md px-3 py-2 w-full text-sm font-mono';
  const textareaClass =
    'bg-slate-950 text-slate-100 border border-slate-800 rounded-md px-3 py-2 w-full resize-none text-xs font-mono';

  return (
    <div className="p-4 sm:p-6 space-y-6 rounded-xl border border-slate-800/80 bg-slate-950/90 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">Preflight Briefing & .FPL Export</h1>
            <p className="text-xs text-slate-400">
              Compile weather, fuel, and W&B into a printable PDF pack or export a standard `.fpl` route file.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncLatest}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-semibold text-slate-200 transition-all"
          >
            <RefreshCw size={13} /> Sync From Calculators
          </button>
          <button
            onClick={handleCopyNotes}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-semibold text-slate-200 transition-all"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
            <span>{copied ? 'Copied' : 'Copy preflight notes'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 rounded-lg bg-sky-950/50 border border-sky-800/60 text-sky-200 text-xs font-semibold">
          {syncMessage}
        </div>
      )}

      {/* Flight Info */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Flight & Airframe Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">Date</label>
            <input
              type="date"
              value={briefingData.date}
              onChange={(e) => setBriefingData({ ...briefingData, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">
              Pilot in Command
            </label>
            <input
              type="text"
              placeholder="Pilot Name"
              value={briefingData.pilot}
              onChange={(e) => setBriefingData({ ...briefingData, pilot: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">
              Departure (ICAO)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="KPBI"
                maxLength={4}
                value={briefingData.departureAirport}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase();
                  setBriefingData({ ...briefingData, departureAirport: v });
                  if (v.length >= 3) flightStore.setDepartureAirport(v);
                }}
                className={inputClass}
              />
              <button
                onClick={() => fetchWeatherData(briefingData.departureAirport)}
                disabled={loading || !briefingData.departureAirport}
                className="px-3 py-2 rounded-md text-xs font-semibold uppercase bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 whitespace-nowrap"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : 'Fetch WX'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">
              Destination (ICAO)
            </label>
            <input
              type="text"
              placeholder="KBCT"
              maxLength={4}
              value={briefingData.arrivalAirport}
              onChange={(e) => {
                const v = e.target.value.toUpperCase();
                setBriefingData({ ...briefingData, arrivalAirport: v });
                if (v.length >= 3) flightStore.setDestinationAirport(v);
              }}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">
              Aircraft Model
            </label>
            <input
              type="text"
              placeholder="Cessna 172S"
              value={briefingData.aircraftType}
              onChange={(e) => setBriefingData({ ...briefingData, aircraftType: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">
              Tail Number (N-Number)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="N172SP"
                value={briefingData.nNumber}
                onChange={(e) => setBriefingData({ ...briefingData, nNumber: e.target.value.toUpperCase() })}
                className={inputClass}
              />
              {hangar.length > 0 && (
                <select
                  onChange={(e) => applyAircraftToBriefing(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-md text-slate-300 text-xs font-semibold px-2"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Hangar
                  </option>
                  {hangar.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.tailNumber}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weather & NOTAMs */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Weather & Briefing Notes</h2>

        {weatherError && (
          <div className="p-3 rounded-md flex gap-2 bg-rose-950/40 border border-rose-800/60">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-200">{weatherError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">
              METAR
            </label>
            <textarea
              placeholder="Paste METAR or click Fetch WX"
              value={briefingData.metar}
              onChange={(e) => setBriefingData({ ...briefingData, metar: e.target.value })}
              className={textareaClass}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">TAF</label>
            <textarea
              placeholder="Paste TAF or click Fetch WX"
              value={briefingData.taf}
              onChange={(e) => setBriefingData({ ...briefingData, taf: e.target.value })}
              className={textareaClass}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">
              NOTAMs / Remarks
            </label>
            <textarea
              placeholder="Runway closures, TFRs, or synced Wind Triangle notes"
              value={briefingData.notams}
              onChange={(e) => setBriefingData({ ...briefingData, notams: e.target.value })}
              className={textareaClass}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Fuel & Weight Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Fuel Plan Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Distance (NM)</label>
              <input
                type="text"
                value={briefingData.fuelPlan.totalDistance}
                onChange={(e) =>
                  setBriefingData({
                    ...briefingData,
                    fuelPlan: { ...briefingData.fuelPlan, totalDistance: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Time (HRS)</label>
              <input
                type="text"
                value={briefingData.fuelPlan.totalTime}
                onChange={(e) =>
                  setBriefingData({
                    ...briefingData,
                    fuelPlan: { ...briefingData.fuelPlan, totalTime: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Trip Burn (GAL)</label>
              <input
                type="text"
                value={briefingData.fuelPlan.fuelBurned}
                onChange={(e) =>
                  setBriefingData({
                    ...briefingData,
                    fuelPlan: { ...briefingData.fuelPlan, fuelBurned: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">VFR/IFR Reserve (GAL)</label>
              <input
                type="text"
                value={briefingData.fuelPlan.reserve}
                onChange={(e) =>
                  setBriefingData({
                    ...briefingData,
                    fuelPlan: { ...briefingData.fuelPlan, reserve: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Weight & Balance Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Ramp (LBS)</label>
              <input
                type="text"
                placeholder="2240.0"
                value={briefingData.weightBalance.rampWeight}
                onChange={(e) =>
                  setBriefingData({
                    ...briefingData,
                    weightBalance: { ...briefingData.weightBalance, rampWeight: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Takeoff (LBS)</label>
              <input
                type="text"
                placeholder="2232.0"
                value={briefingData.weightBalance.takeoffWeight}
                onChange={(e) =>
                  setBriefingData({
                    ...briefingData,
                    weightBalance: { ...briefingData.weightBalance, takeoffWeight: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Takeoff CG (IN)</label>
              <input
                type="text"
                placeholder="41.85"
                value={briefingData.weightBalance.cg}
                onChange={(e) =>
                  setBriefingData({
                    ...briefingData,
                    weightBalance: { ...briefingData.weightBalance, cg: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={handleGeneratePDF}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition bg-sky-600 text-white hover:bg-sky-500 shadow-sm active:scale-95"
        >
          <Download size={15} />
          Download Preflight PDF
        </button>
        <button
          onClick={handleExportFPL}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 active:scale-95"
        >
          <Download size={15} />
          Export .FPL Route File
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 active:scale-95"
        >
          Print Briefing
        </button>
      </div>
    </div>
  );
};

export default Briefing;
