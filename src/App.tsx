import React, { useState } from 'react';
import { useAviation } from './hooks/useAviation';

// --- Import Unified Modules ---
import PlannerHub from './components/PlannerHub';
import CX6Calculator from './components/CX6Calculator';
import WeatherCalculator from './components/WeatherCalculator';
import FlightLogs from './components/FlightLogs';
import ToolsHub from './components/ToolsHub';
import AviationTelemetryRibbon from './components/AviationTelemetryRibbon';

const runtime = (typeof window !== 'undefined' ? (window as any).runtime : null);
const isDesktop = !!runtime;

const App: React.FC = () => {
  const { flights } = useAviation();
  const [activeTab, setActiveTab] = useState<'NAVLOG' | 'CX6' | 'WEATHER' | 'LOGS' | 'TOOLS'>('NAVLOG');

  const handleQuit = () => isDesktop && runtime?.Quit();
  const handleMinimise = () => isDesktop && runtime?.WindowMinimise();

  return (
    <div className="min-h-screen sm:h-screen w-full flex flex-col bg-black text-zinc-100 font-mono overflow-x-hidden sm:overflow-hidden border border-zinc-800 shadow-2xl">
      
      {/* 🛠️ ULTRA-WIDE RESPONSIVE NAVBAR / DRAG BAR */}
      <nav 
        style={{ ["--wails-draggable" as any]: "drag" }}
        className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-3 sm:px-6 py-2.5 select-none shrink-0"
      >
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-2.5 h-2.5 bg-red-600 rounded-sm animate-pulse" />
          <span className="text-red-500 font-black tracking-tight text-xl italic">AVIATIONPRO</span>
          <span className="hidden md:inline text-[10px] uppercase tracking-widest text-zinc-400 font-bold border-l border-zinc-800 pl-3">
            Garmin Pilot • ForeFlight • CX-6 Glass Cockpit
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-zinc-900/90 border border-zinc-800 rounded px-1.5 py-1" style={{ ["--wails-draggable" as any]: "no-drag" }}>
          {(['NAVLOG', 'CX6', 'WEATHER', 'LOGS', 'TOOLS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-w-[66px] sm:min-w-[84px] px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold tracking-wider transition-all rounded shrink-0 ${
                activeTab === tab 
                  ? 'bg-red-700 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className="sm:hidden">{tab === 'NAVLOG' ? 'PLAN' : tab === 'CX6' ? 'CX6' : tab === 'WEATHER' ? 'WX' : tab === 'LOGS' ? 'LOG' : 'TOOL'}</span>
              <span className="hidden sm:inline">{tab === 'NAVLOG' ? 'NAVLOG' : tab}</span>
            </button>
          ))}

          {isDesktop && (
            <div className="hidden md:flex items-center border-l border-zinc-800 ml-2 pl-2">
              <button onClick={handleMinimise} className="px-2 text-zinc-400 hover:text-white text-base leading-none">⎯</button>
              <button onClick={handleQuit} className="px-2 text-zinc-400 hover:bg-red-700 hover:text-white text-sm leading-none">✕</button>
            </div>
          )}
        </div>
      </nav>

      {/* 📡 EDITORIAL LIVE NOAA TELEMETRY RIBBON */}
      <AviationTelemetryRibbon onSelectWeatherTab={() => setActiveTab('WEATHER')} />

      {/* 📱 FULL-WIDTH VIEWPORT (High-Legibility Avionics Surface) */}
      <main className="flex-1 overflow-y-auto p-2 sm:p-5 lg:p-6 w-full custom-scrollbar min-h-0" style={{ WebkitOverflowScrolling: 'touch' } as any}>
        {activeTab === 'NAVLOG' && (
          <div className="h-full w-full animate-in fade-in duration-200 min-h-0">
            <PlannerHub darkMode={true} />
          </div>
        )}

        {activeTab === 'CX6' && (
          <div className="h-full w-full animate-in fade-in duration-200 min-h-0">
            <CX6Calculator darkMode={true} />
          </div>
        )}

        {activeTab === 'WEATHER' && (
          <div className="h-full w-full animate-in fade-in duration-200 min-h-0">
            <WeatherCalculator darkMode={true} />
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="h-full w-full animate-in fade-in duration-200 min-h-0">
            <FlightLogs darkMode={true} />
          </div>
        )}

        {activeTab === 'TOOLS' && (
          <div className="h-full w-full animate-in fade-in duration-200 min-h-0">
            <ToolsHub darkMode={true} />
          </div>
        )}
      </main>

      {/* 📟 STATUS BAR */}
      <footer className="h-8 bg-zinc-950 border-t border-zinc-800 px-3 sm:px-6 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Nominal</span>
          <span className="whitespace-nowrap">Logs: <strong className="text-zinc-200">{flights.length}</strong></span>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <span className="hidden sm:inline text-zinc-300">Robert Fernandez • FAA Student Pilot (129.2+ Hrs)</span>
        </div>
        <div className="text-red-500 font-bold hidden sm:block whitespace-nowrap">100% OFFLINE // GARMIN .FPL READY</div>
      </footer>
    </div>
  );
};

export default App;
