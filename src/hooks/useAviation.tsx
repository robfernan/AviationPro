import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/PersistenceService';
import { AviationMath } from '../core/aviationMath';
import { WeatherService } from '../services/WeatherService';
import { FlightLog, Aircraft } from '../types/aviation';

export const useAviation = () => {
  // Reactive queries: UI updates automatically when data changes
  const flights = useLiveQuery(() => db.flights.toArray()) || [];
  const aircraft = useLiveQuery(() => db.aircraft.toArray()) || [];

  const addFlight = async (log: FlightLog) => await db.flights.add(log);
  const addAircraft = async (plane: Aircraft) => await db.aircraft.add(plane);

  return {
    // Data
    flights,
    aircraft,
    
    // Actions
    addFlight,
    addAircraft,
    fetchMetar: WeatherService.fetchMetar,
    
    // Math
    math: AviationMath
  };
};