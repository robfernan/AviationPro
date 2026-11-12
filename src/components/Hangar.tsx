import { useState, useEffect } from 'react';
import { Plane, Trash2, CheckCircle2 } from 'lucide-react';
import { db } from '../services/PersistenceService';
import { Aircraft } from '../types/aviation';
import { useFlightStore } from '../core/flightStore';

interface HangarProps {
  darkMode: boolean;
}

const Hangar: React.FC<HangarProps> = () => {
  const flightStore = useFlightStore();
  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newPlane, setNewPlane] = useState<Aircraft>({
    tailNumber: '',
    model: '',
    emptyWeight: 0,
    emptyArm: 0,
    maxGrossWeight: 0,
  });

  const loadFleet = async () => {
    try {
      const items = await db.getAllAircraft();
      setFleet(items);
    } catch (err) {
      console.error('Failed to load fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, []);

  const handleSavePlane = async () => {
    if (!newPlane.tailNumber.trim()) {
      alert('Please enter a tail number');
      return;
    }

    try {
      await db.saveAircraft({
        ...newPlane,
        tailNumber: newPlane.tailNumber.toUpperCase(),
      });
      setIsAdding(false);
      setNewPlane({
        tailNumber: '',
        model: '',
        emptyWeight: 0,
        emptyArm: 0,
        maxGrossWeight: 0,
      });
      await loadFleet();
    } catch (err) {
      console.error('Failed to save aircraft:', err);
    }
  };

  const handleDeletePlane = async (id: number | undefined) => {
    if (!id) return;
    if (confirm('Remove this aircraft from your hangar?')) {
      await db.deleteAircraft(id);
      await loadFleet();
    }
  };

  const inputClass =
    'bg-slate-950 text-slate-100 border border-slate-800 rounded-md px-3 py-2 w-full text-sm font-mono';

  if (loading) return <div className="p-6 text-slate-400 font-mono text-sm">Loading hangar profiles...</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6 rounded-xl border border-slate-800/80 bg-slate-950/90 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Plane size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">Aircraft Hangar & Training Presets</h1>
            <p className="text-xs text-slate-400">
              Select a standard training airframe preset for instant preflight calculations or manage custom tail numbers.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
            isAdding
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-sky-600 text-white hover:bg-sky-500 shadow-sm'
          }`}
        >
          {isAdding ? 'Cancel' : '+ Add Custom Tail Number'}
        </button>
      </div>

      {/* Built-in Training Presets (Phase 1.3) */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Standard Training Fleet Presets (Synced with Calculators & W&B)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {flightStore.aircraftList.map((preset) => {
            const isSelected = flightStore.selectedAircraftId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => flightStore.setAircraft(preset.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950/30 border-sky-500/60 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{preset.name}</h3>
                    <p className="text-xs font-mono text-sky-400 uppercase">{preset.id}</p>
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">Empty Wt</div>
                    <div className="text-xs font-mono text-slate-200">{preset.emptyWeight} lbs</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">CG Arm</div>
                    <div className="text-xs font-mono text-slate-200">{preset.emptyArm} in</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">Fuel Flow</div>
                    <div className="text-xs font-mono text-slate-200">{preset.fuelBurnGPH ?? '--'} GPH</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdding && (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Register Custom Club / School Airframe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Tail Number</label>
              <input
                type="text"
                placeholder="N172SP"
                value={newPlane.tailNumber}
                onChange={(e) => setNewPlane({ ...newPlane, tailNumber: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Model / Variant</label>
              <input
                type="text"
                placeholder="Cessna 172S"
                value={newPlane.model}
                onChange={(e) => setNewPlane({ ...newPlane, model: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Empty Weight (lbs)</label>
              <input
                type="number"
                value={newPlane.emptyWeight || ''}
                onChange={(e) => setNewPlane({ ...newPlane, emptyWeight: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Empty Arm (in)</label>
              <input
                type="number"
                value={newPlane.emptyArm || ''}
                onChange={(e) => setNewPlane({ ...newPlane, emptyArm: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Max Gross (lbs)</label>
              <input
                type="number"
                value={newPlane.maxGrossWeight || ''}
                onChange={(e) => setNewPlane({ ...newPlane, maxGrossWeight: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
          </div>
          <button
            onClick={handleSavePlane}
            className="w-full py-3 bg-sky-600 text-white rounded-lg font-semibold uppercase tracking-wider text-xs hover:bg-sky-500 transition-all shadow-sm"
          >
            Save Airframe to Local Hangar
          </button>
        </div>
      )}

      {/* Custom Saved Fleet */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Saved Custom Tail Numbers ({fleet.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fleet.length === 0 && !isAdding && (
            <div className="col-span-full p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-400">
              <p className="text-xs">No custom tail numbers saved yet. Click "+ Add Custom Tail Number" to add your school or club aircraft.</p>
            </div>
          )}

          {fleet.map((plane) => (
            <div key={plane.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 relative group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 font-mono">{plane.tailNumber}</h3>
                  <p className="text-xs font-medium text-sky-400 uppercase">{plane.model}</p>
                </div>
                <button
                  onClick={() => handleDeletePlane(plane.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Empty WT</div>
                  <div className="text-xs font-mono text-slate-200">{plane.emptyWeight} lbs</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Empty ARM</div>
                  <div className="text-xs font-mono text-slate-200">{plane.emptyArm} in</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hangar;
