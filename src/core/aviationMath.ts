import { WCAResult } from '../types/aviation';

export const AviationMath = {
  // Pressure Altitude (PA)
  calculatePA: (alt: number, altimeter: number): number => {
    return Math.round(alt + (29.92 - altimeter) * 1000);
  },

  // Density Altitude (DA)
  calculateDA: (pa: number, tempC: number): number => {
    const standardTemp = 15 - (pa / 1000) * 2;
    return Math.round(pa + 120 * (tempC - standardTemp));
  },

  // Wind Correction Angle & Ground Speed (The E6B/CX-6 "Trig")
  calculateWCA: (course: number, tas: number, windDir: number, windSpd: number): WCAResult => {
    const courseRad = course * (Math.PI / 180);
    const windDirRad = windDir * (Math.PI / 180);
    
    const swc = (windSpd / tas) * Math.sin(windDirRad - courseRad);
    
    if (Math.abs(swc) > 1) {
      return { heading: 0, groundSpeed: 0, windCorrectionAngle: 0, error: "Wind exceeds TAS" };
    }

    const wcaRad = Math.asin(swc);
    const wcaDeg = wcaRad * (180 / Math.PI);
    const gs = tas * Math.sqrt(1 - Math.pow(swc, 2)) - windSpd * Math.cos(windDirRad - courseRad);

    return {
      heading: (course + wcaDeg + 360) % 360,
      groundSpeed: Math.round(gs),
      windCorrectionAngle: Math.round(wcaDeg)
    };
  },

  // Weight & Balance CG
  calculateCG: (weights: number[], arms: number[]): number => {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const totalMoment = weights.reduce((sum, w, i) => sum + w * arms[i], 0);
    return totalWeight === 0 ? 0 : parseFloat((totalMoment / totalWeight).toFixed(2));
  }
};