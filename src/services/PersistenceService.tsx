import Dexie, { Table } from 'dexie';
import { FlightLog, Aircraft } from '../types/aviation';

// --- Phase 1: Unified Schema Definitions ---

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes: string;
}

export interface Checklist {
  id?: number;
  name: string;
  type: 'preflight' | 'cruise' | 'descent' | 'landing' | 'custom';
  items: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
}

export class AviationProDB extends Dexie {
  flights!: Table<FlightLog>;
  aircraft!: Table<Aircraft>;
  checklists!: Table<Checklist>;

  constructor() {
    super('AviationProDB');

    this.version(2).stores({
      flights: '++id, date, aircraftNNumber, timestamp',
      aircraft: '++id, tailNumber',
      checklists: '++id, name, type'
    });
  }

  // Helper methods for easy access
  async saveFlight(log: FlightLog) {
    if (log.id) return await this.flights.put(log);
    return await this.flights.add(log);
  }

  async getAllFlights() {
    return await this.flights.orderBy('timestamp').reverse().toArray();
  }

  async saveChecklist(checklist: Checklist) {
    checklist.updatedAt = Date.now();
    if (checklist.id) return await this.checklists.put(checklist);
    checklist.createdAt = Date.now();
    return await this.checklists.add(checklist);
  }

  async getAllChecklists() {
    return await this.checklists.toArray();
  }

  async deleteChecklist(id: number) {
    return await this.checklists.delete(id);
  }

  async saveAircraft(plane: Aircraft) {
    if (plane.id) return await this.aircraft.put(plane);
    return await this.aircraft.add(plane);
  }

  async getAllAircraft() {
    return await this.aircraft.toArray();
  }

  async deleteAircraft(id: number) {
    return await this.aircraft.delete(id);
  }

  // The "Single-File Backup" export
  async exportBackup() {
    const flights = await this.flights.toArray();
    const aircraft = await this.aircraft.toArray();
    const checklists = await this.checklists.toArray();

    const backup = {
      version: 1,
      timestamp: Date.now(),
      data: { flights, aircraft, checklists }
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `avpro_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }
}

export const db = new AviationProDB();
