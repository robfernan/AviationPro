import React, { useState } from 'react';
import { useAviation } from './hooks/useAviation';

// --- Import Unified Modules ---
import CX6Calculator from './components/CX6Calculator';
import WeatherCalculator from './components/WeatherCalculator';
import FlightLogs from './components/FlightLogs';
import ToolsHub from './components/ToolsHub';

const runtime = (window as any).runtime;
const isDesktop = !!runtime;

const App: React.FC = () => {
  const { flights } = useAviation();
  const [activeTab, setActiveTab] = useState<'PLANNER' | 'WEATHER' | 'LOGS' | 'TOOLS'>('PLANNER');

  const handleQuit = () => isDesktop && runtime.Quit();
  const handleMinimise = () => isDesktop && runtime.WindowMinimise();

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-zinc-100 font-mono overflow-hidden border border-zinc-800 shadow-2xl">
      
      {/* 🛠️ RESPONSIVE NAVBAR / DRAG BAR */}
      <nav 
        style={{ ["--wails-draggable" as any]: "drag" }}
        className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-2 sm:px-4 py-2 select-none shrink-0"
      >
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-red-600 font-black tracking-tighter text-lg sm:text-xl italic">AVPRO</span>
        </div>
        
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-black border border-zinc-800 rounded-sm px-1" style={{ ["--wails-draggable" as any]: "no-drag" }}>
          {(['PLANNER', 'WEATHER', 'LOGS', 'TOOLS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-w-[58px] sm:min-w-[70px] px-2 sm:px-3 py-2 sm:py-3 text-[8px] sm:text-[9px] font-black tracking-widest transition-all border-r border-zinc-800 shrink-0 ${
                activeTab === tab ? 'bg-red-700 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
              }`}
            >
              {/* Responsive Labeling */}
              <span className="sm:hidden">{tab.substring(0, 3)}</span>
              <span className="hidden sm:inline">{tab}</span>
            </button>
          ))}

          {isDesktop && (
            <div className="hidden md:flex items-center border-l border-zinc-800 ml-2 pl-1">
              <button onClick={handleMinimise} className="px-2 text-zinc-600 hover:text-white text-lg">⎯</button>
              <button onClick={handleQuit} className="px-2 text-zinc-600 hover:bg-red-700 hover:text-white text-sm">✕</button>
            </div>
          )}
        </div>
      </nav>

      {/* 📱 VIEWPORT (Hardware Instrument Surface) */}
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar min-h-0" style={{ WebkitOverflowScrolling: 'touch' } as any}>
        
        {activeTab === 'PLANNER' && (
          <div className="h-full w-full animate-in fade-in duration-500 min-h-0">
            <CX6Calculator darkMode={true} />
          </div>
        )}

        {activeTab === 'WEATHER' && <WeatherCalculator darkMode={true} />}
        {activeTab === 'LOGS' && <FlightLogs darkMode={true} />}
        {activeTab === 'TOOLS' && (
          <ToolsHub darkMode={true} />
        )}

      </main>

      {/* 📟 STATUS BAR */}
      <footer className="h-8 bg-zinc-900 border-t border-zinc-800 px-2 sm:px-4 flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-600 uppercase tracking-widest shrink-0">
        <div className="flex gap-2 sm:gap-4 min-w-0">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Nominal</span>
          <span className="whitespace-nowrap">Logs: {flights.length}</span>
        </div>
        <div className="text-red-900 font-bold hidden sm:block whitespace-nowrap">100% OFFLINE // PRE-FLIGHT_SUITE</div>
      </footer>
    </div>
  );
};

export default App;