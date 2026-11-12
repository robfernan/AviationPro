import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/PersistenceService';
import { AviationMath } from '../core/aviationMath';
import { fetchMETAR } from '../utils/weatherService';
import { FlightLog, Aircraft } from '../types/aviation';

export const useAviation = () => {
  const flights = useLiveQuery(() => db.flights.toArray()) || [];
  const aircraft = useLiveQuery(() => db.aircraft.toArray()) || [];

  const addFlight = async (log: FlightLog) => await db.flights.add(log);
  const addAircraft = async (plane: Aircraft) => await db.aircraft.add(plane);

  return {
    flights,
    aircraft,
    addFlight,
    addAircraft,
    fetchMetar: fetchMETAR,
    math: AviationMath
  };
};