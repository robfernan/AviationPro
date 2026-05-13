import React from 'react';

// Removed unused 'CGPoint' interface to satisfy the compiler
export const CGEnvelope: React.FC<{ cg: number, weight: number }> = ({ cg, weight }) => {
  
  // Constants for a Cessna 172 (Standard Envelope Limits)
  const minCG = 34, maxCG = 48;
  const minWeight = 1500, maxWeight = 2550;

  // Map real-world data to SVG percentage-based coordinates (0-100)
  const mapX = (val: number) => ((val - minCG) / (maxCG - minCG)) * 100;
  const mapY = (val: number) => 100 - ((val - minWeight) / (maxWeight - minWeight)) * 100;

  return (
    <div className="w-full aspect-square bg-zinc-950 border border-zinc-800 p-6 relative group">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        
        {/* Background Grid Lines (for that technical look) */}
        {[0, 25, 50, 75, 100].map(grid => (
          <React.Fragment key={grid}>
            <line x1="0" y1={grid} x2="100" y2={grid} className="stroke-zinc-900 stroke-[0.2]" />
            <line x1={grid} y1="0" x2={grid} y2="100" className="stroke-zinc-900 stroke-[0.2]" />
          </React.Fragment>
        ))}

        {/* The CG Envelope Boundary - Calculated for C172 Normal Category */}
        <polygon 
          points={`
            ${mapX(35)},${mapY(1500)} 
            ${mapX(35)},${mapY(1950)} 
            ${mapX(38.5)},${mapY(2550)} 
            ${mapX(47.3)},${mapY(2550)} 
            ${mapX(47.3)},${mapY(1500)}
          `}
          className="fill-red-600/5 stroke-red-600/40 stroke-[0.5] transition-all duration-700"
        />
        
        {/* Dynamic Crosshair (The Pilot's Data Point) */}
        {/* Horizontal Line */}
        <line 
          x1="0" y1={mapY(weight)} x2="100" y2={mapY(weight)} 
          className="stroke-red-900/40 stroke-[0.2] stroke-dasharray-2 transition-all duration-500" 
        />
        {/* Vertical Line */}
        <line 
          x1={mapX(cg)} y1="0" x2={mapX(cg)} y2="100" 
          className="stroke-red-900/40 stroke-[0.2] stroke-dasharray-2 transition-all duration-500" 
        />

        {/* The "Dot" */}
        <circle 
          cx={mapX(cg)} 
          cy={mapY(weight)} 
          r="1.8" 
          className="fill-red-600 shadow-xl animate-pulse transition-all duration-500" 
        />
      </svg>
      
      {/* Visual Identity / Design Authority Metadata */}
      <div className="absolute top-2 right-4 flex flex-col items-end">
        <div className="text-[7px] text-zinc-600 uppercase tracking-[0.3em] font-black">Envelope_V1</div>
        <div className="text-[6px] text-zinc-700 font-mono">TYPE: C172_NORMAL</div>
      </div>

      <div className="absolute bottom-2 left-4 text-[7px] text-zinc-500 font-mono italic">
        X: {cg.toFixed(2)}" // Y: {weight.toFixed(0)} lbs
      </div>
    </div>
  );
};