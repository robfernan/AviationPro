import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Info,
  Trash2,
  Send,
  Scale,
} from 'lucide-react';
import { db } from '../services/PersistenceService';
import { Aircraft } from '../types/aviation';
import sampleAircrafts from '../data/sampleAircrafts.json';
import { CGEnvelope } from './CGEnvelope';
import { useFlightStore } from '../core/flightStore';

interface WeightItem {
  id: string;
  name: string;
  weight: string;
  arm: string;
  isLocked?: boolean;
  category: 'fixed' | 'payload' | 'fuel' | 'deduction';
}

interface AircraftLimits {
  maxWeight: number;
  forwardCG: number;
  aftCG: number;
  utilityMaxWeight?: number;
}

interface AircraftConfiguration {
  emptyWeight: string;
  emptyArm: string;
  fuelWeight: string;
  fuelArm: string;
  startupDeduction: string;
  burnedDeduction: string;
  fuelCapacityGal: number;
}

const WeightBalanceCalculator: React.FC<{ darkMode: boolean }> = () => {
  const flightStore = useFlightStore();
  const [profileId, setProfileId] = useState<string>(flightStore.selectedAircraftId || 'c172');
  const [hangarPlanes, setHangarPlanes] = useState<Aircraft[]>([]);
  const [activeCategory, setActiveCategory] = useState<'NORMAL' | 'UTILITY'>('NORMAL');
  const [weightItems, setWeightItems] = useState<WeightItem[]>([]);
  const [sentBadge, setSentBadge] = useState(false);

  useEffect(() => {
    if (flightStore.selectedAircraftId && flightStore.selectedAircraftId !== profileId) {
      setProfileId(flightStore.selectedAircraftId);
    }
  }, [flightStore.selectedAircraftId]);

  useEffect(() => {
    const loadHangar = async () => {
      const planes = await db.getAllAircraft();
      setHangarPlanes(planes);
    };
    loadHangar();
  }, []);

  const [limits, setLimits] = useState<AircraftLimits>({
    maxWeight: 2550,
    forwardCG: 35.0,
    aftCG: 47.3,
    utilityMaxWeight: 2200,
  });

  const [config, setConfig] = useState<AircraftConfiguration>({
    emptyWeight: '1720.9',
    emptyArm: '41.9',
    fuelWeight: '318',
    fuelArm: '48',
    startupDeduction: '8',
    burnedDeduction: '120',
    fuelCapacityGal: 53,
  });

  useEffect(() => {
    const hangarPlane = hangarPlanes.find((p) => String(p.id) === profileId);
    const samplePlane = (sampleAircrafts as any[]).find((a) => a.id === profileId);
    const profile = hangarPlane || samplePlane;

    if (profile) {
      const fwd = profile.forwardCG || 35.0;
      const aft = profile.aftCG || 47.3;
      const maxW = profile.maxGrossWeight || profile.maxWeight || 2550;

      setLimits({
        maxWeight: maxW,
        forwardCG: fwd,
        aftCG: aft,
        utilityMaxWeight: profile.utilityMaxWeight || Math.round(maxW * 0.86),
      });

      const emptyW = String(profile.emptyWeight);
      const emptyA = String(profile.emptyArm);
      const fArm = String(profile.fuelArm || (fwd > 70 ? 103.5 : 48));
      const fCap = profile.fuelCapacityGal || 53;
      const fWt = String(profile.fuelWeightLbs || Math.round(fCap * 6));

      setConfig({
        emptyWeight: emptyW,
        emptyArm: emptyA,
        fuelWeight: fWt,
        fuelArm: fArm,
        startupDeduction: String(profile.startupDeductionLbs || 8),
        burnedDeduction: String(profile.burnedDeductionLbs || 102),
        fuelCapacityGal: fCap,
      });

      const frontArm = fwd > 70 ? '90.5' : '37';
      const rearArm = fwd > 70 ? '128.0' : '73';
      const bag1Arm = fwd > 70 ? '143.5' : '95';

      setWeightItems([
        { id: '1', name: 'Basic Empty Weight', weight: emptyW, arm: emptyA, isLocked: true, category: 'fixed' },
        { id: '2', name: 'Pilot & Front Passenger', weight: '190', arm: frontArm, category: 'payload' },
        { id: '3', name: 'Rear Passengers', weight: '0', arm: rearArm, category: 'payload' },
        { id: '4', name: 'Baggage Area 1', weight: '0', arm: bag1Arm, category: 'payload' },
        { id: '5', name: 'Usable Fuel Load (lbs)', weight: fWt, arm: fArm, isLocked: true, category: 'fuel' },
      ]);
    }
  }, [profileId, hangarPlanes]);

  const handleSelectProfile = (id: string) => {
    setProfileId(id);
    if ((sampleAircrafts as any[]).some((a) => a.id === id)) {
      flightStore.setAircraft(id);
    }
  };

  const handleAddItem = useCallback(() => {
    setWeightItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: 'Additional Station / Baggage',
        weight: '0',
        arm: String(limits.forwardCG),
        category: 'payload',
      },
    ]);
  }, [limits.forwardCG]);

  const handleRemoveItem = useCallback((id: string) => {
    setWeightItems((prev) => prev.filter((item) => item.id !== id || item.isLocked));
  }, []);

  const handleUpdateItem = useCallback((id: string, field: keyof WeightItem, value: string) => {
    setWeightItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }, []);

  const results = useMemo(() => {
    let payloadW = 0;
    let payloadM = 0;
    let currentFuelW = 0;
    const fArm = parseFloat(config.fuelArm) || 48;

    weightItems.forEach((item) => {
      const w = parseFloat(item.weight) || 0;
      const a = parseFloat(item.arm) || 0;
      if (item.category === 'fuel') {
        currentFuelW = w;
      } else {
        payloadW += w;
        payloadM += w * a;
      }
    });

    const startD = parseFloat(config.startupDeduction) || 0;
    const burnD = parseFloat(config.burnedDeduction) || 0;
    const rampW = payloadW + currentFuelW;
    const rampM = payloadM + currentFuelW * fArm;
    const rampCG = rampW > 0 ? rampM / rampW : 0;
    const takeoffW = rampW - startD;
    const takeoffM = rampM - startD * fArm;
    const takeoffCG = takeoffW > 0 ? takeoffM / takeoffW : 0;
    const landingW = takeoffW - burnD;
    const landingM = takeoffM - burnD * fArm;
    const landingCG = landingW > 0 ? landingM / landingW : 0;
    const currentMax = activeCategory === 'NORMAL' ? limits.maxWeight : limits.utilityMaxWeight || limits.maxWeight;

    const isWeightSafe = takeoffW <= currentMax && rampW <= currentMax + 10;
    const isCGSafe =
      takeoffCG >= limits.forwardCG &&
      takeoffCG <= limits.aftCG &&
      landingCG >= limits.forwardCG &&
      landingCG <= limits.aftCG;

    return {
      rampW,
      rampM,
      rampCG,
      takeoffW,
      takeoffM,
      takeoffCG,
      landingW,
      landingM,
      landingCG,
      isWeightSafe,
      isCGSafe,
      fuelLbs: currentFuelW,
      remainingFuelLbs: Math.max(0, currentFuelW - startD - burnD),
    };
  }, [weightItems, config, limits, activeCategory]);

  const handleSendToBriefing = () => {
    const snapshot = {
      rampWeight: results.rampW.toFixed(1),
      takeoffWeight: results.takeoffW.toFixed(1),
      cg: results.takeoffCG.toFixed(2),
      timestamp: Date.now(),
    };
    localStorage.setItem('latest_wb_result', JSON.stringify(snapshot));
    setSentBadge(true);
    setTimeout(() => setSentBadge(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-950/90 text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Scale size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Weight & Balance Envelope Calculator</h2>
            <p className="text-xs text-slate-400">
              Compute ramp, takeoff, and landing CG moments and verify normal/utility category limits.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={profileId}
            onChange={(e) => handleSelectProfile(e.target.value)}
            className="text-xs font-medium bg-slate-900 border border-slate-700/80 rounded-md px-3 py-2 text-slate-100"
          >
            <optgroup label="Standard Presets">
              {(sampleAircrafts as any[]).map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.name}
                </option>
              ))}
            </optgroup>
            {hangarPlanes.length > 0 && (
              <optgroup label="Custom Hangar">
                {hangarPlanes.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.tailNumber} ({p.model})
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <div className="flex bg-slate-900 border border-slate-800 rounded-md p-0.5">
            {(['NORMAL', 'UTILITY'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded transition-all ${
                  activeCategory === cat ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={handleSendToBriefing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm"
          >
            <Send size={13} />
            {sentBadge ? 'Synced to Briefing!' : 'Push to Briefing'}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            <Printer size={13} /> Print
          </button>
        </div>
      </div>

      {/* Main Grid: Left Table & Fuel Deductions | Right Dynamic Envelope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* Station Loading Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Loading Stations & Moments
              </span>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700"
              >
                <Plus size={13} /> Add Station
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                    <th className="py-2.5 px-4 font-semibold">Station</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-28">Weight (lbs)</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-28">Arm (in)</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-32">Moment</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {weightItems.map((item) => {
                    const m = (parseFloat(item.weight) || 0) * (parseFloat(item.arm) || 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            disabled={item.isLocked}
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                            className="w-full bg-transparent text-xs font-medium text-slate-200 outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.weight}
                            onChange={(e) => handleUpdateItem(item.id, 'weight', e.target.value)}
                            className="w-full p-1.5 text-center rounded text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.1"
                            value={item.arm}
                            onChange={(e) => handleUpdateItem(item.id, 'arm', e.target.value)}
                            className="w-full p-1.5 text-center rounded text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-xs text-slate-300">
                          {m.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {!item.isLocked && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Taxi & Enroute Fuel Burn Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Start, Taxi & Runup Fuel Deduction (lbs)
              </label>
              <input
                type="number"
                value={config.startupDeduction}
                onChange={(e) => setConfig({ ...config, startupDeduction: e.target.value })}
                className="w-full p-2 rounded-md font-mono text-sm"
              />
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Estimated Enroute Fuel Burn (lbs)
              </label>
              <input
                type="number"
                value={config.burnedDeduction}
                onChange={(e) => setConfig({ ...config, burnedDeduction: e.target.value })}
                className="w-full p-2 rounded-md font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic CG Envelope Chart */}
        <div className="lg:col-span-5 flex flex-col">
          <CGEnvelope
            cg={results.takeoffCG}
            weight={results.takeoffW}
            takeoffCG={results.takeoffCG}
            takeoffWeight={results.takeoffW}
            landingCG={results.landingCG}
            landingWeight={results.landingW}
            forwardCG={limits.forwardCG}
            aftCG={limits.aftCG}
            maxWeight={activeCategory === 'NORMAL' ? limits.maxWeight : limits.utilityMaxWeight || limits.maxWeight}
            emptyWeight={parseFloat(config.emptyWeight) || 1500}
          />
        </div>
      </div>

      {/* Summary Readout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Ramp Condition</div>
          <div className="text-xl font-bold font-mono text-slate-100">{results.rampW.toFixed(1)} LBS</div>
          <div className="text-xs font-mono text-slate-400 mt-1">CG: {results.rampCG.toFixed(2)}"</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 mb-1">Takeoff Condition</div>
          <div className="text-xl font-bold font-mono text-sky-400">{results.takeoffW.toFixed(1)} LBS</div>
          <div className="text-xs font-mono text-slate-300 mt-1">
            CG: {results.takeoffCG.toFixed(2)}" (Max {limits.maxWeight} lbs)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Landing Condition</div>
          <div className="text-xl font-bold font-mono text-slate-100">{results.landingW.toFixed(1)} LBS</div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            CG: {results.landingCG.toFixed(2)}" • Rem Fuel: {(results.remainingFuelLbs / 6).toFixed(1)} gal
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            results.isWeightSafe && results.isCGSafe
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
          }`}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">Envelope Status</div>
            <div className="text-lg font-bold font-mono mt-0.5">
              {results.isWeightSafe && results.isCGSafe ? 'WITHIN LIMITS' : 'EXCEEDS LIMITS'}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              Fwd {limits.forwardCG}" – Aft {limits.aftCG}"
            </div>
          </div>
          {results.isWeightSafe && results.isCGSafe ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
          )}
        </div>
      </div>

      {/* POH Verification Notice */}
      <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          Always verify empty weight, moment arm, and CG envelope against the specific aircraft's current POH/AFM and Weight & Balance equipment list prior to flight.
        </span>
      </div>
    </div>
  );
};

export default WeightBalanceCalculator;
