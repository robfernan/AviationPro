import { FlightState } from './flightStore';

/**
 * Generates plain-text preflight dispatch notes in standard ASCII format.
 * No emoji, pure UTC timestamp, no third-party branding.
 */
export function buildPreflightNotes(state: FlightState, customDate?: Date): string {
  const d = customDate || new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const mins = String(d.getUTCMinutes()).padStart(2, '0');
  const timeStr = `${year}-${month}-${day} ${hours}${mins}Z`;

  const dep = state.departureAirport || '----';
  const dest = state.destinationAirport || '----';
  const acftName = state.currentAircraft?.name || 'Aircraft';
  const acftId = state.currentAircraft?.id || 'acft';

  // Runway display format: 100 deg -> '10' or raw heading if non-standard
  const rwyNum = Math.round(state.runwayHeading / 10);
  const rwyStr = rwyNum > 0 && rwyNum <= 36 ? String(rwyNum).padStart(2, '0') : String(state.runwayHeading);

  // Wind display: 120/12 or 120/12G18
  const windDirStr = String(state.windDirection).padStart(3, '0');
  const windSpdStr = String(state.windSpeed);
  const gustStr = state.windGust ? `G${state.windGust}` : '';
  const windStr = `${windDirStr}/${windSpdStr}${gustStr}`;

  // Crosswind analysis
  const xwRes = state.getCrosswindComponent();
  const xwVal = xwRes.crosswindKt !== null ? xwRes.crosswindKt : '--';
  const xwSide = xwRes.side ? ` ${xwRes.side}` : '';
  const windComponentStr =
    xwRes.tailwindKt !== null && xwRes.tailwindKt > 0
      ? `TLWIND ${xwRes.tailwindKt}`
      : `HDWIND ${xwRes.headwindKt !== null ? xwRes.headwindKt : '--'}`;
  const gustXwStr = xwRes.gustCrosswindKt !== undefined ? `  GUST XWIND ${xwRes.gustCrosswindKt}` : '';
  const limitStr =
    state.pilotMaxCrosswindKnots !== undefined
      ? `  LIMIT ${state.pilotMaxCrosswindKnots} (PILOT)`
      : '  LIMIT NONE (PILOT)';
  const statusStr = xwRes.status;

  // Altimeter, OAT, Elev
  const altStr = state.altimeterInHg.toFixed(2);
  const oatStr = state.temperatureC;
  const elevStr = state.fieldElevationFt;

  // Altitudes
  const pa = state.getPressureAltitude();
  const da = state.getDensityAltitude();
  const paStr = pa !== null ? String(pa) : '--';
  const daExactStr = da.exactFt !== null ? String(da.exactFt) : '--';
  const daRotStr = da.ruleOfThumbFt !== null ? String(da.ruleOfThumbFt) : '--';

  // Fuel
  const fuelGPH = state.currentAircraft?.fuelBurnGPH !== undefined ? state.currentAircraft.fuelBurnGPH : 0;

  return [
    `PREFLIGHT ${dep} -> ${dest}  ${timeStr}`,
    `ACFT  ${acftName} (${acftId})`,
    `RWY   ${rwyStr}  WIND ${windStr} (MAG)`,
    `XWIND ${xwVal}${xwSide}  ${windComponentStr}${gustXwStr}${limitStr}  ${statusStr}`,
    `ALT   ${altStr}  OAT ${oatStr}C  ELEV ${elevStr}`,
    `PA    ${paStr}  DA ${daExactStr} (ROT ${daRotStr})`,
    `FUEL  ${fuelGPH} GPH`,
    `CALCULATED VALUES - VERIFY WITH POH/AFM`
  ].join('\n');
}

/**
 * Copies preflight notes to clipboard with standard navigator.clipboard and fallback.
 */
export async function copyPreflightNotesToClipboard(notes: string): Promise<boolean> {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(notes);
      return true;
    } catch {
      // Fall through to textarea fallback
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = notes;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}
