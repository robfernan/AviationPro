export interface FplWaypoint {
  identifier: string;
  type?: 'AIRPORT' | 'VOR' | 'NDB' | 'INTERSECTION' | 'USER WAYPOINT';
  countryCode?: string;
  lat?: number;
  lon?: number;
}

export interface FplFlightPlanData {
  flightRules?: 'VFR' | 'IFR';
  aircraftType?: string;
  tailNumber?: string;
  cruisingAltitudeFt?: number;
  trueAirspeedKt?: number;
  departure: string;
  destination: string;
  routeWaypoints?: string[];
}

/**
 * Exports flight plan to Garmin / ForeFlight standard XML-based .fpl file.
 * Compatible with ForeFlight Mobile, Garmin Pilot, Garmin GTN 650/750, and G1000 avionics.
 */
export function generateForeFlightFPL(data: FplFlightPlanData): string {
  const now = new Date().toISOString();
  const waypoints = [data.departure, ...(data.routeWaypoints || []), data.destination]
    .filter(Boolean)
    .map((wp) => wp.trim().toUpperCase());

  const waypointXml = waypoints
    .map((wp, idx) => `
    <route-point>
      <waypoint-identifier>${wp}</waypoint-identifier>
      <waypoint-type>AIRPORT</waypoint-type>
    </route-point>`)
    .join('');

  return `<?xml version="1.0" encoding="utf-8"?>
<flight-plan xmlns="http://www8.garmin.com/xmlschemas/FlightPlan/v1">
  <created>${now}</created>
  <waypoint-table>
${waypoints
  .map(
    (wp) => `    <waypoint>
      <identifier>${wp}</identifier>
      <type>AIRPORT</type>
      <country-code>K6</country-code>
    </waypoint>`
  )
  .join('\n')}
  </waypoint-table>
  <route>
    <route-name>${data.departure} to ${data.destination}</route-name>
    <flight-plan-index>1</flight-plan-index>
${waypointXml}
  </route>
</flight-plan>`;
}

export function downloadForeFlightFPL(data: FplFlightPlanData, filename?: string): void {
  const xml = generateForeFlightFPL(data);
  const blob = new Blob([xml], { type: 'application/vnd.garmin.fpl+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${data.departure}_${data.destination}.fpl`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
