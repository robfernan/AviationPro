import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { useFlightStore } from '../core/flightStore';

interface RiskItem {
  id: string;
  category: 'PILOT (IMSAFE)' | 'AIRCRAFT' | 'ENVIRONMENT (VFR/WX)' | 'EXTERNAL PRESSURES';
  label: string;
  points: number;
}

const FRAT_FACTORS: RiskItem[] = [
  { id: 'sleep', category: 'PILOT (IMSAFE)', label: 'Less than 7 hours of sleep in the last 24 hours', points: 3 },
  { id: 'recency', category: 'PILOT (IMSAFE)', label: 'Fewer than 3 flights or < 3 hours logged in the last 30 days', points: 3 },
  { id: 'stress', category: 'PILOT (IMSAFE)', label: 'High work/personal stress, fatigue, or mild dehydration', points: 2 },
  { id: 'unfamiliar_ac', category: 'AIRCRAFT', label: 'Less than 10 hours in aircraft make/model or avionics layout', points: 3 },
  { id: 'fuel_margin', category: 'AIRCRAFT', label: 'Planned landing fuel reserve under 1.0 hour (60 minutes)', points: 4 },
  { id: 'inop_equip', category: 'AIRCRAFT', label: 'Any deferred / INOP equipment (FAR 91.213)', points: 2 },
  { id: 'night_twilight', category: 'ENVIRONMENT (VFR/WX)', label: 'Flight conducted at night or within 1 hour of sunset', points: 4 },
  { id: 'mvfr_ceiling', category: 'ENVIRONMENT (VFR/WX)', label: 'Ceiling < 3,000 ft AGL or visibility < 5 SM along route', points: 5 },
  { id: 'unfamiliar_apt', category: 'ENVIRONMENT (VFR/WX)', label: 'First time landing at destination or complex Class B/C airspace', points: 2 },
  { id: 'schedule_press', category: 'EXTERNAL PRESSURES', label: 'Important arrival deadline, waiting passengers, or get-there-itis', points: 4 },
];

const FratAssessment: React.FC<{ darkMode: boolean }> = () => {
  const flightStore = useFlightStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Automatic environmental risk factors computed from live store telemetry
  const xwRes = flightStore.getCrosswindComponent();
  const daRes = flightStore.getDensityAltitude();
  const effectiveXw = xwRes.gustCrosswindKt ?? xwRes.crosswindKt ?? 0;
  const gustSpread =
    flightStore.windGust && flightStore.windGust > flightStore.windSpeed
      ? flightStore.windGust - flightStore.windSpeed
      : 0;
  const daFt = daRes.exactFt ?? 0;

  const autoRisks: { label: string; points: number; active: boolean }[] = [
    {
      label: `Surface Crosswind ≥ 10 KT (Current: ${effectiveXw} KT)`,
      points: effectiveXw >= 15 ? 5 : 3,
      active: effectiveXw >= 10,
    },
    {
      label: `Wind Gust Spread ≥ 8 KT (Current spread: ${gustSpread} KT)`,
      points: 4,
      active: gustSpread >= 8,
    },
    {
      label: `High Density Altitude ≥ 4,000 FT (Current DA: ${daFt.toLocaleString()} FT)`,
      points: daFt >= 6500 ? 5 : 3,
      active: daFt >= 4000,
    },
    {
      label: `Personal Crosswind / Tailwind Limit Exceeded (${xwRes.status})`,
      points: 6,
      active: xwRes.status === 'EXCEEDS',
    },
  ];

  const manualScore = FRAT_FACTORS.filter((f) => selectedIds.includes(f.id)).reduce((s, f) => s + f.points, 0);
  const autoScore = autoRisks.filter((a) => a.active).reduce((s, a) => s + a.points, 0);
  const totalScore = manualScore + autoScore;

  const riskLevel: 'LOW (GO)' | 'MODERATE (CFI REVIEW)' | 'HIGH (NO-GO)' =
    totalScore >= 14 ? 'HIGH (NO-GO)' : totalScore >= 8 ? 'MODERATE (CFI REVIEW)' : 'LOW (GO)';

  const categories = ['PILOT (IMSAFE)', 'AIRCRAFT', 'ENVIRONMENT (VFR/WX)', 'EXTERNAL PRESSURES'] as const;

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-800/80 bg-slate-950/90 shadow-xl space-y-5">
      {/* Header & Score Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            FAA PAVE / IMSAFE Flight Risk Assessment Tool (FRAT)
          </h2>
          <p className="text-xs text-slate-400">
            Preflight Go/No-Go quantitative risk scoring combining pilot human factors and live atmospheric telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedIds([])}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          <RotateCcw size={13} /> Reset Checklist
        </button>
      </div>

      {/* Live Risk Score Card */}
      <div
        className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
          riskLevel === 'LOW (GO)'
            ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-100'
            : riskLevel === 'MODERATE (CFI REVIEW)'
            ? 'bg-amber-950/40 border-amber-700/70 text-amber-100'
            : 'bg-rose-950/40 border-rose-800/70 text-rose-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {riskLevel === 'LOW (GO)' ? (
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          ) : riskLevel === 'MODERATE (CFI REVIEW)' ? (
            <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Preflight Risk Determination</div>
            <div className="text-lg sm:text-xl font-bold font-mono">{riskLevel}</div>
            <div className="text-xs opacity-85 mt-0.5">
              {riskLevel === 'LOW (GO)'
                ? 'Score 0–7: Standard preflight mitigations apply.'
                : riskLevel === 'MODERATE (CFI REVIEW)'
                ? 'Score 8–13: Elevated risk — consult flight instructor or tighten weather/fuel margins before departure.'
                : 'Score 14+: Unacceptable cumulative risk — delay, add an instructor, or cancel flight.'}
            </div>
          </div>
        </div>

        <div className="text-right font-mono bg-slate-950/70 px-4 py-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Cumulative Risk Score</div>
          <div className="text-2xl font-bold text-sky-400">{totalScore} PTS</div>
          <div className="text-[10px] text-slate-400">
            Manual: {manualScore} • Live WX: {autoScore}
          </div>
        </div>
      </div>

      {/* Automatic Telemetry Risk Triggers */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
          Automatic Live Telemetry Risk Factors ({flightStore.departureAirport})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {autoRisks.map((item) => (
            <div
              key={item.label}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                item.active
                  ? 'bg-amber-950/40 border-amber-700/60 text-amber-200 font-semibold'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                {item.active ? (
                  <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 size={14} className="text-emerald-500/70 shrink-0" />
                )}
                <span>{item.label}</span>
              </span>
              <span className="font-mono text-[11px] shrink-0">
                {item.active ? `+${item.points} PTS` : '0 PTS'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PAVE & IMSAFE Interactive Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              {cat}
            </div>
            <div className="space-y-2">
              {FRAT_FACTORS.filter((f) => f.category === cat).map((factor) => {
                const checked = selectedIds.includes(factor.id);
                return (
                  <label
                    key={factor.id}
                    className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors text-xs ${
                      checked
                        ? 'bg-sky-950/50 border-sky-500/50 text-slate-100'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(factor.id)}
                        className="mt-0.5 accent-sky-500 rounded"
                      />
                      <span>{factor.label}</span>
                    </div>
                    <span className="font-mono font-bold text-[11px] text-sky-400 shrink-0">+{factor.points}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FratAssessment;
