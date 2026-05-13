import { useState, useEffect } from 'react';
import { Plane, Plus, Trash2, Save, Download, Upload } from 'lucide-react';
import { saveAircraftProfile, getAllAircraftProfiles, deleteAircraftProfile, AircraftProfile, exportData, importData } from '../utils/indexedDB';
import sampleAircrafts from '../data/sampleAircrafts.json';

interface AircraftProfileManagerProps {
  darkMode: boolean;
}

const AircraftProfileManager: React.FC<AircraftProfileManagerProps> = ({ darkMode }) => {
  const [aircrafts, setAircrafts] = useState<AircraftProfile[]>([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [editingAircraft, setEditingAircraft] = useState<AircraftProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAircraftName, setNewAircraftName] = useState('');

  const loadAircrafts = async () => {
    try {
      const saved = await getAllAircraftProfiles();
      setAircrafts(saved);
      if (saved.length > 0 && !selectedAircraftId) {
        setSelectedAircraftId(saved[0].id);
        setEditingAircraft(saved[0]);
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
    // Load sample aircraft as starting templates
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

  const handleCreateNewAircraft = async () => {
    if (!newAircraftName.trim()) {
      alert('Please enter an aircraft name');
      return;
    }

    const newAircraft: AircraftProfile = {
      id: `aircraft-${Date.now()}`,
      name: newAircraftName,
      type: '',
      emptyWeight: 1700,
      emptyArm: 42,
      maxWeight: 2300,
      forwardCG: 35,
      aftCG: 47,
      fuelWeightLbs: 318,
      fuelArm: 48,
      fuelCapacity: 42,
      rampArm: 42,
      takeoffArm: 42,
      landingArm: 42,
      startupDeductionLbs: 8,
      burnedDeductionLbs: 120,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveAircraftProfile(newAircraft);
    setNewAircraftName('');
    await loadAircrafts();
    setSelectedAircraftId(newAircraft.id);
    setEditingAircraft(newAircraft);
  };

  const handleSaveAircraft = async () => {
    if (!editingAircraft) return;
    await saveAircraftProfile(editingAircraft);
    await loadAircrafts();
  };

  const handleDeleteAircraft = async (id: string) => {
    if (confirm('Delete this aircraft profile?')) {
      await deleteAircraftProfile(id);
      await loadAircrafts();
      setSelectedAircraftId(null);
      setEditingAircraft(null);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aviation-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (confirm('This will import aircraft profiles, checklists, and flight logs. Continue?')) {
        await importData(data);
        await loadAircrafts();
        alert('Data imported successfully!');
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };

  const inputClass = 'bg-white text-black border border-gray-300 rounded px-3 py-2 w-full';

  if (loading) {
    return <div className={`p-6 ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>Loading aircraft profiles...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Plane className={darkMode ? 'text-slate-200' : 'text-gray-800'} size={32} />
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
          Aircraft Profiles
        </h1>
      </div>

      {aircrafts.length === 0 ? (
        <div className={`p-6 rounded text-center ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <p className={darkMode ? 'text-slate-300 mb-4' : 'text-gray-700 mb-4'}>
            No aircraft profiles yet. Load sample aircraft or create a custom profile.
          </p>
          <button
            onClick={loadSampleAircrafts}
            className={`px-6 py-3 rounded font-semibold transition ${
              darkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Load Sample Aircraft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Aircraft List */}
          <div className={`p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
              My Aircraft
            </h2>

            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
              {aircrafts.map(aircraft => (
                <button
                  key={aircraft.id}
                  onClick={() => {
                    setSelectedAircraftId(aircraft.id);
                    setEditingAircraft(aircraft);
                  }}
                  className={`w-full text-left px-4 py-3 rounded transition text-sm ${
                    selectedAircraftId === aircraft.id
                      ? darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{aircraft.name}</div>
                  <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {aircraft.type}
                  </div>
                </button>
              ))}
            </div>

            {/* New Aircraft Form */}
            <div className={`p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-300 bg-gray-50'}`}>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Aircraft name"
                  value={newAircraftName}
                  onChange={(e) => setNewAircraftName(e.target.value)}
                  className={inputClass}
                />
                <button
                  onClick={handleCreateNewAircraft}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition ${
                    darkMode
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  <Plus size={18} />
                  Create
                </button>
              </div>
            </div>

            {/* Export/Import */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleExportData}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition text-sm ${
                  darkMode
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <Download size={16} />
                Export All Data
              </button>
              <label className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition text-sm cursor-pointer ${
                darkMode
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}>
                <Upload size={16} />
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Aircraft Editor */}
          {editingAircraft && (
            <div className={`lg:col-span-3 p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    {editingAircraft.name}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Edit aircraft specifications
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAircraft(editingAircraft.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition ${
                    darkMode
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    Basic Information
                  </h3>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Aircraft Name
                    </label>
                    <input
                      type="text"
                      value={editingAircraft.name}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Aircraft Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Cessna 172S"
                      value={editingAircraft.type}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, type: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      N-Number (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., N12345"
                      value={editingAircraft.nNumber || ''}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, nNumber: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Weight & Balance */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    Weight & Balance
                  </h3>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Empty Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={editingAircraft.emptyWeight}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, emptyWeight: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Empty Arm (inches)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingAircraft.emptyArm}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, emptyArm: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Max Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={editingAircraft.maxWeight}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, maxWeight: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* CG Envelope */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    CG Envelope
                  </h3>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Forward CG Limit (inches)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingAircraft.forwardCG}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, forwardCG: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Aft CG Limit (inches)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingAircraft.aftCG}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, aftCG: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Fuel & Performance */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    Fuel & Performance
                  </h3>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Fuel Capacity (gallons)
                    </label>
                    <input
                      type="number"
                      value={editingAircraft.fuelCapacity}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, fuelCapacity: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Fuel Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={editingAircraft.fuelWeightLbs}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, fuelWeightLbs: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Startup Fuel Burn (lbs)
                    </label>
                    <input
                      type="number"
                      value={editingAircraft.startupDeductionLbs}
                      onChange={(e) => setEditingAircraft({ ...editingAircraft, startupDeductionLbs: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-slate-700">
                <button
                  onClick={handleSaveAircraft}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded font-semibold transition ${
                    darkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <Save size={20} />
                  Save Aircraft Profile
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AircraftProfileManager;
