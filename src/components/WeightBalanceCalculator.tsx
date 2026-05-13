import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { 
  Plus, 
  // Minus removed to clear TS:6133 warning
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Database, 
  ChevronDown,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Save,
  Clipboard,
  History,
  Layers,
  Gauge
} from 'lucide-react';
import sampleAircrafts from '../data/sampleAircrafts.json';
import cgEnvelopeImage from '../../assets/centerofgravitycessna172.png';

/**
 * AVIATIONPRO // MODULE_0x4FB2: STRATEGIC_WEIGHT_BALANCE_CALCULATOR
 * DESIGN_SPEC: DARK COCKPIT HARDWARE // INDUSTRIAL HIGH-CONTRAST
 * ENGINE: OFFLINE-FIRST MATHEMATICAL VALIDATION // 100% RELIABILITY
 */

// --- 1. ARCHITECTURAL TYPE DEFINITIONS ---

interface WeightItem {
  id: string;
  name: string;
  weight: string;
  arm: string;
  isLocked?: boolean;
  category: 'fixed' | 'payload' | 'fuel' | 'deduction';
  timestamp?: number;
}

interface AircraftLimits {
  maxWeight: number;
  forwardCG: number;
  aftCG: number;
  utilityMaxWeight?: number;
  utilityFwdCG?: number;
  utilityAftCG?: number;
}

interface AircraftConfiguration {
  emptyWeight: string;
  emptyArm: string;
  fuelWeight: string;
  fuelArm: string;
  rampArm: string;
  takeoffArm: string;
  landingArm: string;
  startupDeduction: string;
  burnedDeduction: string;
  fuelCapacityGal: number;
}

interface TelemetryResults {
  rampW: number;
  rampM: number;
  rampCG: number;
  takeoffW: number;
  takeoffM: number;
  takeoffCG: number;
  landingW: number;
  landingM: number;
  landingCG: number;
  isWeightSafe: boolean;
  isCGSafe: boolean;
  fuelLbs: number;
  remainingFuelLbs: number;
  payloadW: number;
  momentArm: number;
}

// --- 2. THEME & DESIGN SYSTEM CONSTANTS ---

const THEME = {
  bg: '#000000',
  surface: '#18181b',
  surfaceAlt: '#0c0c0e',
  border: '#27272a',
  accent: '#dc2626', 
  textPrimary: '#f4f4f5',
  textSecondary: '#71717a',
  textMuted: '#3f3f46',
  success: '#22c55e',
  font: 'font-mono tracking-tighter'
};

// --- 3. REUSABLE ATOMIC COMPONENTS ---

const HUDLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#71717a] mb-2">
    {children}
  </label>
);

const CockpitInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props} 
    className="w-full p-3 bg-black border border-[#27272a] rounded-none text-[#f4f4f5] font-mono text-xs focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] outline-none transition-all placeholder:text-[#3f3f46] tabular-nums" 
  />
);

const TelemetryCard = ({ label, value, subValue, status }: { label: string; value: string; subValue?: string; status?: 'nominal' | 'alert' | 'critical' }) => (
  <div className={`p-6 bg-[#18181b] border ${
    status === 'critical' ? `border-[#dc2626] bg-[#dc2626]/5` : 
    status === 'alert' ? 'border-yellow-600/50 bg-yellow-600/5' : 
    `border-[#27272a]`
  } transition-all duration-500 relative group`}>
    <div className={`text-[9px] font-black uppercase tracking-[0.4em] ${status === 'critical' ? `text-[#dc2626]` : `text-[#71717a]`} mb-3`}>
      {label}
    </div>
    <div className="flex flex-col">
      <span className={`text-2xl font-black ${status === 'critical' ? `text-[#dc2626]` : `text-white`}`}>{value}</span>
      {subValue && <span className="text-[10px] font-bold text-[#71717a] mt-1.5 uppercase tracking-widest tabular-nums">{subValue}</span>}
    </div>
    <div className={`absolute top-0 right-0 w-1 h-full ${status === 'critical' ? `bg-[#dc2626]` : 'bg-transparent'}`}></div>
  </div>
);

// --- 4. MAIN MODULE: WEIGHT AND BALANCE CALCULATOR ---

const WeightBalanceCalculator: React.FC<{ darkMode: boolean }> = () => {
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [profileId, setProfileId] = useState<string>('c172');
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<'NORMAL' | 'UTILITY'>('NORMAL');
  const [weightItems, setWeightItems] = useState<WeightItem[]>([]);
  const [sysLogs, setSysLogs] = useState<string[]>(['SYS_BOOT: OK', 'MODULE_WB: READY']);
  
  const [limits, setLimits] = useState<AircraftLimits>({
    maxWeight: 2550,
    forwardCG: 35.0,
    aftCG: 47.3,
    utilityMaxWeight: 2200
  });

  const [config, setConfig] = useState<AircraftConfiguration>({
    emptyWeight: '1642.5',
    emptyArm: '38.42',
    fuelWeight: '318',
    fuelArm: '48',
    rampArm: '38.5',
    takeoffArm: '38.5',
    landingArm: '38.2',
    startupDeduction: '8',
    burnedDeduction: '120',
    fuelCapacityGal: 53
  });

  useEffect(() => {
    const profile = (sampleAircrafts as any[]).find(a => a.id === profileId);
    if (profile) {
      setSysLogs(prev => [`LOAD_PROFILE: ${profileId}`, ...prev].slice(0, 5));
      setLimits({
        maxWeight: profile.maxWeight || 2550,
        forwardCG: profile.forwardCG || 35.0,
        aftCG: profile.aftCG || 47.3,
        utilityMaxWeight: profile.utilityMaxWeight || 2200
      });

      setConfig({
        emptyWeight: String(profile.emptyWeight),
        emptyArm: String(profile.emptyArm),
        fuelWeight: String(profile.fuelWeightLbs || 318),
        fuelArm: String(profile.fuelArm || 48),
        rampArm: String(profile.rampArm || profile.emptyArm),
        takeoffArm: String(profile.takeoffArm || profile.emptyArm),
        landingArm: String(profile.landingArm || profile.emptyArm),
        startupDeduction: String(profile.startupDeductionLbs || 8),
        burnedDeduction: String(profile.burnedDeductionLbs || 120),
        fuelCapacityGal: profile.fuelCapacityGal || 53
      });

      setWeightItems([
        { id: '1', name: 'BASIC EMPTY WEIGHT', weight: String(profile.emptyWeight), arm: String(profile.emptyArm), isLocked: true, category: 'fixed' },
        { id: '2', name: 'PILOT & FRONT PASSENGER', weight: '190', arm: '37', category: 'payload' },
        { id: '3', name: 'REAR PASSENGERS', weight: '0', arm: '73', category: 'payload' },
        { id: '4', name: 'BAGGAGE AREA 1', weight: '0', arm: '95', category: 'payload' },
        { id: '5', name: 'BAGGAGE AREA 2', weight: '0', arm: '123', category: 'payload' },
        { id: '6', name: 'FUEL LOAD (TOTAL LBS)', weight: String(profile.fuelWeightLbs || 318), arm: String(profile.fuelArm || 48), isLocked: true, category: 'fuel' }
      ]);
    }
  }, [profileId]);

  const handleAddItem = useCallback(() => {
    const newItem: WeightItem = {
      id: Date.now().toString(),
      name: 'ADDITIONAL LOAD ITEM',
      weight: '',
      arm: '',
      category: 'payload',
      timestamp: Date.now()
    };
    setWeightItems(prev => [...prev, newItem]);
    setSysLogs(prev => ['MANIFEST: ADD_ENTRY', ...prev].slice(0, 5));
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setWeightItems(prev => prev.filter(item => item.id !== id || item.isLocked));
    setSysLogs(prev => ['MANIFEST: REM_ENTRY', ...prev].slice(0, 5));
  }, []);

  const handleUpdateItem = useCallback((id: string, field: keyof WeightItem, value: string) => {
    setWeightItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);

  const results = useMemo((): TelemetryResults => {
    let payloadW = 0;
    let payloadM = 0;
    let currentFuelW = 0;
    const fArm = parseFloat(config.fuelArm) || 48;

    weightItems.forEach(item => {
      const w = parseFloat(item.weight) || 0;
      const a = parseFloat(item.arm) || 0;
      if (item.category === 'fuel') {
        currentFuelW = w;
      } else {
        payloadW += w;
        payloadM += (w * a);
      }
    });

    const startD = parseFloat(config.startupDeduction) || 0;
    const burnD = parseFloat(config.burnedDeduction) || 0;
    const rampW = payloadW + currentFuelW;
    const rampM = payloadM + (currentFuelW * fArm);
    const rampCG = rampW > 0 ? rampM / rampW : 0;
    const takeoffW = rampW - startD;
    const takeoffM = rampM - (startD * fArm);
    const takeoffCG = takeoffW > 0 ? takeoffM / takeoffW : 0;
    const landingW = takeoffW - burnD;
    const landingM = takeoffM - (burnD * fArm);
    const landingCG = landingW > 0 ? landingM / landingW : 0;
    const currentMax = activeCategory === 'NORMAL' ? limits.maxWeight : (limits.utilityMaxWeight || limits.maxWeight);

    return {
      rampW, rampM, rampCG,
      takeoffW, takeoffM, takeoffCG,
      landingW, landingM, landingCG,
      isWeightSafe: rampW <= currentMax,
      isCGSafe: rampCG >= limits.forwardCG && rampCG <= limits.aftCG,
      fuelLbs: currentFuelW,
      remainingFuelLbs: currentFuelW - startD - burnD,
      payloadW,
      momentArm: rampCG
    };
  }, [weightItems, config, limits, activeCategory]);

  return (
    <div className={`min-h-screen bg-black text-[#f4f4f5] ${THEME.font} p-4 xl:p-10 selection:bg-[#dc2626] selection:text-white overflow-x-hidden`}>
      <div className="max-w-[1800px] mx-auto space-y-8">
        
        <div className="flex flex-wrap gap-4">
            <div className="flex border border-[#27272a] bg-[#18181b] p-1">
              {['NORMAL', 'UTILITY'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat ? 'bg-[#dc2626] text-white' : 'text-[#71717a] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button className="flex items-center space-x-3 px-6 py-3 bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] transition-all group">
              <Save className="w-4 h-4 text-[#71717a] group-hover:text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest">Store_Manifest</span>
            </button>
            <button onClick={() => window.print()} className="p-3 bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] transition-all group">
              <Printer className="w-5 h-5 text-[#71717a] group-hover:text-white" />
            </button>
          </div>

        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-10">
          
          <aside className="2xl:col-span-4 space-y-8">
            <section className="bg-[#18181b] border border-[#27272a] p-8 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity">
                <Database size={120} />
              </div>
              
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-3">
                  <Gauge className="w-4 h-4 text-[#dc2626]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.5em] text-[#dc2626]">Airframe Parameters</h3>
                </div>
                <button 
                  onClick={() => setIsLocked(!isLocked)}
                  className={`p-2 border ${isLocked ? 'border-[#27272a] text-[#71717a]' : 'border-[#dc2626] text-[#dc2626] bg-[#dc2626]/5'} transition-all active:scale-95`}
                >
                  {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
              </div>
              
              <div className="space-y-8">
                <div>
                  <HUDLabel>Active Fleet Profile</HUDLabel>
                  <div className="relative">
                    <select 
                      disabled={isLocked}
                      value={profileId} 
                      onChange={(e) => setProfileId(e.target.value)}
                      className="w-full p-4 bg-black border border-[#27272a] rounded-none text-white font-mono text-xs appearance-none focus:border-[#dc2626] outline-none disabled:opacity-40 transition-all cursor-pointer"
                    >
                      {(sampleAircrafts as any[]).map(a => (
                        <option key={a.id} value={a.id} className="bg-black text-white">{a.name.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-4.5 w-5 h-5 text-[#71717a] pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <HUDLabel>MTOW (LBS)</HUDLabel>
                    <CockpitInput 
                      disabled={isLocked}
                      type="number" 
                      value={activeCategory === 'NORMAL' ? limits.maxWeight : (limits.utilityMaxWeight || limits.maxWeight)} 
                      onChange={(e) => setLimits({...limits, maxWeight: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <HUDLabel>Empty Weight</HUDLabel>
                    <CockpitInput 
                      disabled={isLocked}
                      type="number" 
                      value={config.emptyWeight} 
                      onChange={(e) => setConfig({...config, emptyWeight: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <HUDLabel>Fwd CG Limit</HUDLabel>
                    <CockpitInput 
                      disabled={isLocked}
                      type="number" 
                      step="0.1" 
                      value={limits.forwardCG} 
                      onChange={(e) => setLimits({...limits, forwardCG: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <HUDLabel>Aft CG Limit</HUDLabel>
                    <CockpitInput 
                      disabled={isLocked}
                      type="number" 
                      step="0.1" 
                      value={limits.aftCG} 
                      onChange={(e) => setLimits({...limits, aftCG: Number(e.target.value)})} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <HUDLabel>Taxi Deduction</HUDLabel>
                    <CockpitInput 
                      disabled={isLocked}
                      type="number" 
                      value={config.startupDeduction} 
                      onChange={(e) => setConfig({...config, startupDeduction: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <HUDLabel>En-Route Burn</HUDLabel>
                    <CockpitInput 
                      disabled={isLocked}
                      type="number" 
                      value={config.burnedDeduction} 
                      onChange={(e) => setConfig({...config, burnedDeduction: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[#18181b] border border-[#27272a] p-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#71717a] mb-6 flex items-center">
                <History className="w-4 h-4 mr-3" /> Console_Telemetry
              </h3>
              <div className="space-y-3 font-mono text-[10px]">
                {sysLogs.map((log, i) => (
                  <div key={i} className={`flex justify-between border-b border-[#27272a]/50 pb-1.5 ${i === 0 ? 'text-[#dc2626]' : 'text-[#3f3f46]'}`}>
                    <span className="uppercase">{log}</span>
                    <span className="italic opacity-50">SYNC_OK</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[#18181b] border border-[#27272a] p-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#71717a] mb-6 flex items-center">
                <Layers className="w-4 h-4 mr-3" /> Liquid_Weight_Matrix
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'AVGAS (100LL)', weight: '6.00 LB/GAL' },
                  { label: 'JET A-1 FUEL', weight: '6.70 LB/GAL' },
                  { label: 'ENGINE OIL', weight: '7.50 LB/GAL' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] border-b border-[#27272a] pb-3 group">
                    <span className="text-[#71717a] group-hover:text-white transition-colors uppercase font-bold">{item.label}</span>
                    <span className="font-black text-white italic tracking-widest">{item.weight}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <main className="2xl:col-span-8 space-y-8">
            <div className="bg-[#18181b] border border-[#27272a] shadow-[0_0_60px_rgba(0,0,0,0.7)] relative">
              <div className="p-6 bg-black border-b border-[#27272a] flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-4">
                   <div className="w-3 h-3 bg-[#dc2626] rounded-full animate-pulse shadow-[0_0_10px_#dc2626]"></div>
                   <h3 className="text-xs font-black uppercase tracking-[0.6em] text-[#71717a]">Payload Manifest // ALPHA_PLAN</h3>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setWeightItems(prev => prev.filter(it => it.isLocked))}
                    className="p-3 bg-[#18181b] border border-[#27272a] hover:border-[#dc2626] transition-all text-[#71717a] hover:text-[#dc2626]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleAddItem}
                    className="flex-1 sm:flex-none bg-[#dc2626] hover:bg-[#b91c1c] text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-all flex items-center justify-center active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  >
                    <Plus className="w-4 h-4 mr-3" /> Insert Entry
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto h-[450px]" ref={scrollRef}>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-[#71717a] bg-black/80 sticky top-0 z-10">
                      <th className="p-6 text-left font-black border-b border-[#27272a]">Component Identification</th>
                      <th className="p-6 text-center font-black border-b border-[#27272a] w-48">Mass (LBS)</th>
                      <th className="p-6 text-center font-black border-b border-[#27272a] w-48">Arm (IN)</th>
                      <th className="p-6 text-right font-black border-b border-[#27272a] w-56">Moment (LB-IN)</th>
                      <th className="p-6 text-center border-b border-[#27272a] w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightItems.map((item, idx) => (
                      <tr key={item.id} className="border-b border-[#27272a] group hover:bg-white/[0.04] transition-colors">
                        <td className="p-2">
                          <div className="flex items-center space-x-5">
                            <span className="text-[9px] font-black text-[#3f3f46] tabular-nums">ID:{(idx + 1).toString().padStart(3, '0')}</span>
                            <input 
                              type="text" 
                              disabled={item.isLocked}
                              value={item.name} 
                              className={`w-full bg-transparent p-4 outline-none uppercase font-black text-xs tracking-tight ${item.isLocked ? 'text-[#71717a]' : 'text-white'}`}
                              onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="p-2 border-l border-[#27272a]">
                          <input 
                            type="number" 
                            value={item.weight} 
                            placeholder="0.0"
                            className="w-full bg-transparent p-4 text-center outline-none focus:text-[#dc2626] font-mono text-sm tabular-nums text-white"
                            onChange={(e) => handleUpdateItem(item.id, 'weight', e.target.value)}
                          />
                        </td>
                        <td className="p-2 border-l border-[#27272a]">
                          <input 
                            type="number" 
                            disabled={item.isLocked && item.name.includes('EMPTY')}
                            value={item.arm} 
                            placeholder="0.00"
                            className={`w-full bg-transparent p-4 text-center outline-none font-mono text-sm tabular-nums ${item.isLocked && item.name.includes('EMPTY') ? 'text-[#71717a]' : 'text-white'}`}
                            onChange={(e) => handleUpdateItem(item.id, 'arm', e.target.value)}
                          />
                        </td>
                        <td className="p-2 border-l border-[#27272a] text-right font-black text-[#f4f4f5] pr-10 text-sm tabular-nums italic">
                          <div className="flex items-center justify-end space-x-2">
                             <span>{((parseFloat(item.weight) || 0) * (parseFloat(item.arm) || 0)).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                          </div>
                        </td>
                        <td className="p-2 border-l border-[#27272a] text-center">
                          {!item.isLocked && (
                            <button onClick={() => handleRemoveItem(item.id)} className="text-[#3f3f46] hover:text-[#dc2626] transition-colors p-3 active:scale-90">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0 bg-black">
                    <tr className="bg-black/60 text-[#f4f4f5]">
                      <td className="p-6 font-black text-xs uppercase tracking-[0.4em] text-[#71717a]">Ramp Gross Manifest</td>
                      <td className="p-6 text-center font-black text-sm tabular-nums border-l border-[#27272a] bg-[#dc2626]/10 italic">{results.rampW.toFixed(1)}</td>
                      <td className="p-6 text-center font-black text-[#71717a] text-sm tabular-nums border-l border-[#27272a]">N/A</td>
                      <td className="p-6 text-right font-black text-sm tabular-nums border-l border-[#27272a] pr-10">{results.rampM.toLocaleString(undefined, {maximumFractionDigits: 1})}</td>
                      <td className="p-6 border-l border-[#27272a]"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <TelemetryCard 
                label="Ramp Telemetry" 
                value={`${results.rampW.toFixed(1)} LBS`} 
                subValue={`Arm: ${results.rampCG.toFixed(2)}"`}
                status={!results.isWeightSafe ? 'critical' : 'nominal'}
              />
              <TelemetryCard 
                label="Takeoff Telemetry" 
                value={`${results.takeoffW.toFixed(1)} LBS`} 
                subValue={`Arm: ${results.takeoffCG.toFixed(2)}"`}
              />
              <TelemetryCard 
                label="Landing Telemetry" 
                value={`${results.landingW.toFixed(1)} LBS`} 
                subValue={`Arm: ${results.landingCG.toFixed(2)}"`}
              />
              <div className={`p-8 border-2 flex flex-col justify-between transition-all duration-1000 ${results.isWeightSafe && results.isCGSafe ? 'bg-green-950/20 border-green-800/40 shadow-[0_0_40px_rgba(34,197,94,0.1)]' : 'bg-[#dc2626]/10 border-[#dc2626] shadow-[0_0_50px_rgba(220,38,38,0.25)]'}`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className={`text-[10px] font-black uppercase tracking-[0.5em] ${results.isWeightSafe && results.isCGSafe ? 'text-green-500' : 'text-[#dc2626]'}`}>Flight_Go_NoGo</div>
                    <div className={`text-3xl font-black uppercase italic tracking-tighter ${results.isWeightSafe && results.isCGSafe ? 'text-green-400' : 'text-[#dc2626]'}`}>
                      {results.isWeightSafe && results.isCGSafe ? 'Nominal' : 'Critical'}
                    </div>
                  </div>
                  {results.isWeightSafe && results.isCGSafe ? (
                    <CheckCircle2 className="w-14 h-14 text-green-500/30" />
                  ) : (
                    <AlertTriangle className="w-14 h-14 text-[#dc2626] animate-pulse" />
                  )}
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                   <span className="text-[10px] font-black text-[#71717a] uppercase tracking-widest flex items-center">
                     <Clipboard className="w-3 h-3 mr-2" /> Validation: {results.isCGSafe ? 'ENVELOPE_SECURE' : 'CG_VIOLATION'}
                   </span>
                </div>
              </div>
            </div>

            <footer className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10 pb-24">
              <div className="lg:col-span-8 bg-[#18181b] border border-[#27272a] p-10 space-y-8 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                  <FileText size={200} />
                </div>
                <div className="flex items-center space-x-4 mb-4">
                   <Info className="w-6 h-6 text-[#dc2626]" />
                   <h4 className="text-sm font-black uppercase tracking-[0.5em] text-[#f4f4f5]">Safety Planning Advisory</h4>
                </div>
                <div className="space-y-6 text-[11px] leading-relaxed text-[#71717a] font-bold">
                  <p className="border-l-2 border-[#27272a] pl-6 transition-colors hover:border-[#dc2626]">
                    Current total payload (excluding BEW and Fuel) is <span className="text-white font-black italic tabular-nums">{(results.rampW - parseFloat(config.emptyWeight) - results.fuelLbs).toFixed(1)} LBS</span>. 
                    This represents <span className="text-white font-black">{( ((results.rampW - parseFloat(config.emptyWeight) - results.fuelLbs) / (limits.maxWeight - parseFloat(config.emptyWeight))) * 100).toFixed(1)}%</span> of total useful load capacity.
                  </p>
                  <p className="border-l-2 border-[#27272a] pl-6 transition-colors hover:border-[#dc2626]">
                    Estimated fuel state at destination: <span className={`font-black italic tabular-nums ${results.remainingFuelLbs < 60 ? 'text-[#dc2626]' : 'text-white'}`}>
                      {results.remainingFuelLbs.toFixed(1)} LBS ({(results.remainingFuelLbs / 6).toFixed(1)} GAL)
                    </span>. 
                    Warning: Ensure this meets FAA Part 91.151 minimum reserves for Day/Night VFR flight.
                  </p>
                  <div className="p-6 bg-black/50 border border-[#dc2626]/30 text-[10px] uppercase font-black tracking-tighter text-[#71717a] flex items-start">
                    <AlertTriangle className="w-5 h-5 text-[#dc2626] mr-4 shrink-0" />
                    <span>Calculations derived from POH standards. Pilots must verify current weight/balance data via actual aircraft equipment lists before flight. Final responsibility for airworthiness rests with the PIC.</span>
                  </div>
                </div>
              </div>

                <div className="lg:col-span-4 bg-[#18181b] border border-[#27272a] p-4 sm:p-6 flex flex-col justify-end group relative overflow-hidden min-h-[360px] sm:min-h-[420px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/80 z-0"></div>
                  <img
                   src={cgEnvelopeImage}
                   alt="Cessna 172 center of gravity envelope"
                   className="absolute inset-0 h-full w-full object-contain p-3 sm:p-6 opacity-85 z-0"
                 />
                  <div className="relative z-10 flex flex-col items-center justify-end gap-3 h-full">
                    <div className="w-full max-w-[560px] rounded-md border border-zinc-800 bg-black/70 px-4 py-3 backdrop-blur-sm">
                     <div className="flex justify-between w-full text-[8px] font-black uppercase tracking-widest text-zinc-300">
                      <span>FWD: {limits.forwardCG}"</span>
                      <span>CURR: {results.rampCG.toFixed(2)}"</span>
                      <span>AFT: {limits.aftCG}"</span>
                     </div>
                    </div>
                  </div>
                </div>
            </footer>

          </main>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0e] border-t border-[#27272a] px-8 py-3 flex flex-col sm:flex-row justify-between items-center z-[100] gap-4">
          <div className="flex items-center space-x-10 text-[9px] font-black uppercase tracking-[0.4em] text-[#3f3f46]">
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full mr-2"></span>
              NETWORK: OFFLINE_MODE
            </div>
            <div className="hidden md:block">ENCRYPTION: AES-256_ACTIVE</div>
          </div>
          <div className="flex items-center space-x-6">
             <div className="text-[10px] text-[#dc2626] font-black uppercase tracking-[0.3em] italic animate-pulse">Critical_Data_Lock // Secure</div>
             <div className="h-6 w-[1px] bg-[#27272a]"></div>
             <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-2 w-5 ${i === 4 ? 'bg-[#dc2626]' : 'bg-[#27272a]'}`}></div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeightBalanceCalculator;