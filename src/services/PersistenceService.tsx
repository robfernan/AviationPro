import Dexie, { Table } from 'dexie';
import { FlightLog, Aircraft } from '../types/aviation';

export class AviationProDB extends Dexie {
  flights!: Table<FlightLog>;
  aircraft!: Table<Aircraft>;

  constructor() {
    super('AviationProDB');
    this.version(1).stores({
      flights: '++id, date, origin, destination',
      aircraft: '++id, tailNumber'
    });
  }
}

export const db = new AviationProDB();