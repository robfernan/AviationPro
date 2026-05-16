// src/core/aviationMath.ts
export const AviationMath = {
  // 1. Wind Triangle (WCA & Groundspeed)
  calculateWCA: (course: number, tas: number, windDir: number, windSpd: number) => {
    const courseRad = course * (Math.PI / 180);
    const windDirRad = windDir * (Math.PI / 180);
    const swc = (windSpd / tas) * Math.sin(windDirRad - courseRad);
    if (Math.abs(swc) > 1) return { heading: 0, groundSpeed: 0, windCorrectionAngle: 0, error: "Wind exceeds TAS" };
    const wcaRad = Math.asin(swc);
    const gs = tas * Math.sqrt(1 - Math.pow(swc, 2)) - windSpd * Math.cos(windDirRad - courseRad);
    return {
      heading: Math.round((course + wcaRad * (180 / Math.PI) + 360) % 360),
      groundSpeed: Math.round(gs),
      windCorrectionAngle: Math.round(wcaRad * (180 / Math.PI) * 10) / 10
    };
  },

  // 2. True Airspeed (TAS)
  calculateTAS: (ias: number, pa: number, temp: number) => {
    const standardTemp = 15 - (pa / 1000 * 2);
    const tempRatio = (temp + 273.15) / (standardTemp + 273.15);
    const densityRatio = Math.pow(1 - pa / 44330, 4.256);
    return Math.round(ias * Math.sqrt(tempRatio / densityRatio));
  },

  // 3. Time-Speed-Distance (TSD)
  calculateTSD: (val1: number, val2: number, mode: 'distance' | 'time' | 'speed') => {
    if (mode === 'distance') return (val1 * val2).toFixed(1); // Time * Speed
    if (mode === 'time') return (val1 / val2).toFixed(2);     // Distance / Speed
    if (mode === 'speed') return (val1 / val2).toFixed(1);    // Distance / Time
    return "0";
  },

  // 4. Fuel Planning
  calculateFuel: (flow: number, time: number) => (flow * time).toFixed(1),

  // 5. Crosswind Components
  calculateCrosswind: (runway: number, windDir: number, windSpd: number) => {
    let angle = Math.abs(runway - windDir);
    if (angle > 180) angle = 360 - angle;
    const rad = angle * (Math.PI / 180);
    const xwind = Math.round(windSpd * Math.sin(rad));
    const headwind = Math.round(windSpd * Math.cos(rad));
    const windToRunway = (windDir - runway + 360) % 360;
    return {
      xwind,
      headwind,
      direction: xwind === 0 ? '' : (windToRunway > 180 ? 'LEFT' : 'RIGHT')
    };
  }
};