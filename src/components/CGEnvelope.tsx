import React from 'react';

interface CGEnvelopeProps {
  cg: number;
  weight: number;
  takeoffCG?: number;
  takeoffWeight?: number;
  landingCG?: number;
  landingWeight?: number;
  forwardCG?: number;
  aftCG?: number;
  maxWeight?: number;
  emptyWeight?: number;
}

export const CGEnvelope: React.FC<CGEnvelopeProps> = ({
  cg,
  weight,
  takeoffCG,
  takeoffWeight,
  landingCG,
  landingWeight,
  forwardCG = 35.0,
  aftCG = 47.3,
  maxWeight = 2550,
  emptyWeight = 1500,
}) => {
  const cgSpan = Math.max(8, aftCG - forwardCG);
  const minCG = Math.floor(forwardCG - cgSpan * 0.18);
  const maxCG = Math.ceil(aftCG + cgSpan * 0.18);
  const minWeight = Math.floor((emptyWeight || 1500) * 0.85);
  const chartMaxWeight = Math.ceil(maxWeight * 1.05);

  const mapX = (val: number) => Math.max(0, Math.min(100, ((val - minCG) / (maxCG - minCG)) * 100));
  const mapY = (val: number) =>
    Math.max(0, Math.min(100, 100 - ((val - minWeight) / (chartMaxWeight - minWeight)) * 100));

  const baseWeight = Math.max(minWeight + 50, Math.round((emptyWeight || 1500) * 0.92));
  const kneeWeight = Math.round(baseWeight + (maxWeight - baseWeight) * 0.45);
  const slopedFwdCG = Number((forwardCG + cgSpan * 0.25).toFixed(2));

  const normalPoints = `
    ${mapX(forwardCG)},${mapY(baseWeight)}
    ${mapX(forwardCG)},${mapY(kneeWeight)}
    ${mapX(slopedFwdCG)},${mapY(maxWeight)}
    ${mapX(aftCG)},${mapY(maxWeight)}
    ${mapX(aftCG)},${mapY(baseWeight)}
  `;

  const utilMaxW = Math.round(maxWeight * 0.86);
  const utilAftCG = Number((forwardCG + cgSpan * 0.45).toFixed(2));
  const utilSlopedFwd = Number((forwardCG + cgSpan * 0.18).toFixed(2));
  const utilityPoints = `
    ${mapX(forwardCG)},${mapY(baseWeight)}
    ${mapX(forwardCG)},${mapY(kneeWeight)}
    ${mapX(utilSlopedFwd)},${mapY(utilMaxW)}
    ${mapX(utilAftCG)},${mapY(utilMaxW)}
    ${mapX(utilAftCG)},${mapY(baseWeight)}
  `;

  const minAllowedCGAtWeight =
    weight <= kneeWeight
      ? forwardCG
      : forwardCG + ((weight - kneeWeight) / Math.max(1, maxWeight - kneeWeight)) * (slopedFwdCG - forwardCG);

  const isNormalSafe = weight <= maxWeight && cg >= minAllowedCGAtWeight && cg <= aftCG;

  const weightSteps = Array.from({ length: 5 }, (_, i) =>
    Math.round(baseWeight + ((maxWeight - baseWeight) / 4) * i)
  );
  const armSteps = Array.from({ length: 4 }, (_, i) =>
    Number((forwardCG + ((aftCG - forwardCG) / 3) * i).toFixed(1))
  );

  return (
    <div className="w-full h-full min-h-[340px] bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 sm:p-6 flex flex-col justify-between relative group select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isNormalSafe ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Dynamic CG Envelope ({forwardCG}"–{aftCG}" | Max {maxWeight} lbs)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-1 bg-emerald-500/40 border border-emerald-500 inline-block" /> Normal
          </span>
          <span className="flex items-center gap-1 text-sky-400">
            <span className="w-2.5 h-1 bg-sky-500/40 border border-sky-500 inline-block" /> Utility
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 w-full my-2 min-h-[220px]">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="normalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="utilityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {weightSteps.map((w) => (
            <g key={w}>
              <line
                x1="0"
                y1={mapY(w)}
                x2="100"
                y2={mapY(w)}
                stroke="#1e293b"
                strokeWidth="0.35"
                strokeDasharray="1 2"
              />
              <text x="1" y={mapY(w) - 1} fill="#64748b" fontSize="2.8" fontFamily="monospace">
                {w}
              </text>
            </g>
          ))}

          {armSteps.map((arm) => (
            <g key={arm}>
              <line
                x1={mapX(arm)}
                y1="0"
                x2={mapX(arm)}
                y2="100"
                stroke="#1e293b"
                strokeWidth="0.35"
                strokeDasharray="1 2"
              />
              <text x={mapX(arm) + 0.5} y="98" fill="#64748b" fontSize="2.8" fontFamily="monospace">
                {arm}"
              </text>
            </g>
          ))}

          {/* Normal Category Boundary */}
          <polygon points={normalPoints} fill="url(#normalGrad)" stroke="#10b981" strokeWidth="0.8" />

          {/* Utility Category Boundary */}
          <polygon
            points={utilityPoints}
            fill="url(#utilityGrad)"
            stroke="#0ea5e9"
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
              stroke="#38bdf8"
              strokeWidth="0.75"
              strokeDasharray="1 1"
            />
          )}

          {/* Landing Target Point */}
          {landingCG && landingWeight && (
            <circle
              cx={mapX(landingCG)}
              cy={mapY(landingWeight)}
              r="1.3"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="0.3"
            />
          )}

          {/* Crosshairs for Current Ramp Gross Weight */}
          <line
            x1="0"
            y1={mapY(weight)}
            x2="100"
            y2={mapY(weight)}
            stroke={isNormalSafe ? '#10b981' : '#f43f5e'}
            strokeWidth="0.35"
            strokeDasharray="2 2"
            opacity="0.8"
          />
          <line
            x1={mapX(cg)}
            y1="0"
            x2={mapX(cg)}
            y2="100"
            stroke={isNormalSafe ? '#10b981' : '#f43f5e'}
            strokeWidth="0.35"
            strokeDasharray="2 2"
            opacity="0.8"
          />

          {/* Center-of-Gravity Tracking Crosshair */}
          <circle
            cx={mapX(cg)}
            cy={mapY(weight)}
            r="4"
            fill="none"
            stroke={isNormalSafe ? '#10b981' : '#f43f5e'}
            strokeWidth="0.5"
            opacity="0.5"
          />
          <circle
            cx={mapX(cg)}
            cy={mapY(weight)}
            r="2"
            fill={isNormalSafe ? '#10b981' : '#f43f5e'}
            stroke="#ffffff"
            strokeWidth="0.5"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            ARM: <strong className="text-slate-100">{cg.toFixed(2)}"</strong>
          </span>
          <span className="text-slate-400">
            RAMP WT: <strong className="text-slate-100">{weight.toFixed(0)} lbs</strong>
          </span>
        </div>
        <div
          className={`px-2.5 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase ${
            isNormalSafe
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
              : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
          }`}
        >
          {isNormalSafe ? 'Within CG Envelope' : 'Outside CG Envelope'}
        </div>
      </div>
    </div>
  );
};
