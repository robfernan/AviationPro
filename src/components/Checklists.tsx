import { useState, useEffect } from 'react';
import { CheckSquare2, Plus, Trash2, Save, Copy, RotateCcw, Check } from 'lucide-react';
import { db, Checklist, ChecklistItem } from '../services/PersistenceService';
import { useFlightStore } from '../core/flightStore';

interface ChecklistsProps {
  darkMode: boolean;
}

const Checklists: React.FC<ChecklistsProps> = () => {
  const { currentAircraft } = useFlightStore();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistType, setNewChecklistType] = useState<'preflight' | 'cruise' | 'descent' | 'landing' | 'custom'>('preflight');
  const [formError, setFormError] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);

  const loadChecklists = async () => {
    try {
      const loaded = await db.getAllChecklists();
      setChecklists(loaded);
      if (loaded.length > 0 && !selectedChecklistId) {
        setSelectedChecklistId(loaded[0].id || null);
        setEditingChecklist(loaded[0]);
      }
    } catch (error) {
      console.error('Failed to load checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklists();
  }, []);

  const createDefaultChecklists = async () => {
    const defaults: Omit<Checklist, 'id'>[] = [
      {
        name: 'VFR Pre-Flight Inspection',
        type: 'preflight',
        items: [
          { id: '1', text: 'AROW Documents — Airworthiness, Registration, POH, Weight & Balance on board', completed: false, notes: '' },
          { id: '2', text: 'Walk around airframe — inspect skin, antennas, static port, and pitot tube', completed: false, notes: '' },
          { id: '3', text: 'Fuel quantity visually verified & sumps drained clear of water/debris', completed: false, notes: '' },
          { id: '4', text: 'Engine oil level within POH normal operating range & cap secure', completed: false, notes: '' },
          { id: '5', text: 'Propeller & spinner inspected for nicks, cracks, and security', completed: false, notes: '' },
          { id: '6', text: 'Landing gear, tires, and brake lines inspected for wear or leaks', completed: false, notes: '' },
          { id: '7', text: 'Flight control surfaces free and correct in full deflection', completed: false, notes: '' },
          { id: '8', text: 'Passenger briefing (SAFETY) & cabin doors/seatbelts secure', completed: false, notes: '' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: 'Before Takeoff & Runup',
        type: 'preflight',
        items: [
          { id: '1', text: 'Flight controls — free and correct', completed: false, notes: '' },
          { id: '2', text: 'Flight deck displays & altimeter — set to local field barometric pressure', completed: false, notes: '' },
          { id: '3', text: 'Fuel selector — BOTH / fuller tank per POH', completed: false, notes: '' },
          { id: '4', text: 'Elevator & rudder trim — set for takeoff', completed: false, notes: '' },
          { id: '5', text: 'Magneto & prop governor check at POH runup RPM', completed: false, notes: '' },
          { id: '6', text: 'Departure briefing — runway heading, Vr, Vy, and emergency return plan', completed: false, notes: '' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: 'En-Route Cruise',
        type: 'cruise',
        items: [
          { id: '1', text: 'Cruise power & mixture — leaned per POH for altitude and OAT', completed: false, notes: '' },
          { id: '2', text: 'Engine temps & oil pressure — verified in green arc', completed: false, notes: '' },
          { id: '3', text: 'Fuel balance & remaining endurance cross-checked against navlog', completed: false, notes: '' },
          { id: '4', text: 'Heading indicator / magnetic compass alignment verified', completed: false, notes: '' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: 'Before Landing (GUMPS)',
        type: 'landing',
        items: [
          { id: '1', text: 'Gas — fuel selector on BOTH / fullest tank, fuel pump ON as required', completed: false, notes: '' },
          { id: '2', text: 'Undercarriage — fixed or verified down and locked', completed: false, notes: '' },
          { id: '3', text: 'Mixture — full rich (or set for high density altitude field)', completed: false, notes: '' },
          { id: '4', text: 'Propeller / Power — full forward, carb heat as required', completed: false, notes: '' },
          { id: '5', text: 'Seatbelts, harnesses, and landing light — secure and ON', completed: false, notes: '' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    for (const checklist of defaults) {
      await db.saveChecklist(checklist as Checklist);
    }

    await loadChecklists();
  };

  const handleCreateNewChecklist = async () => {
    if (!newChecklistName.trim()) {
      setFormError('Enter a checklist title before creating.');
      return;
    }
    setFormError(null);

    const newChecklist: Omit<Checklist, 'id'> = {
      name: newChecklistName.trim(),
      type: newChecklistType,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const id = await db.saveChecklist(newChecklist as Checklist);
    setNewChecklistName('');
    await loadChecklists();
    setSelectedChecklistId(id);
    const loaded = await db.checklists.get(id);
    if (loaded) setEditingChecklist(loaded);
  };

  const handleDuplicateChecklist = async () => {
    if (!editingChecklist) return;

    const newChecklist: Omit<Checklist, 'id'> = {
      name: `${editingChecklist.name} (Copy)`,
      type: editingChecklist.type,
      items: editingChecklist.items.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random()}`
      })),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const id = await db.saveChecklist(newChecklist as Checklist);
    await loadChecklists();
    setSelectedChecklistId(id);
    const loaded = await db.checklists.get(id);
    if (loaded) setEditingChecklist(loaded);
  };

  const handleSaveChecklist = async () => {
    if (!editingChecklist) return;
    await db.saveChecklist(editingChecklist);
    await loadChecklists();
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const handleResetChecklistItems = async () => {
    if (!editingChecklist) return;
    const reset: Checklist = {
      ...editingChecklist,
      items: editingChecklist.items.map(item => ({ ...item, completed: false })),
      updatedAt: Date.now()
    };
    setEditingChecklist(reset);
    await db.saveChecklist(reset);
    await loadChecklists();
  };

  const handleDeleteChecklist = async (id: number | undefined) => {
    if (!id) return;
    await db.deleteChecklist(id);
    const remaining = await db.getAllChecklists();
    setChecklists(remaining);
    if (remaining.length > 0) {
      setSelectedChecklistId(remaining[0].id || null);
      setEditingChecklist(remaining[0]);
    } else {
      setSelectedChecklistId(null);
      setEditingChecklist(null);
    }
  };

  const handleAddItem = () => {
    if (!editingChecklist) return;
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: '',
      completed: false,
      notes: ''
    };
    setEditingChecklist({
      ...editingChecklist,
      items: [...editingChecklist.items, newItem]
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!editingChecklist) return;
    setEditingChecklist({
      ...editingChecklist,
      items: editingChecklist.items.filter(item => item.id !== itemId)
    });
  };

  const handleUpdateItem = (itemId: string, field: string, value: string | boolean) => {
    if (!editingChecklist) return;
    setEditingChecklist({
      ...editingChecklist,
      items: editingChecklist.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  const inputClass = 'bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-3 py-2 w-full text-sm focus:border-sky-500 outline-none';

  if (loading) {
    return <div className="p-6 text-slate-400 font-mono text-xs">Loading hangar checklists...</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <CheckSquare2 size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Normal & Pre-Flight Checklists
            </h1>
            <p className="text-xs text-slate-400">
              Active Airframe: <span className="font-mono text-sky-400 font-semibold">{currentAircraft.name}</span> • Always verify against aircraft POH
            </p>
          </div>
        </div>
        {checklists.length > 0 && (
          <button
            onClick={createDefaultChecklists}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            + Restore Standard Templates
          </button>
        )}
      </div>

      {checklists.length === 0 ? (
        <div className="p-8 rounded-xl text-center bg-slate-950/60 border border-slate-800">
          <p className="text-slate-300 mb-4 text-sm">
            No checklists stored in your local hangar database yet.
          </p>
          <button
            onClick={createDefaultChecklists}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition bg-sky-600 text-white hover:bg-sky-500"
          >
            Load Standard VFR Templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Checklist List */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Hangar Checklists
            </h2>

            <div className="space-y-2">
              {checklists.map(checklist => {
                const doneCount = checklist.items.filter(i => i.completed).length;
                const isSelected = selectedChecklistId === checklist.id;
                return (
                  <button
                    key={checklist.id}
                    onClick={() => {
                      setSelectedChecklistId(checklist.id || null);
                      setEditingChecklist(checklist);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg transition-all border ${
                      isSelected
                        ? 'bg-sky-600/15 border-sky-500/50 text-sky-300'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="font-semibold text-xs">{checklist.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {doneCount}/{checklist.items.length} completed
                    </div>
                  </button>
                );
              })}
            </div>

            {/* New Checklist Form */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Create Custom Checklist
              </div>
              <input
                type="text"
                placeholder="Checklist title..."
                value={newChecklistName}
                onChange={(e) => {
                  setNewChecklistName(e.target.value);
                  if (formError) setFormError(null);
                }}
                className={inputClass}
              />
              {formError && (
                <p className="text-xs text-amber-400">{formError}</p>
              )}
              <select
                value={newChecklistType}
                onChange={(e) => setNewChecklistType(e.target.value as Checklist['type'])}
                className={inputClass}
              >
                <option value="preflight">Pre-flight</option>
                <option value="cruise">Cruise</option>
                <option value="descent">Descent</option>
                <option value="landing">Landing</option>
                <option value="custom">Custom</option>
              </select>
              <button
                onClick={handleCreateNewChecklist}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition bg-sky-600 text-white hover:bg-sky-500"
              >
                <Plus size={14} />
                Create Checklist
              </button>
            </div>
          </div>

          {/* Checklist Editor */}
          {editingChecklist && (
            <div className="lg:col-span-3 p-5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">
                      {editingChecklist.name}
                    </h2>
                    <p className="text-xs font-mono text-sky-400 uppercase tracking-wider mt-0.5">
                      Phase: {editingChecklist.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetChecklistItems}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
                      title="Uncheck all items"
                    >
                      <RotateCcw size={14} />
                      Reset Checks
                    </button>
                    <button
                      onClick={handleDuplicateChecklist}
                      className="p-2 rounded-lg transition bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      title="Duplicate Checklist"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteChecklist(editingChecklist.id)}
                      className="p-2 rounded-lg transition bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white"
                      title="Delete Checklist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Checklist Items */}
                <div className="space-y-2.5 mb-5">
                  {editingChecklist.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        item.completed
                          ? 'bg-emerald-950/15 border-emerald-500/30'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => handleUpdateItem(item.id, 'completed', e.target.checked)}
                          className="mt-1 w-4 h-4 accent-sky-500 cursor-pointer rounded"
                        />
                        <span className="text-xs font-mono text-slate-500 mt-0.5 w-5">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => handleUpdateItem(item.id, 'text', e.target.value)}
                            placeholder="Challenge — Response item..."
                            className={`bg-transparent border-none focus:ring-0 p-0 w-full font-medium text-sm outline-none ${
                              item.completed ? 'line-through text-slate-400' : 'text-slate-100'
                            }`}
                          />
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                            placeholder="Optional POH target value or note..."
                            className="bg-transparent text-slate-400 border-none focus:ring-0 p-0 w-full text-xs outline-none"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddItem}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition bg-slate-900 border border-dashed border-slate-700 text-slate-300 hover:border-sky-500/50 hover:text-sky-300"
                  >
                    <Plus size={15} />
                    Add Checklist Item
                  </button>
                  <button
                    onClick={handleSaveChecklist}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition bg-sky-600 text-white hover:bg-sky-500"
                  >
                    {savedBanner ? <Check size={16} /> : <Save size={16} />}
                    {savedBanner ? 'Checklist Saved' : 'Save Checklist'}
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-end mb-1.5">
                  <div className="text-xs font-semibold text-slate-400">
                    Completion Status
                  </div>
                  <div className="text-xs font-mono font-semibold text-sky-400">
                    {editingChecklist.items.length > 0
                      ? Math.round((editingChecklist.items.filter(i => i.completed).length / editingChecklist.items.length) * 100)
                      : 0}%
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-300 ease-out"
                    style={{
                      width: editingChecklist.items.length > 0
                        ? `${(editingChecklist.items.filter(i => i.completed).length / editingChecklist.items.length) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Checklists;
