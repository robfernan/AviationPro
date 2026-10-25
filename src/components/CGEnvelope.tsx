import React from 'react';

interface CGEnvelopeProps {
  cg: number;
  weight: number;
  takeoffCG?: number;
  takeoffWeight?: number;
  landingCG?: number;
  landingWeight?: number;
}

export const CGEnvelope: React.FC<CGEnvelopeProps> = ({ 
  cg, 
  weight,
  takeoffCG,
  takeoffWeight,
  landingCG,
  landingWeight 
}) => {
  // Constants for Cessna 172 Standard Normal & Utility Envelope
  const minCG = 33, maxCG = 49;
  const minWeight = 1400, maxWeight = 2650;

  // Map real-world data to SVG coordinate space (0-100)
  const mapX = (val: number) => Math.max(0, Math.min(100, ((val - minCG) / (maxCG - minCG)) * 100));
  const mapY = (val: number) => Math.max(0, Math.min(100, 100 - ((val - minWeight) / (maxWeight - minWeight)) * 100));

  // C172 Normal Category Polygon vertices:
  // (35", 1500 lbs) -> (35", 1950 lbs) -> (38.5", 2550 lbs) -> (47.3", 2550 lbs) -> (47.3", 1500 lbs)
  const normalPoints = `
    ${mapX(35.0)},${mapY(1500)} 
    ${mapX(35.0)},${mapY(1950)} 
    ${mapX(38.5)},${mapY(2550)} 
    ${mapX(47.3)},${mapY(2550)} 
    ${mapX(47.3)},${mapY(1500)}
  `;

  // C172 Utility Category Polygon vertices (Max 2200 lbs):
  // (35", 1500 lbs) -> (35", 1950 lbs) -> (37.5", 2200 lbs) -> (40.5", 2200 lbs) -> (40.5", 1500 lbs)
  const utilityPoints = `
    ${mapX(35.0)},${mapY(1500)} 
    ${mapX(35.0)},${mapY(1950)} 
    ${mapX(37.5)},${mapY(2200)} 
    ${mapX(40.5)},${mapY(2200)} 
    ${mapX(40.5)},${mapY(1500)}
  `;

  // Check if current Ramp point is inside Normal limits
  const isNormalSafe = (weight <= 2550) && (cg >= 35.0) && (cg <= 47.3) && (
    weight <= 1950 ? true : cg >= (35.0 + ((weight - 1950) / (2550 - 1950)) * (38.5 - 35.0))
  );

  return (
    <div className="w-full h-full min-h-[340px] bg-zinc-950 border border-zinc-800 p-4 sm:p-6 flex flex-col justify-between relative group select-none">
      
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-900 z-10">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isNormalSafe ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
            DYNAMIC CG VECTOR ENVELOPE
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-1 bg-emerald-500/40 border border-emerald-500 inline-block" /> Normal
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <span className="w-2.5 h-1 bg-blue-500/40 border border-blue-500 inline-block" /> Utility
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 w-full my-2 min-h-[220px]">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="normalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="utilityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[1600, 1800, 2000, 2200, 2400, 2550].map(w => (
            <g key={w}>
              <line x1="0" y1={mapY(w)} x2="100" y2={mapY(w)} stroke="#27272a" strokeWidth="0.3" strokeDasharray="1 2" />
              <text x="1" y={mapY(w) - 1} fill="#52525b" fontSize="2.8" fontFamily="monospace">{w}</text>
            </g>
          ))}

          {[36, 40, 44, 48].map(arm => (
            <g key={arm}>
              <line x1={mapX(arm)} y1="0" x2={mapX(arm)} y2="100" stroke="#27272a" strokeWidth="0.3" strokeDasharray="1 2" />
              <text x={mapX(arm) + 0.5} y="98" fill="#52525b" fontSize="2.8" fontFamily="monospace">{arm}"</text>
            </g>
          ))}

          {/* Normal Category Boundary */}
          <polygon 
            points={normalPoints}
            fill="url(#normalGrad)"
            stroke="#10b981"
            strokeWidth="0.8"
          />

          {/* Utility Category Boundary */}
          <polygon 
            points={utilityPoints}
            fill="url(#utilityGrad)"
            stroke="#3b82f6"
            strokeWidth="0.6"
            strokeDasharray="2 1"
          />

          {/* Flight Path Vector: Ramp -> Takeoff -> Landing */}
          {takeoffCG && landingCG && takeoffWeight && landingWeight && (
            <polyline
              points={`
                ${mapX(cg)},${mapY(weight)}
                ${mapX(takeoffCG)},${mapY(takeoffWeight)}
                ${mapX(landingCG)},${mapY(landingWeight)}
              `}
              fill="none"
              stroke="#e11d48"
              strokeWidth="0.75"
              strokeDasharray="1 1"
            />
          )}

          {/* Landing Target Point */}
          {landingCG && landingWeight && (
            <circle cx={mapX(landingCG)} cy={mapY(landingWeight)} r="1.3" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.3" />
          )}

          {/* Crosshairs for Current Ramp Gross Weight */}
          <line x1="0" y1={mapY(weight)} x2="100" y2={mapY(weight)} stroke={isNormalSafe ? "#10b981" : "#ef4444"} strokeWidth="0.35" strokeDasharray="2 2" opacity="0.8" />
          <line x1={mapX(cg)} y1="0" x2={mapX(cg)} y2="100" stroke={isNormalSafe ? "#10b981" : "#ef4444"} strokeWidth="0.35" strokeDasharray="2 2" opacity="0.8" />

          {/* Glowing Center-of-Gravity Tracking Crosshair */}
          <circle cx={mapX(cg)} cy={mapY(weight)} r="4" fill="none" stroke={isNormalSafe ? "#10b981" : "#ef4444"} strokeWidth="0.5" opacity="0.5" />
          <circle cx={mapX(cg)} cy={mapY(weight)} r="2" fill={isNormalSafe ? "#10b981" : "#ef4444"} stroke="#ffffff" strokeWidth="0.5" className="animate-pulse" />
        </svg>
      </div>

      {/* Real-time Envelope Diagnostic Telemetry Footer */}
      <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono">
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">ARM: <strong className="text-zinc-100">{cg.toFixed(2)}"</strong></span>
          <span className="text-zinc-500">RAMP WT: <strong className="text-zinc-100">{weight.toFixed(0)} lbs</strong></span>
        </div>
        <div className={`px-2 py-0.5 rounded font-black text-[9px] tracking-wider uppercase ${
          isNormalSafe ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-red-950/80 text-red-300 border border-red-800 animate-pulse'
        }`}>
          {isNormalSafe ? 'ENVELOPE: WITHIN NORMAL LIMITS' : 'ALERT: CG OUTSIDE ENVELOPE'}
        </div>
      </div>
    </div>
  );
};
