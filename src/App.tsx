import React, { useState } from 'react';
import { useAviation } from './hooks/useAviation';
import { WeatherReport, WCAResult } from './types/aviation';
import { CGEnvelope } from './components/CGEnvelope';

// Wails Runtime Helpers - provided by Wails at runtime
const runtime = (window as any).runtime;
const isDesktop = !!runtime;

const App: React.FC = () => {
  const { math, fetchMetar, flights, aircraft, addFlight, addAircraft } = useAviation();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'PLANNER' | 'WEATHER' | 'LOGS' | 'HANGAR'>('PLANNER');

  // CX-6 Calculator State
  const [course, setCourse] = useState(0);
  const [tas, setTas] = useState(100);
  const [windDir, setWindDir] = useState(0);
  const [windSpd, setWindSpd] = useState(0);
  const [wcaResult, setWcaResult] = useState<WCAResult | null>(null);

  // Weight & Balance State (The visual "Adobe Pro" data)
  const [curWeight, setCurWeight] = useState(2300);
  const [curCG, setCurCG] = useState(41);

  // Weather State
  const [icao, setIcao] = useState("");
  const [weather, setWeather] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Hangar Form State
  const [newTail, setNewTail] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newWeight, setNewWeight] = useState(0);
  const [newArm, setNewArm] = useState(0);

  // --- Handlers ---

  const handleQuit = () => isDesktop && runtime.Quit();
  const handleMinimise = () => isDesktop && runtime.WindowMinimise();
  
  const handleCalcWCA = () => {
    const result = math.calculateWCA(course, tas, windDir, windSpd);
    setWcaResult(result);
  };

  const handleWeather = async () => {
    if (icao.length !== 4) return;
    setLoading(true);
    const report = await fetchMetar(icao);
    setWeather(report);
    setLoading(false);
  };

  const handleSaveToLog = async () => {
    if (!wcaResult) return;
    await addFlight({
      date: new Date().toLocaleDateString(),
      origin: "PLAN",
      destination: "CALC",
      route: `CRS: ${course} TAS: ${tas} WCA: ${wcaResult.windCorrectionAngle}`,
      duration: 0.0
    });
    alert("Flight calculation saved to local IndexedDB.");
  };

  const handleRegisterAircraft = async () => {
    if (!newTail || !newModel) return;
    await addAircraft({
      tailNumber: newTail.toUpperCase(),
      model: newModel.toUpperCase(),
      emptyWeight: newWeight,
      emptyArm: newArm,
      maxGrossWeight: 0
    });
    setNewTail(""); setNewModel(""); setNewWeight(0); setNewArm(0);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-zinc-100 font-mono overflow-hidden border border-zinc-800">
      
      {/* 🛠️ NAVIGATION / DRAG BAR (Unified Silhouette) */}
      <nav 
        style={{ ["--wails-draggable" as any]: "drag" }}
        className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-2 select-none shrink-0"
      >
        <div className="flex items-center gap-4">
          <span className="text-red-600 font-black tracking-tighter text-2xl italic">AVPRO</span>
          <div className="h-4 w-[1px] bg-zinc-800 hidden md:block"></div>
          <span className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase italic hidden md:block">Precision Flight Suite</span>
        </div>
        
        <div className="flex items-center gap-1" style={{ ["--wails-draggable" as any]: "no-drag" }}>
          {(['PLANNER', 'WEATHER', 'LOGS', 'HANGAR'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 text-[11px] font-bold tracking-widest transition-all border-b-2 ${
                activeTab === tab ? 'border-red-600 bg-zinc-800 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}

          {isDesktop && (
            <div className="ml-4 flex items-center border-l border-zinc-800 pl-2">
              <button onClick={handleMinimise} className="px-3 py-1 text-zinc-500 hover:text-white transition-colors text-lg">⎯</button>
              <button onClick={handleQuit} className="px-3 py-1 text-zinc-500 hover:bg-red-700 hover:text-white transition-all text-sm">✕</button>
            </div>
          )}
        </div>
      </nav>

      {/* 📱 MAIN VIEWPORT */}
      <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        
        {/* TAB: PLANNER (The Mission Control Grid) */}
        {activeTab === 'PLANNER' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
            
            {/* LEFT COLUMN: CX-6 FLIGHT COMPUTER */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black border-l-4 border-red-700 pl-3 uppercase">CX-6 Computer</h2>
                {wcaResult && (
                  <button onClick={handleSaveToLog} className="bg-zinc-800 text-[9px] px-3 py-1 hover:bg-zinc-700 uppercase font-black text-zinc-400">
                    Commit to Log
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="COURSE" value={course} onChange={(v) => setCourse(Number(v))} unit="°" />
                <Input label="TAS" value={tas} onChange={(v) => setTas(Number(v))} unit="KT" />
                <Input label="WIND DIR" value={windDir} onChange={(v) => setWindDir(Number(v))} unit="°" />
                <Input label="WIND SPD" value={windSpd} onChange={(v) => setWindSpd(Number(v))} unit="KT" />
              </div>
              <button onClick={handleCalcWCA} className="w-full bg-zinc-100 text-black py-4 font-black hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">
                Calculate Solution
              </button>
              
              {wcaResult && (
                <div className="mt-8 space-y-4 bg-zinc-900/20 p-6 border border-zinc-900 animate-in slide-in-from-left-4">
                  <ResultBlock label="HEADING (TH)" value={`${wcaResult.heading}°`} />
                  <ResultBlock label="GROUND SPEED" value={`${wcaResult.groundSpeed} KT`} />
                  <ResultBlock label="WIND CORRECTION" value={`${wcaResult.windCorrectionAngle}°`} color="text-red-500" />
                </div>
              )}
            </section>

            {/* RIGHT COLUMN: WEIGHT & BALANCE (Visual precision) */}
            <section className="space-y-6">
              <h2 className="text-xl font-black border-l-4 border-red-700 pl-3 uppercase">Weight & Balance</h2>
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Total Weight" value={curWeight} onChange={(v) => setCurWeight(Number(v))} unit="LBS" />
                 <Input label="Calculated CG" value={curCG} onChange={(v) => setCurCG(Number(v))} unit="IN" />
              </div>
              
              {/* THE SVG ENVELOPE COMPONENT */}
              <div className="mt-4 shadow-2xl shadow-red-900/5">
                <CGEnvelope cg={curCG} weight={curWeight} />
              </div>
              
              <div className="text-[10px] text-zinc-600 bg-zinc-900/30 p-4 border border-zinc-800 leading-relaxed uppercase">
                Note: Ensure Center of Gravity remains within the normal category envelope for the specific airframe make/model.
              </div>
            </section>
          </div>
        )}

        {/* TAB: WEATHER */}
        {activeTab === 'WEATHER' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-black border-l-4 border-red-700 pl-3 uppercase">METAR Fetcher</h2>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-zinc-900 border border-zinc-700 p-4 text-2xl uppercase font-black focus:border-red-600 outline-none text-white"
                placeholder="ICAO CODE"
                value={icao}
                onChange={(e) => setIcao(e.target.value.toUpperCase())}
                maxLength={4}
              />
              <button onClick={handleWeather} disabled={loading} className="bg-red-700 px-8 font-black hover:bg-red-600 transition-colors">
                {loading ? '...' : 'FETCH'}
              </button>
            </div>
            {weather && (
              <div className="bg-zinc-900 border border-zinc-800 p-6 font-mono">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-3 py-1 text-[10px] font-black ${weather.raw.includes('VFR') ? 'bg-green-600' : 'bg-red-700'}`}>
                    {weather.raw.includes('VFR') ? 'VFR' : 'IFR/OTHER'}
                  </div>
                  <span className="text-zinc-500 text-[10px]">{weather.timestamp} // {weather.isOffline ? 'OFFLINE' : 'LIVE'}</span>
                </div>
                <p className="text-lg uppercase italic whitespace-pre-wrap text-zinc-200 tracking-wide">{weather.raw}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: LOGS */}
        {activeTab === 'LOGS' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-black border-l-4 border-red-700 pl-3 uppercase">Flight History</h2>
            <div className="border border-zinc-800 bg-zinc-950 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 text-[10px] text-zinc-500 uppercase tracking-widest">
                  <tr>
                    <th className="p-4 border-b border-zinc-800">Date</th>
                    <th className="p-4 border-b border-zinc-800">Route/Calculation</th>
                    <th className="p-4 border-b border-zinc-800 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {flights.length > 0 ? flights.map(f => (
                    <tr key={f.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                      <td className="p-4 text-zinc-500">{f.date}</td>
                      <td className="p-4 font-bold tracking-tight">{f.route}</td>
                      <td className="p-4 text-red-600 text-right font-black">{f.duration} HR</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="p-20 text-center text-zinc-700 uppercase font-black text-xs tracking-widest">No local logs found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: HANGAR */}
        {activeTab === 'HANGAR' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <section className="space-y-6">
              <h2 className="text-xl font-black border-l-4 border-red-700 pl-3 uppercase tracking-tighter">Register Aircraft</h2>
              <div className="bg-zinc-900/50 p-6 border border-zinc-800 space-y-4">
                <Input label="Tail Number" value={newTail} onChange={setNewTail} unit="ID" />
                <Input label="Make/Model" value={newModel} onChange={setNewModel} unit="TYPE" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Empty Weight" value={newWeight} onChange={(v) => setNewWeight(Number(v))} unit="LBS" />
                  <Input label="Empty Arm" value={newArm} onChange={(v) => setNewArm(Number(v))} unit="IN" />
                </div>
                <button onClick={handleRegisterAircraft} className="w-full bg-red-700 text-white py-4 font-black uppercase tracking-widest hover:bg-red-600 transition-all">Add to Fleet</button>
              </div>
            </section>
            <section className="md:col-span-2 space-y-6">
              <h2 className="text-xl font-black border-l-4 border-zinc-700 pl-3 uppercase text-zinc-600">Fleet Database</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aircraft.map(a => (
                  <div key={a.id} className="bg-zinc-900 border border-zinc-800 p-6 group hover:border-red-600 transition-all relative overflow-hidden">
                    <div className="text-red-600 font-black text-3xl italic tracking-tighter">{a.tailNumber}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase mb-4">{a.model}</div>
                    <div className="grid grid-cols-2 text-[10px] text-zinc-600 border-t border-zinc-800 pt-4 uppercase">
                      <div>Weight: <span className="text-zinc-100">{a.emptyWeight}</span></div>
                      <div>Arm: <span className="text-zinc-100">{a.emptyArm}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

      </main>

      {/* 📟 BOTTOM STATUS BAR */}
      <footer className="h-8 bg-zinc-900 border-t border-zinc-800 px-6 flex items-center justify-between text-[9px] text-zinc-600 uppercase tracking-widest shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> System Nominal</span>
          <span>IndexedDB: Ready</span>
        </div>
        <div className="text-zinc-500">AviationPro // Standalone v1.2</div>
      </footer>
    </div>
  );
};

// --- Typesafe UI Sub-Components ---
interface InputProps { label: string; value: number | string; onChange: (v: string) => void; unit: string; }
const Input: React.FC<InputProps> = ({ label, value, onChange, unit }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">{label}</label>
    <div className="relative">
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-red-700 outline-none transition-all font-mono" />
      <span className="absolute right-3 top-3 text-[10px] text-zinc-700 font-bold select-none">{unit}</span>
    </div>
  </div>
);

interface ResultBlockProps { label: string; value: string | number; color?: string; }
const ResultBlock: React.FC<ResultBlockProps> = ({ label, value, color = "text-white" }) => (
  <div className="border-b border-zinc-800 pb-4">
    <div className="text-[10px] text-zinc-500 tracking-[0.2em] mb-1 font-bold uppercase">{label}</div>
    <div className={`text-5xl font-black ${color} tracking-tighter`}>{value}</div>
  </div>
);

export default App;