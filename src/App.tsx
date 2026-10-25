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
    <div className="min-h-screen sm:h-screen w-full flex flex-col bg-black text-zinc-100 font-mono overflow-x-hidden sm:overflow-hidden border border-zinc-800/80 shadow-2xl">
      
      {/* 🛠️ RESPONSIVE NAVBAR / DRAG BAR */}
      <nav 
        style={{ ["--wails-draggable" as any]: "drag" }}
        className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 sm:px-4 py-2 select-none shrink-0"
      >
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-red-600 font-black tracking-tighter text-lg sm:text-xl italic">AVPRO</span>
          <span className="hidden md:inline text-[9px] uppercase tracking-widest text-zinc-500 font-bold border-l border-zinc-800 pl-2">
            CX-6 / E6B Mission Suite
          </span>
        </div>
        
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-black border border-zinc-800 rounded px-1 py-0.5" style={{ ["--wails-draggable" as any]: "no-drag" }}>
          {(['NAVLOG', 'CX6', 'WEATHER', 'LOGS', 'TOOLS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-w-[60px] sm:min-w-[72px] px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold tracking-wider transition-all rounded-sm shrink-0 ${
                activeTab === tab ? 'bg-red-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span className="sm:hidden">{tab === 'NAVLOG' ? 'PLAN' : tab === 'CX6' ? 'CX6' : tab === 'WEATHER' ? 'WX' : tab === 'LOGS' ? 'LOG' : 'TOOL'}</span>
              <span className="hidden sm:inline">{tab === 'NAVLOG' ? 'NAVLOG' : tab}</span>
            </button>
          ))}

          {isDesktop && (
            <div className="hidden md:flex items-center border-l border-zinc-800 ml-2 pl-1">
              <button onClick={handleMinimise} className="px-2 text-zinc-500 hover:text-white text-base leading-none">⎯</button>
              <button onClick={handleQuit} className="px-2 text-zinc-500 hover:bg-red-700 hover:text-white text-sm leading-none">✕</button>
            </div>
          )}
        </div>
      </nav>

      {/* 📡 EDITORIAL LIVE NOAA TELEMETRY RIBBON */}
      <AviationTelemetryRibbon onSelectWeatherTab={() => setActiveTab('WEATHER')} />

      {/* 📱 VIEWPORT (Hardware Instrument Surface) */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar min-h-0" style={{ WebkitOverflowScrolling: 'touch' } as any}>
        {activeTab === 'NAVLOG' && (
          <div className="h-full w-full animate-in fade-in duration-300 min-h-0">
            <PlannerHub darkMode={true} />
          </div>
        )}

        {activeTab === 'CX6' && (
          <div className="h-full w-full animate-in fade-in duration-300 min-h-0">
            <CX6Calculator darkMode={true} />
          </div>
        )}

        {activeTab === 'WEATHER' && (
          <div className="h-full w-full animate-in fade-in duration-300 min-h-0">
            <WeatherCalculator darkMode={true} />
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="h-full w-full animate-in fade-in duration-300 min-h-0">
            <FlightLogs darkMode={true} />
          </div>
        )}

        {activeTab === 'TOOLS' && (
          <div className="h-full w-full animate-in fade-in duration-300 min-h-0">
            <ToolsHub darkMode={true} />
          </div>
        )}
      </main>

      {/* 📟 STATUS BAR */}
      <footer className="h-8 bg-zinc-950 border-t border-zinc-800/80 px-3 sm:px-4 flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Nominal</span>
          <span className="whitespace-nowrap">Logs: {flights.length}</span>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <span className="hidden sm:inline text-zinc-600">Robert Fernandez • FAA Student Pilot</span>
        </div>
        <div className="text-red-600/90 font-bold hidden sm:block whitespace-nowrap">100% OFFLINE // PRE-FLIGHT_SUITE</div>
      </footer>
    </div>
  );
};

export default App;
