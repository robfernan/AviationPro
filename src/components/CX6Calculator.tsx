import React, { useState, useEffect } from 'react';
import { Wind, Gauge, Clock, Fuel, Zap, Scale, Send, Copy, Check, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AviationMath } from '../core/aviationMath';
import { useFlightStore } from '../core/flightStore';
import { buildPreflightNotes, copyPreflightNotesToClipboard } from '../core/preflightNotes';
import WeightBalanceCalculator from './WeightBalanceCalculator';

interface CX6CalculatorProps {
  darkMode: boolean;
}

const CX6Calculator: React.FC<CX6CalculatorProps> = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('WIND');
  const [copied, setCopied] = useState(false);
  const flightState = useFlightStore();

  const handleCopyNotes = async () => {
    const notes = buildPreflightNotes(flightState);
    const ok = await copyPreflightNotesToClipboard(notes);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col w-full border bg-slate-950/90 border-slate-800/80 shadow-xl overflow-hidden rounded-xl">
      {/* NAVIGATION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border-b border-slate-800/80 px-2.5 py-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <TabBtn active={activeTab === 'WIND'} onClick={() => setActiveTab('WIND')} icon={<Wind size={14} />} label="WIND" />
          <TabBtn active={activeTab === 'TAS'} onClick={() => setActiveTab('TAS')} icon={<Gauge size={14} />} label="TAS" />
          <TabBtn active={activeTab === 'TSD'} onClick={() => setActiveTab('TSD')} icon={<Clock size={14} />} label="TSD" />
          <TabBtn active={activeTab === 'FUEL'} onClick={() => setActiveTab('FUEL')} icon={<Fuel size={14} />} label="FUEL" />
          <TabBtn active={activeTab === 'X-WIND'} onClick={() => setActiveTab('X-WIND')} icon={<Zap size={14} />} label="X-WIND" />
          <TabBtn active={activeTab === 'WB'} onClick={() => setActiveTab('WB')} icon={<Scale size={14} />} label="W&B" />
        </div>

        <button
          onClick={handleCopyNotes}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md border border-slate-700 transition-all active:scale-95 shrink-0"
          title="Copy preflight notes"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy preflight notes'}</span>
        </button>
      </div>

      {/* MAIN COMPUTATION DISPLAY */}
      <div className="w-full">
        <div className={activeTab === 'WB' ? 'w-full' : 'p-3.5 sm:p-6 space-y-5 max-w-4xl mx-auto'}>
          {activeTab === 'WIND' && <WindTriangleView />}
          {activeTab === 'TAS' && <TASView />}
          {activeTab === 'TSD' && <TSDView />}
          {activeTab === 'FUEL' && <FuelView />}
          {activeTab === 'X-WIND' && <XWindView />}

          {activeTab === 'WB' && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <WeightBalanceCalculator darkMode={darkMode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- View Modules (CX-6 Core) ---

const WindTriangleView = () => {
  const flightStore = useFlightStore();
  const [tas, setTas] = useState(120);
  const [course, setCourse] = useState(90);
  const res = AviationMath.calculateWCA(course, tas, flightStore.windDirection, flightStore.windSpeed);

  const handleSendToBriefing = () => {
    const snapshot = {
      tas,
      course,
      windDir: flightStore.windDirection,
      windSpd: flightStore.windSpeed,
      heading: res.heading ?? '--',
      gs: res.groundSpeed ?? '--',
      wca: res.windCorrectionAngle ?? '--',
      timestamp: Date.now(),
    };
    localStorage.setItem('latest_wind_result', JSON.stringify(snapshot));
    alert('Wind calculation sent to Briefing Builder.');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="True Airspeed (TAS)" value={tas} onChange={setTas} unit="KT" />
        <Input label="Course (CRS)" value={course} onChange={setCourse} unit="°" />
        <Input
          label="Wind Direction (DIR)"
          value={flightStore.windDirection}
          onChange={(v: number) => flightStore.setWind(v, flightStore.windSpeed, flightStore.windGust)}
          unit="°"
        />
        <Input
          label="Wind Speed (SPD)"
          value={flightStore.windSpeed}
          onChange={(v: number) => flightStore.setWind(flightStore.windDirection, v, flightStore.windGust)}
          unit="KT"
        />
      </div>
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 grid grid-cols-3 gap-3 shadow-inner">
        <Stat label="Calculated Heading" val={res.heading !== null ? `${res.heading}°` : '--'} />
        <Stat label="Ground Speed" val={res.groundSpeed !== null ? `${res.groundSpeed} KT` : '--'} />
        <Stat
          label="Wind Correction"
          val={res.windCorrectionAngle !== null ? `${res.windCorrectionAngle}°` : '--'}
          color="text-sky-400"
        />
      </div>
      {res.error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-lg font-semibold">
          {res.error}
        </div>
      )}
      <button
        onClick={handleSendToBriefing}
        className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-500 text-white transition-all text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm active:scale-98"
      >
        <Send size={14} /> Push To Flight Plan Briefing
      </button>
    </div>
  );
};

const TASView = () => {
  const flightStore = useFlightStore();
  const [cas, setCas] = useState(110);
  const computedPa = flightStore.getPressureAltitude() ?? 4500;
  const [pa, setPa] = useState(computedPa);

  useEffect(() => {
    const latestPa = flightStore.getPressureAltitude();
    if (latestPa !== null) setPa(latestPa);
  }, [flightStore.fieldElevationFt, flightStore.altimeterInHg]);

  const tas = AviationMath.calculateTAS(cas, pa, flightStore.temperatureC);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Calibrated Airspeed (CAS)" value={cas} onChange={setCas} unit="KCAS" />
        <Input label="Pressure Altitude (PA)" value={pa} onChange={setPa} unit="FT" />
        <Input
          label="Outside Air Temp (OAT)"
          value={flightStore.temperatureC}
          onChange={(v: number) => flightStore.setTemperature(v)}
          unit="°C"
        />
      </div>
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 text-center shadow-inner">
        <Stat label="Calculated True Airspeed (TAS)" val={tas !== null ? `${tas} KT` : '--'} color="text-sky-400" />
        <div className="text-[11px] text-slate-400 mt-2">Compressibility ignored below 200 KT</div>
      </div>
    </div>
  );
};

const TSDView = () => {
  const [dist, setDist] = useState(120);
  const [gs, setGs] = useState(115);
  const timeHours = AviationMath.calculateTSD(dist, gs, 'time');
  const minutes = timeHours !== null ? Math.round(timeHours * 60) : null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Leg Distance" value={dist} onChange={setDist} unit="NM" />
        <Input label="Ground Speed (GS)" value={gs} onChange={setGs} unit="KT" />
      </div>
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-inner flex justify-around">
        <Stat label="Time Enroute (Decimal)" val={timeHours !== null ? `${timeHours} HRS` : '--'} />
        <Stat label="Estimated Time" val={minutes !== null ? `${minutes} MIN` : '--'} color="text-sky-400" />
      </div>
    </div>
  );
};

const FuelView = () => {
  const flightStore = useFlightStore();
  const [flow, setFlow] = useState(flightStore.currentAircraft?.fuelBurnGPH ?? 8.5);
  const [time, setTime] = useState(2.2);

  useEffect(() => {
    if (flightStore.currentAircraft?.fuelBurnGPH !== undefined) {
      setFlow(flightStore.currentAircraft.fuelBurnGPH);
    }
  }, [flightStore.selectedAircraftId]);

  const burn = AviationMath.calculateFuel(flow, time);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={`Fuel Burn Rate (${flightStore.currentAircraft?.name || 'Aircraft'})`}
          value={flow}
          onChange={setFlow}
          unit="GPH"
        />
        <Input label="Total Flight Duration" value={time} onChange={setTime} unit="HRS" />
      </div>
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-inner border-l-4 border-l-sky-500 flex justify-around">
        <Stat label="Estimated Fuel Burned" val={burn !== null ? `${burn} GAL` : '--'} color="text-sky-400" />
        <Stat label="Weight Equivalent (100LL)" val={burn !== null ? `${(burn * 6).toFixed(1)} LBS` : '--'} />
      </div>
    </div>
  );
};

const XWindView = () => {
  const flightStore = useFlightStore();
  const evalRes = flightStore.getCrosswindComponent();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Input
          label="Runway Heading (MAG)"
          value={flightStore.runwayHeading}
          onChange={(v: number) => flightStore.setRunwayHeading(v)}
          unit="°"
        />
        <Input
          label="Wind Direction (MAG)"
          value={flightStore.windDirection}
          onChange={(v: number) => flightStore.setWind(v, flightStore.windSpeed, flightStore.windGust)}
          unit="°"
        />
        <Input
          label="Wind Speed"
          value={flightStore.windSpeed}
          onChange={(v: number) => flightStore.setWind(flightStore.windDirection, v, flightStore.windGust)}
          unit="KT"
        />
        <Input
          label="Gust Speed (Optional)"
          value={flightStore.windGust || 0}
          onChange={(v: number) => flightStore.setWind(flightStore.windDirection, flightStore.windSpeed, v > 0 ? v : undefined)}
          unit="KT"
        />
      </div>

      {/* Personal / Solo Endorsement Limits Card (Phase 2.3) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Personal / Solo Endorsement Limits (User-Entered Only)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => flightStore.setPilotLimits(10, 5)}
              className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Student Solo Preset (10 KT XW / 5 KT TW)
            </button>
            <button
              type="button"
              onClick={() => flightStore.setPilotLimits(15, 10)}
              className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              PPL Personal (15 KT XW / 10 KT TW)
            </button>
            <button
              type="button"
              onClick={() => flightStore.setPilotLimits(undefined, undefined)}
              className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800/60 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              Clear Limits
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Max Crosswind Limit (KT)
            </label>
            <input
              type="number"
              placeholder="No limit set"
              value={flightStore.pilotMaxCrosswindKnots ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                flightStore.setPilotLimits(raw === '' ? undefined : Math.max(0, Number(raw)), flightStore.pilotMaxTailwindKnots);
              }}
              className="w-full p-2 border rounded-md text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Max Tailwind Limit (KT)
            </label>
            <input
              type="number"
              placeholder="No limit set"
              value={flightStore.pilotMaxTailwindKnots ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                flightStore.setPilotLimits(flightStore.pilotMaxCrosswindKnots, raw === '' ? undefined : Math.max(0, Number(raw)));
              }}
              className="w-full p-2 border rounded-md text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {evalRes.error ? (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-lg font-semibold">
          {evalRes.error}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-inner grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat
              label="Crosswind"
              val={evalRes.crosswindKt !== null ? `${evalRes.crosswindKt} KT ${evalRes.side || ''}` : '--'}
              color="text-sky-400"
            />
            <Stat
              label={evalRes.tailwindKt && evalRes.tailwindKt > 0 ? 'Tailwind' : 'Headwind'}
              val={
                evalRes.tailwindKt !== null && evalRes.headwindKt !== null
                  ? `${evalRes.tailwindKt > 0 ? evalRes.tailwindKt : evalRes.headwindKt} KT`
                  : '--'
              }
              color={evalRes.tailwindKt && evalRes.tailwindKt > 0 ? 'text-amber-400' : 'text-slate-100'}
            />
            <Stat
              label="Gust Crosswind"
              val={evalRes.gustCrosswindKt !== undefined ? `${evalRes.gustCrosswindKt} KT` : '--'}
            />
            <Stat
              label="Safety Status"
              val={evalRes.status}
              color={
                evalRes.status === 'OK'
                  ? 'text-emerald-400'
                  : evalRes.status === 'EXCEEDS'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }
            />
          </div>

          {evalRes.status !== 'NO LIMIT SET' && (
            <div
              className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2.5 ${
                evalRes.status === 'OK'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              }`}
            >
              {evalRes.status === 'OK' ? <ShieldCheck size={16} className="text-emerald-400" /> : <ShieldAlert size={16} className="text-rose-400" />}
              <span>
                {evalRes.status === 'OK'
                  ? 'Within entered personal / endorsement crosswind and tailwind minimums.'
                  : 'Exceeds entered personal / endorsement minimums (including gusts or tailwind).'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Atomic UI Components ---

const Input = ({ label, value, onChange, unit }: any) => (
  <div className="space-y-1.5">
    <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</div>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-900 border border-slate-700/80 p-2.5 pr-12 text-slate-100 outline-none focus:border-sky-500 rounded-md text-sm font-mono font-semibold"
      />
      <div className="absolute right-3 top-2.5 text-[11px] text-slate-400 font-semibold uppercase font-mono">{unit}</div>
    </div>
  </div>
);

const Stat = ({ label, val, color = 'text-slate-100' }: any) => (
  <div className="text-center sm:text-left">
    <div className="text-[11px] text-slate-400 uppercase mb-1 font-semibold tracking-wider">{label}</div>
    <div className={`text-2xl font-bold font-mono ${color} tracking-tight`}>{val}</div>
  </div>
);

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-2 rounded-md flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all ${
      active
        ? 'bg-sky-600 text-white shadow-sm'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
    }`}
  >
    {icon} {label}
  </button>
);

export default CX6Calculator;
