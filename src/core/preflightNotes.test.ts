import { describe, it, expect, beforeEach } from 'bun:test';
import { useFlightStore } from './flightStore';
import { buildPreflightNotes } from './preflightNotes';

describe('FlightStore & PreflightNotes Integration', () => {
  beforeEach(() => {
    const store = useFlightStore.getState();
    store.setAircraft('c172');
    store.setDepartureAirport('KPBI');
    store.setDestinationAirport('KBCT');
    store.setRunwayHeading(100);
    store.setWind(120, 12, 18);
    store.setAltimeter(29.92);
    store.setTemperature(25);
    store.setFieldElevation(19);
    store.setPilotLimits(undefined, undefined);
  });

  it('returns NO LIMIT SET for default store state when both pilot limits are undefined', () => {
    const store = useFlightStore.getState();
    const xw = store.getCrosswindComponent();
    expect(xw.status).toBe('NO LIMIT SET');

    const mockDate = new Date('2026-11-12T16:50:00Z');
    const notes = buildPreflightNotes(useFlightStore.getState(), mockDate);

    const expectedDefault = [
      'PREFLIGHT KPBI -> KBCT  2026-11-12 1650Z',
      'ACFT  Cessna 172S (sample) (c172)',
      'RWY   10  WIND 120/12G18 (MAG)',
      'XWIND 4 R  HDWIND 11  GUST XWIND 6  LIMIT NONE (PILOT)  NO LIMIT SET',
      'ALT   29.92  OAT 25C  ELEV 19',
      'PA    19  DA 1184 (ROT 1224)',
      'FUEL  8.5 GPH',
      'CALCULATED VALUES - VERIFY WITH POH/AFM'
    ].join('\n');

    expect(notes).toBe(expectedDefault);
  });

  it('evaluates tailwind limit independently when crosswind limit is undefined', () => {
    const store = useFlightStore.getState();
    // Runway 100, wind 280/12 -> 12 kt tailwind
    store.setRunwayHeading(100);
    store.setWind(280, 12);

    // Set tailwind limit = 10 kt, crosswind limit = undefined
    store.setPilotLimits(undefined, 10);
    const xwExceeds = useFlightStore.getState().getCrosswindComponent();
    expect(xwExceeds.tailwindKt).toBe(12);
    expect(xwExceeds.status).toBe('EXCEEDS');

    // Set tailwind limit = 15 kt, crosswind limit = undefined
    store.setPilotLimits(undefined, 15);
    const xwOk = useFlightStore.getState().getCrosswindComponent();
    expect(xwOk.status).toBe('OK');
  });

  it('normalizes wind direction 0 to 360 and runway heading 0 to 360', () => {
    const store = useFlightStore.getState();
    store.setRunwayHeading(0);
    store.setWind(0, 10, 5); // gust <= speed should be cleared to undefined

    const s = useFlightStore.getState();
    expect(s.runwayHeading).toBe(360);
    expect(s.windDirection).toBe(360);
    expect(s.windGust).toBeUndefined();
  });

  it('matches the preflight notes snapshot when pilot limit is explicitly set to 15', () => {
    const store = useFlightStore.getState();
    store.setPilotLimits(15, 10);

    const mockDate = new Date('2026-11-12T16:50:00Z');
    const notes = buildPreflightNotes(useFlightStore.getState(), mockDate);

    const expectedWithLimit = [
      'PREFLIGHT KPBI -> KBCT  2026-11-12 1650Z',
      'ACFT  Cessna 172S (sample) (c172)',
      'RWY   10  WIND 120/12G18 (MAG)',
      'XWIND 4 R  HDWIND 11  GUST XWIND 6  LIMIT 15 (PILOT)  OK',
      'ALT   29.92  OAT 25C  ELEV 19',
      'PA    19  DA 1184 (ROT 1224)',
      'FUEL  8.5 GPH',
      'CALCULATED VALUES - VERIFY WITH POH/AFM'
    ].join('\n');

    expect(notes).toBe(expectedWithLimit);
  });
});
