import { useState, useEffect } from 'react';
import { Plane, Plus, Trash2, Save, Anchor } from 'lucide-react';
import { db } from '../services/PersistenceService';
import { Aircraft } from '../types/aviation';

interface HangarProps {
  darkMode: boolean;
}

const Hangar: React.FC<HangarProps> = ({ darkMode }) => {
  const [fleet, setFleet] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newPlane, setNewPlane] = useState<Aircraft>({
    tailNumber: '',
    model: '',
    emptyWeight: 0,
    emptyArm: 0,
    maxGrossWeight: 0
  });

  const loadFleet = async () => {
    try {
      const items = await db.getAllAircraft();
      setFleet(items);
    } catch (err) {
      console.error("Failed to load fleet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, []);

  const handleSavePlane = async () => {
    if (!newPlane.tailNumber.trim()) {
      alert("Please enter a tail number");
      return;
    }

    try {
      await db.saveAircraft({
        ...newPlane,
        tailNumber: newPlane.tailNumber.toUpperCase()
      });
      setIsAdding(false);
      setNewPlane({
        tailNumber: '',
        model: '',
        emptyWeight: 0,
        emptyArm: 0,
        maxGrossWeight: 0
      });
      await loadFleet();
    } catch (err) {
      console.error("Failed to save aircraft:", err);
    }
  };

  const handleDeletePlane = async (id: number | undefined) => {
    if (!id) return;
    if (confirm("Remove this aircraft from your hangar?")) {
      await db.deleteAircraft(id);
      await loadFleet();
    }
  };

  const inputClass = 'bg-black text-white border border-zinc-800 rounded px-3 py-2 w-full text-sm font-mono';

  if (loading) return <div className="p-6 text-zinc-500 font-mono italic">ACCESSING HANGAR...</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6 rounded-lg border border-zinc-800 bg-black shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Plane className="text-red-500" size={32} />
          <h1 className="text-xl sm:text-3xl font-bold text-white uppercase tracking-widest">
            My Hangar
          </h1>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition ${isAdding ? 'bg-zinc-800 text-zinc-400' : 'bg-red-700 text-white hover:bg-red-800'}`}
        >
          {isAdding ? 'Cancel' : 'Add Aircraft'}
        </button>
      </div>

      {isAdding && (
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 text-zinc-500">Register New Airframe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Tail Number</label>
              <input
                type="text"
                placeholder="N12345"
                value={newPlane.tailNumber}
                onChange={e => setNewPlane({...newPlane, tailNumber: e.target.value})}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Model / Variant</label>
              <input
                type="text"
                placeholder="Cessna 172S"
                value={newPlane.model}
                onChange={e => setNewPlane({...newPlane, model: e.target.value})}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Empty Weight (lbs)</label>
              <input
                type="number"
                value={newPlane.emptyWeight || ''}
                onChange={e => setNewPlane({...newPlane, emptyWeight: parseFloat(e.target.value) || 0})}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Empty Arm (inches)</label>
              <input
                type="number"
                value={newPlane.emptyArm || ''}
                onChange={e => setNewPlane({...newPlane, emptyArm: parseFloat(e.target.value) || 0})}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Max Gross (lbs)</label>
              <input
                type="number"
                value={newPlane.maxGrossWeight || ''}
                onChange={e => setNewPlane({...newPlane, maxGrossWeight: parseFloat(e.target.value) || 0})}
                className={inputClass}
              />
            </div>
          </div>
          <button
            onClick={handleSavePlane}
            className="mt-6 w-full py-4 bg-red-700 text-white rounded font-black uppercase tracking-widest text-xs hover:bg-red-800 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            Save to Hangar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fleet.length === 0 && !isAdding && (
          <div className="col-span-full p-12 text-center border border-dashed border-zinc-800 rounded-lg opacity-40">
            <Plane size={48} className="mx-auto mb-4" />
            <p className="font-mono text-sm uppercase">Hangar is currently empty.</p>
          </div>
        )}

        {fleet.map(plane => (
          <div key={plane.id} className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-white tracking-tighter">{plane.tailNumber}</h3>
                <p className="text-[10px] font-mono text-red-500 uppercase">{plane.model}</p>
              </div>
              <button
                onClick={() => handleDeletePlane(plane.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-700 hover:text-red-500 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-2 bg-black rounded border border-zinc-900">
                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Empty WT</div>
                <div className="text-xs font-mono text-zinc-300">{plane.emptyWeight} lbs</div>
              </div>
              <div className="p-2 bg-black rounded border border-zinc-900">
                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Empty ARM</div>
                <div className="text-xs font-mono text-zinc-300">{plane.emptyArm} in</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hangar;
