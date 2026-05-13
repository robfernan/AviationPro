import React, { useState } from 'react';
import { useAviation } from './hooks/useAviation';
import { WeatherReport, WCAResult } from './types/aviation';

// Wails Runtime Helpers - provided by Wails at runtime
const runtime = (window as any).runtime;
const isDesktop = !!runtime;

const App: React.FC = () => {
  // Destructuring all tools from our custom hook
  const { math, fetchMetar, flights, aircraft, addFlight } = useAviation();
  
  const [activeTab, setActiveTab] = useState<'PLANNER' | 'WEATHER' | 'LOGS' | 'HANGAR'>('PLANNER');

  // Calculator State
  const [course, setCourse] = useState(0);
  const [tas, setTas] = useState(100);
  const [windDir, setWindDir] = useState(0);
  const [windSpd, setWindSpd] = useState(0);
  const [wcaResult, setWcaResult] = useState<WCAResult | null>(null);

  // Weather State
  const [icao, setIcao] = useState("");
  const [weather, setWeather] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(false);

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
    alert("Flight calculation committed to local IndexedDB.");
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-zinc-100 font-mono overflow-hidden">
      
      {/* 🛠️ NAVIGATION / DRAG BAR (Silhouette) */}
      <nav 
        style={{ ["--wails-draggable" as any]: "drag" }}
        className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-2 select-none shrink-0"
      >
        <div className="flex items-center gap-4">
          <span className="text-red-600 font-black tracking-tighter text-2xl italic">AVPRO</span>
          <div className="h-4 w-[1px] bg-zinc-800 hidden md:block"></div>
          <span className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase italic hidden md:block">Precision Hardware Suite</span>
        </div>
        
        <div className="flex items-center gap-1" style={{ ["--wails-draggable" as any]: "no-drag" }}>
          {(['PLANNER', 'WEATHER', 'LOGS', 'HANGAR'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 text-[11px] font-bold tracking-widest transition-all ${
                activeTab === tab ? 'bg-red-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
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

      {/* MAIN VIEWPORT (Internal Scrolling Only) */}
      <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        
        {/* TAB: PLANNER */}
        {activeTab === 'PLANNER' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <section className="space-y-6">
              <h2 className="text-xl font-black border-l-4 border-red-700 pl-3">CX-6 COMPUTER</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="COURSE" value={course} onChange={(v) => setCourse(Number(v))} unit="°" />
                <Input label="TAS" value={tas} onChange={(v) => setTas(Number(v))} unit="KT" />
                <Input label="WIND DIR" value={windDir} onChange={(v) => setWindDir(Number(v))} unit="°" />
                <Input label="WIND SPD" value={windSpd} onChange={(v) => setWindSpd(Number(v))} unit="KT" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCalcWCA} className="flex-1 bg-zinc-100 text-black py-3 font-black hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">
                  Calculate
                </button>
                {wcaResult && (
                  <button onClick={handleSaveToLog} className="bg-zinc-800 text-white px-4 hover:bg-zinc-700 transition-all uppercase text-[10px] font-bold">
                    Save to Log
                  </button>
                )}
              </div>
            </section>

            <section className="bg-zinc-900/30 border border-zinc-800 p-8 flex flex-col justify-center">
                {wcaResult ? (
                  <div className="space-y-8">
                    <ResultBlock label="HEADING (TH)" value={`${wcaResult.heading}°`} />
                    <ResultBlock label="GROUND SPEED" value={`${wcaResult.groundSpeed} KT`} />
                    <ResultBlock label="WIND CORRECTION" value={`${wcaResult.windCorrectionAngle}°`} color="text-red-500" />
                  </div>
                ) : (
                  <div className="text-zinc-600 italic text-center">Awaiting inputs...</div>
                )}
            </section>
          </div>
        )}

        {/* TAB: WEATHER */}
        {activeTab === 'WEATHER' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-black border-l-4 border-red-700 pl-3 uppercase">METAR Fetcher</h2>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-zinc-900 border border-zinc-700 p-4 text-2xl uppercase font-black focus:border-red-600 outline-none"
                placeholder="ICAO CODE"
                value={icao}
                onChange={(e) => setIcao(e.target.value.toUpperCase())}
                maxLength={4}
              />
              <button onClick={handleWeather} disabled={loading} className="bg-red-700 px-8 font-black">
                {loading ? '...' : 'FETCH'}
              </button>
            </div>
            {weather && (
              <div className="bg-zinc-900 border-l-4 border-zinc-100 p-6 font-mono overflow-x-auto">
                <p className="text-zinc-500 text-[10px] mb-2">{weather.timestamp} // {weather.isOffline ? 'CACHED/OFFLINE' : 'LIVE_LINK'}</p>
                <p className="text-lg uppercase italic whitespace-pre-wrap">{weather.raw}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: LOGS (Now uses 'flights') */}
        {activeTab === 'LOGS' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-black border-l-4 border-red-700 pl-3 uppercase">Pre-Flight History</h2>
            <div className="border border-zinc-800 bg-zinc-950">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 text-[10px] text-zinc-500 uppercase">
                  <tr>
                    <th className="p-4 border-b border-zinc-800">Date</th>
                    <th className="p-4 border-b border-zinc-800">Calculation Summary</th>
                    <th className="p-4 border-b border-zinc-800 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {flights.length > 0 ? flights.map(f => (
                    <tr key={f.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                      <td className="p-4 text-zinc-400">{f.date}</td>
                      <td className="p-4 font-bold">{f.route}</td>
                      <td className="p-4 text-red-600 text-right">{f.duration} HR</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="p-20 text-center text-zinc-600 italic">No historical logs found in local storage.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: HANGAR (Now uses 'aircraft') */}
        {activeTab === 'HANGAR' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-black border-l-4 border-red-700 pl-3 uppercase">Registered Fleet</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aircraft.length > 0 ? aircraft.map(a => (
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 p-6 hover:border-red-600 transition-colors">
                  <div className="text-red-600 font-black text-2xl tracking-tighter italic">{a.tailNumber}</div>
                  <div className="text-xs text-zinc-400 uppercase tracking-widest mt-1">{a.model}</div>
                  <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 text-[10px] text-zinc-500 uppercase">
                    <div>Empty Wt: <span className="text-white">{a.emptyWeight}</span></div>
                    <div>Empty Arm: <span className="text-white">{a.emptyArm}</span></div>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center p-24 border border-zinc-900 text-zinc-700 uppercase tracking-[0.3em] font-black">
                  FLEET_DATABASE_EMPTY
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <footer className="bg-zinc-900 border-t border-zinc-800 px-6 py-2 flex justify-between text-[9px] text-zinc-600 uppercase tracking-[0.2em] shrink-0">
        <div>System: Nominal // HP Debian Station</div>
        <div className="text-zinc-500">AviationPro // LocalDB Active</div>
      </footer>
    </div>
  );
};

// --- Typesafe UI Components ---
interface InputProps { label: string; value: number | string; onChange: (v: string) => void; unit: string; }
const Input: React.FC<InputProps> = ({ label, value, onChange, unit }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[9px] font-bold text-zinc-500 tracking-widest">{label}</label>
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