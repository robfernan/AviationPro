import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import { useAviation } from './hooks/useAviation';
import { useFlightStore } from './core/flightStore';

// --- Import Unified Modules ---
import PlannerHub from './components/PlannerHub';
import CX6Calculator from './components/CX6Calculator';
import WeatherCalculator from './components/WeatherCalculator';
import FlightLogs from './components/FlightLogs';
import Hangar from './components/Hangar';
import AviationTelemetryRibbon from './components/AviationTelemetryRibbon';

const runtime = typeof window !== 'undefined' ? (window as any).runtime : null;
const isDesktop = !!runtime;

const App: React.FC = () => {
  const { flights } = useAviation();
  const { selectedAircraftId, aircraftList, setAircraft, departureAirport, destinationAirport } = useFlightStore();
  const [activeTab, setActiveTab] = useState<'NAVLOG' | 'CX6' | 'WEATHER' | 'LOGS' | 'HANGAR'>('NAVLOG');

  const handleQuit = () => isDesktop && runtime?.Quit();
  const handleMinimise = () => isDesktop && runtime?.WindowMinimise();

  return (
    <div className="min-h-screen sm:h-screen w-full max-w-[100vw] flex flex-col bg-[#090d16] text-slate-100 overflow-x-hidden sm:overflow-hidden border border-slate-800/80 shadow-2xl">
      {/* RESPONSIVE PRE-FLIGHT DESK NAVBAR */}
      <nav
        style={{ ['--wails-draggable' as any]: 'drag' }}
        className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-800/80 bg-slate-950/95 px-2.5 sm:px-5 py-1.5 sm:py-2 select-none shrink-0"
      >
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Plane size={14} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-slate-100 font-bold tracking-tight text-sm sm:text-base leading-none truncate">
                AviationPro
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 hidden sm:inline truncate">
                Pre-Flight Companion Desk
              </span>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 pl-2 border-l border-slate-800 min-w-0"
            style={{ ['--wails-draggable' as any]: 'no-drag' }}
          >
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold hidden md:inline">
              Airframe:
            </span>
            <select
              value={selectedAircraftId}
              onChange={(e) => setAircraft(e.target.value)}
              className="text-[11px] sm:text-xs font-medium bg-slate-900 border border-slate-700/80 rounded-md px-2 py-1 text-slate-100 focus:border-sky-500 max-w-[155px] sm:max-w-[190px] truncate"
            >
              {aircraftList.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="grid grid-cols-5 sm:flex sm:flex-wrap items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1 w-full sm:w-auto"
          style={{ ['--wails-draggable' as any]: 'no-drag' }}
        >
          {(['NAVLOG', 'CX6', 'WEATHER', 'LOGS', 'HANGAR'] as const).map((tab) => {
            const labelMap = {
              NAVLOG: 'Plan & Brief',
              CX6: 'CX-6',
              WEATHER: 'Weather & DA',
              LOGS: 'Logbook',
              HANGAR: 'Hangar',
            };
            const shortMap = {
              NAVLOG: 'Plan',
              CX6: 'CX-6',
              WEATHER: 'WX',
              LOGS: 'Logs',
              HANGAR: 'Hangar',
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-1.5 sm:px-2.5 md:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold tracking-wide transition-all rounded-md text-center whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <span className="md:hidden">{shortMap[tab]}</span>
                <span className="hidden md:inline">{labelMap[tab]}</span>
              </button>
            );
          })}

          {isDesktop && (
            <div className="hidden md:flex items-center border-l border-slate-800 ml-1 pl-1.5">
              <button onClick={handleMinimise} className="px-1.5 text-slate-400 hover:text-white text-base leading-none">
                ⎯
              </button>
              <button
                onClick={handleQuit}
                className="px-1.5 text-slate-400 hover:bg-rose-600 hover:text-white rounded text-sm leading-none"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* LIVE NOAA METAR & ROUTE RIBBON */}
      <AviationTelemetryRibbon onSelectWeatherTab={() => setActiveTab('WEATHER')} />

      {/* MAIN VIEWPORT */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 lg:p-6 w-full custom-scrollbar min-h-0"
        style={{ WebkitOverflowScrolling: 'touch' } as any}
      >
        {activeTab === 'NAVLOG' && (
          <div className="w-full animate-in fade-in duration-200 min-h-0">
            <PlannerHub darkMode={true} />
          </div>
        )}

        {activeTab === 'CX6' && (
          <div className="w-full animate-in fade-in duration-200 min-h-0">
            <CX6Calculator darkMode={true} />
          </div>
        )}

        {activeTab === 'WEATHER' && (
          <div className="w-full animate-in fade-in duration-200 min-h-0">
            <WeatherCalculator darkMode={true} />
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="w-full animate-in fade-in duration-200 min-h-0">
            <FlightLogs darkMode={true} />
          </div>
        )}

        {activeTab === 'HANGAR' && (
          <div className="w-full animate-in fade-in duration-200 min-h-0">
            <Hangar darkMode={true} />
          </div>
        )}
      </main>

      {/* STATUS BAR */}
      <footer className="min-h-7 py-1 bg-slate-950 border-t border-slate-800/80 px-2.5 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Ready
          </span>
          <span className="text-slate-700">•</span>
          <span className="font-mono text-[11px] sm:text-xs text-slate-300">
            {departureAirport} → {destinationAirport}
          </span>
          <span className="text-slate-700">•</span>
          <span className="whitespace-nowrap">
            Logged Flights: <strong className="text-slate-200 font-mono">{flights.length}</strong>
          </span>
        </div>
        <div className="text-sky-400 font-semibold hidden md:block whitespace-nowrap tracking-wide text-[11px]">
          Offline-First • Standard .FPL Export Ready
        </div>
      </footer>
    </div>
  );
};

export default App;
