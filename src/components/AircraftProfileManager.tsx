import React, { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';
import sampleAircrafts from '../data/sampleAircrafts.json';
import { saveAircraftProfile, getAllAircraftProfiles, AircraftProfile } from '../utils/indexedDB';

interface AircraftProfileManagerProps {
  darkMode: boolean;
}

const AircraftProfileManager: React.FC<AircraftProfileManagerProps> = ({ darkMode }) => {
  const [aircrafts, setAircrafts] = useState<AircraftProfile[]>([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAircrafts = async () => {
    try {
      const saved = await getAllAircraftProfiles();
      setAircrafts(saved);
      if (saved.length > 0 && !selectedAircraftId) {
        setSelectedAircraftId(saved[0].id);
      }
    } catch (error) {
      console.error('Failed to load aircraft profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAircrafts();
  }, []);

  const loadSampleAircrafts = async () => {
    const samples = (sampleAircrafts as any[]).map(aircraft => ({
      id: `${aircraft.id}-${Date.now()}-${Math.random()}`,
      name: aircraft.name,
      type: aircraft.name,
      emptyWeight: aircraft.emptyWeight,
      emptyArm: aircraft.emptyArm,
      maxWeight: aircraft.maxWeight,
      forwardCG: aircraft.forwardCG,
      aftCG: aircraft.aftCG,
      fuelWeightLbs: aircraft.fuelWeightLbs || 318,
      fuelArm: aircraft.fuelArm || 48,
      fuelCapacity: aircraft.fuelCapacityGal || aircraft.usableFuelGal || 42,
      rampArm: aircraft.emptyArm,
      takeoffArm: aircraft.emptyArm,
      landingArm: aircraft.emptyArm,
      startupDeductionLbs: aircraft.startupDeductionLbs || 8,
      burnedDeductionLbs: aircraft.burnedDeductionLbs || 120,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));

    for (const aircraft of samples) {
      await saveAircraftProfile(aircraft);
    }

    await loadAircrafts();
  };

  if (loading) {
    return <div className={`p-6 ${darkMode ? 'text-zinc-100' : 'text-zinc-100'}`}>Loading aircraft profiles...</div>;
  }

  return (
    <div className={`flex flex-col h-full border border-zinc-800 bg-black shadow-2xl overflow-hidden ${darkMode ? '' : ''}`}>
      <div className="flex items-center gap-3 mb-6 p-6 border-b border-zinc-800 bg-zinc-900">
        <Plane className="text-red-500" size={32} />
        <h1 className="text-3xl font-bold text-white">Aircraft Profiles</h1>
      </div>

      {aircrafts.length === 0 ? (
        <div className="p-6 rounded text-center bg-zinc-900">
          <p className="text-zinc-300 mb-4">
            No aircraft profiles yet. Load sample aircraft or create a custom profile.
          </p>
          <button
            onClick={loadSampleAircrafts}
            className="px-6 py-3 rounded font-semibold transition bg-red-700 text-white hover:bg-red-800"
          >
            Load Sample Aircraft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
            <h2 className="text-lg font-semibold mb-4 text-white">My Aircraft</h2>
            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
              {aircrafts.map(aircraft => (
                <button
                  key={aircraft.id}
                  onClick={() => {
                    setSelectedAircraftId(aircraft.id);
                  }}
                  className={`w-full text-left px-4 py-3 rounded transition text-sm ${
                    selectedAircraftId === aircraft.id
                      ? 'bg-red-700 text-white'
                      : 'bg-black text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {aircraft.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AircraftProfileManager;
