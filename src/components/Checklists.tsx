import { useState, useEffect } from 'react';
import { CheckSquare2, Plus, Trash2, Save, Copy } from 'lucide-react';
import { db, Checklist, ChecklistItem } from '../services/PersistenceService';

interface ChecklistsProps {
  darkMode: boolean;
}

const Checklists: React.FC<ChecklistsProps> = ({ darkMode }) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistType, setNewChecklistType] = useState<'preflight' | 'cruise' | 'descent' | 'landing' | 'custom'>('preflight');

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
        name: 'VFR Pre-flight',
        type: 'preflight',
        items: [
          { id: '1', text: 'Walk around aircraft - check for visible damage', completed: false, notes: '' },
          { id: '2', text: 'Check fuel quantity and quality', completed: false, notes: '' },
          { id: '3', text: 'Check oil level and condition', completed: false, notes: '' },
          { id: '4', text: 'Inspect propeller for cracks', completed: false, notes: '' },
          { id: '5', text: 'Check tires for wear and pressure', completed: false, notes: '' },
          { id: '6', text: 'Check brakes', completed: false, notes: '' },
          { id: '7', text: 'Check doors and windows secure', completed: false, notes: '' },
          { id: '8', text: 'Check control surfaces free and correct', completed: false, notes: '' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: 'Cruise',
        type: 'cruise',
        items: [
          { id: '1', text: 'Monitor altitude and heading', completed: false, notes: '' },
          { id: '2', text: 'Monitor engine instruments', completed: false, notes: '' },
          { id: '3', text: 'Check fuel quantity', completed: false, notes: '' },
          { id: '4', text: 'Update navigation log', completed: false, notes: '' },
          { id: '5', text: 'Monitor VOR/GPS position', completed: false, notes: '' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        name: 'Landing',
        type: 'landing',
        items: [
          { id: '1', text: 'Reduce power gradually', completed: false, notes: '' },
          { id: '2', text: 'Descend at safe rate', completed: false, notes: '' },
          { id: '3', text: 'Configure aircraft (gear, flaps)', completed: false, notes: '' },
          { id: '4', text: 'Align with runway', completed: false, notes: '' },
          { id: '5', text: 'Monitor airspeed and descent rate', completed: false, notes: '' },
          { id: '6', text: 'Touch down in landing zone', completed: false, notes: '' },
          { id: '7', text: 'Apply brakes smoothly', completed: false, notes: '' }
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
      alert('Please enter a checklist name');
      return;
    }

    const newChecklist: Omit<Checklist, 'id'> = {
      name: newChecklistName,
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
  };

  const handleDeleteChecklist = async (id: number | undefined) => {
    if (!id) return;
    if (confirm('Delete this checklist?')) {
      await db.deleteChecklist(id);
      await loadChecklists();
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

  const handleUpdateItem = (itemId: string, field: string, value: any) => {
    if (!editingChecklist) return;
    setEditingChecklist({
      ...editingChecklist,
      items: editingChecklist.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  const inputClass = 'bg-black text-white border border-zinc-800 rounded px-3 py-2 w-full text-sm';

  if (loading) {
    return <div className="p-6 text-zinc-500 font-mono">INITIALIZING CHECKLISTS...</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 rounded-lg border border-zinc-800 bg-black shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <CheckSquare2 className="text-red-500" size={32} />
        <h1 className="text-xl sm:text-3xl font-bold text-white uppercase tracking-widest">
          Checklists
        </h1>
      </div>

      {checklists.length === 0 ? (
        <div className="p-6 rounded text-center bg-zinc-900 border border-zinc-800">
          <p className="text-zinc-300 mb-4 text-sm font-mono uppercase">
            No checklist data found in local storage.
          </p>
          <button
            onClick={createDefaultChecklists}
            className="px-6 py-3 rounded text-xs font-black uppercase tracking-widest transition bg-red-700 text-white hover:bg-red-800"
          >
            Load Standard Templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Checklist List */}
          <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 text-zinc-500 border-b border-zinc-800 pb-2">
              My Hangar Checklists
            </h2>

            <div className="space-y-2 mb-4">
              {checklists.map(checklist => (
                <button
                  key={checklist.id}
                  onClick={() => {
                    setSelectedChecklistId(checklist.id || null);
                    setEditingChecklist(checklist);
                  }}
                  className={`w-full text-left px-4 py-3 rounded transition-all border ${
                    selectedChecklistId === checklist.id
                      ? 'bg-red-700 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                      : 'bg-black border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="font-bold text-xs uppercase tracking-tight">{checklist.name}</div>
                  <div className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                    {checklist.items.filter(i => i.completed).length}/{checklist.items.length} COMPLETE
                  </div>
                </button>
              ))}
            </div>

            {/* New Checklist Form */}
            <div className="p-3 rounded border border-zinc-800 bg-black">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="New checklist name"
                  value={newChecklistName}
                  onChange={(e) => setNewChecklistName(e.target.value)}
                  className={inputClass}
                />
                <select
                  value={newChecklistType}
                  onChange={(e) => setNewChecklistType(e.target.value as any)}
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition bg-red-700 text-white hover:bg-red-800"
                >
                  <Plus size={14} />
                  New Record
                </button>
              </div>
            </div>
          </div>

          {/* Checklist Editor */}
          {editingChecklist && (
            <div className="lg:col-span-3 p-4 rounded border border-zinc-800 bg-zinc-900 shadow-inner">
              <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    {editingChecklist.name}
                  </h2>
                  <p className="text-[9px] font-mono text-red-500 uppercase tracking-widest mt-1">
                    Mode: {editingChecklist.type}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDuplicateChecklist}
                    className="p-2 rounded transition bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Duplicate"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteChecklist(editingChecklist.id)}
                    className="p-2 rounded transition bg-red-900/30 text-red-500 hover:bg-red-700 hover:text-white"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3 mb-6">
                {editingChecklist.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded border transition-all ${item.completed ? 'bg-zinc-950 border-zinc-800 opacity-60' : 'bg-black border-zinc-700'}`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => handleUpdateItem(item.id, 'completed', e.target.checked)}
                        className="mt-1.5 w-5 h-5 accent-red-600 cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => handleUpdateItem(item.id, 'text', e.target.value)}
                          placeholder="Action item..."
                          className={`bg-transparent text-white border-none focus:ring-0 p-0 w-full font-bold text-sm tracking-tight ${item.completed ? 'line-through text-zinc-600' : ''}`}
                        />
                        <textarea
                          value={item.notes}
                          onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                          placeholder="System notes..."
                          className="bg-transparent text-zinc-500 border-none focus:ring-0 p-0 w-full text-[10px] mt-1 italic resize-none h-6"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-zinc-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Item Button */}
              <button
                onClick={handleAddItem}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.2em] transition mb-6 bg-black border border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
              >
                <Plus size={16} />
                Add Checklist Item
              </button>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSaveChecklist}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded text-xs font-black uppercase tracking-[0.2em] transition bg-red-700 text-white hover:bg-red-800 shadow-[0_0_15px_rgba(220,38,38,0.2)] active:scale-95"
                >
                  <Save size={18} />
                  Commit Changes
                </button>
              </div>

              {/* Progress */}
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Task Progress
                  </div>
                  <div className="text-[10px] font-mono text-red-500">
                    {editingChecklist.items.length > 0
                      ? Math.round((editingChecklist.items.filter(i => i.completed).length / editingChecklist.items.length) * 100)
                      : 0}%
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]"
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
