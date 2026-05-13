// IndexedDB utility for offline-first data persistence

const DB_NAME = 'AviationProDB';
const DB_VERSION = 2;

export interface AircraftProfile {
  id: string;
  name: string;
  type: string;
  nNumber?: string;
  emptyWeight: number;
  emptyArm: number;
  maxWeight: number;
  forwardCG: number;
  aftCG: number;
  fuelWeightLbs: number;
  fuelArm: number;
  fuelCapacity: number;
  rampArm: number;
  takeoffArm: number;
  landingArm: number;
  startupDeductionLbs: number;
  burnedDeductionLbs: number;
  createdAt: number;
  updatedAt: number;
}

export interface Checklist {
  id: string;
  name: string;
  type: 'preflight' | 'cruise' | 'descent' | 'landing' | 'custom';
  items: ChecklistItem[];
  createdAt: number;
  updatedAt: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes: string;
}

export interface FlightLog {
  id: string;
  date: string;
  aircraftId: string;
  aircraftNNumber: string;
  flightTime: string;
  notes: string;
  departureAirport?: string;
  arrivalAirport?: string;
  timestamp: number;
}

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create stores
      if (!database.objectStoreNames.contains('aircraftProfiles')) {
        database.createObjectStore('aircraftProfiles', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('checklists')) {
        database.createObjectStore('checklists', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('flightLogs')) {
        database.createObjectStore('flightLogs', { keyPath: 'id' });
      }
    };
  });
};

// Aircraft Profiles
export const saveAircraftProfile = async (profile: AircraftProfile): Promise<AircraftProfile> => {
  const database = await initDB();
  const now = Date.now();
  const profileWithTimestamp = {
    ...profile,
    updatedAt: now,
    createdAt: profile.createdAt || now
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['aircraftProfiles'], 'readwrite');
    const store = transaction.objectStore('aircraftProfiles');
    const request = store.put(profileWithTimestamp);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(profileWithTimestamp);
  });
};

export const getAircraftProfile = async (id: string): Promise<AircraftProfile | null> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['aircraftProfiles'], 'readonly');
    const store = transaction.objectStore('aircraftProfiles');
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

export const getAllAircraftProfiles = async (): Promise<AircraftProfile[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['aircraftProfiles'], 'readonly');
    const store = transaction.objectStore('aircraftProfiles');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const deleteAircraftProfile = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['aircraftProfiles'], 'readwrite');
    const store = transaction.objectStore('aircraftProfiles');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Checklists
export const saveChecklist = async (checklist: Checklist): Promise<Checklist> => {
  const database = await initDB();
  const now = Date.now();
  const checklistWithTimestamp = {
    ...checklist,
    updatedAt: now,
    createdAt: checklist.createdAt || now
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['checklists'], 'readwrite');
    const store = transaction.objectStore('checklists');
    const request = store.put(checklistWithTimestamp);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(checklistWithTimestamp);
  });
};

export const getChecklist = async (id: string): Promise<Checklist | null> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['checklists'], 'readonly');
    const store = transaction.objectStore('checklists');
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

export const getAllChecklists = async (): Promise<Checklist[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['checklists'], 'readonly');
    const store = transaction.objectStore('checklists');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const deleteChecklist = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['checklists'], 'readwrite');
    const store = transaction.objectStore('checklists');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Flight Logs
export const saveFlightLog = async (log: FlightLog): Promise<FlightLog> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['flightLogs'], 'readwrite');
    const store = transaction.objectStore('flightLogs');
    const request = store.put(log);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(log);
  });
};

export const getFlightLog = async (id: string): Promise<FlightLog | null> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['flightLogs'], 'readonly');
    const store = transaction.objectStore('flightLogs');
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

export const getAllFlightLogs = async (): Promise<FlightLog[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['flightLogs'], 'readonly');
    const store = transaction.objectStore('flightLogs');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const deleteFlightLog = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['flightLogs'], 'readwrite');
    const store = transaction.objectStore('flightLogs');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Export/Import utilities
export const exportData = async (): Promise<{
  aircraftProfiles: AircraftProfile[];
  checklists: Checklist[];
  flightLogs: FlightLog[];
}> => {
  const [aircraftProfiles, checklists, flightLogs] = await Promise.all([
    getAllAircraftProfiles(),
    getAllChecklists(),
    getAllFlightLogs()
  ]);

  return { aircraftProfiles, checklists, flightLogs };
};

export const importData = async (data: {
  aircraftProfiles?: AircraftProfile[];
  checklists?: Checklist[];
  flightLogs?: FlightLog[];
}): Promise<void> => {
  if (data.aircraftProfiles) {
    for (const profile of data.aircraftProfiles) {
      await saveAircraftProfile(profile);
    }
  }

  if (data.checklists) {
    for (const checklist of data.checklists) {
      await saveChecklist(checklist);
    }
  }

  if (data.flightLogs) {
    for (const log of data.flightLogs) {
      await saveFlightLog(log);
    }
  }
};
