import { useState, useEffect } from 'react';
import { CheckSquare2, Plus, Trash2, Save, Copy } from 'lucide-react';
import { saveChecklist, getAllChecklists, deleteChecklist, Checklist, ChecklistItem } from '../utils/indexedDB';

interface ChecklistsProps {
  darkMode: boolean;
}

const Checklists: React.FC<ChecklistsProps> = ({ darkMode }) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistType, setNewChecklistType] = useState<'preflight' | 'cruise' | 'descent' | 'landing' | 'custom'>('preflight');

  const loadChecklists = async () => {
    try {
      const loaded = await getAllChecklists();
      setChecklists(loaded);
      if (loaded.length > 0 && !selectedChecklistId) {
        setSelectedChecklistId(loaded[0].id);
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
    const defaults: Checklist[] = [
      {
        id: `preflight-${Date.now()}`,
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
        id: `cruise-${Date.now()}`,
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
        id: `landing-${Date.now()}`,
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
      await saveChecklist(checklist);
    }

    await loadChecklists();
  };

  const handleCreateNewChecklist = async () => {
    if (!newChecklistName.trim()) {
      alert('Please enter a checklist name');
      return;
    }

    const newChecklist: Checklist = {
      id: `checklist-${Date.now()}`,
      name: newChecklistName,
      type: newChecklistType,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveChecklist(newChecklist);
    setNewChecklistName('');
    await loadChecklists();
    setSelectedChecklistId(newChecklist.id);
    setEditingChecklist(newChecklist);
  };

  const handleDuplicateChecklist = async () => {
    if (!editingChecklist) return;

    const newChecklist: Checklist = {
      id: `checklist-${Date.now()}`,
      name: `${editingChecklist.name} (Copy)`,
      type: editingChecklist.type,
      items: editingChecklist.items.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random()}`
      })),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveChecklist(newChecklist);
    await loadChecklists();
    setSelectedChecklistId(newChecklist.id);
    setEditingChecklist(newChecklist);
  };

  const handleSaveChecklist = async () => {
    if (!editingChecklist) return;
    await saveChecklist(editingChecklist);
    await loadChecklists();
  };

  const handleDeleteChecklist = async (id: string) => {
    if (confirm('Delete this checklist?')) {
      await deleteChecklist(id);
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

  const inputClass = 'bg-white text-black border border-gray-300 rounded px-3 py-2 w-full';

  if (loading) {
    return <div className={`p-6 ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>Loading checklists...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CheckSquare2 className={darkMode ? 'text-slate-200' : 'text-gray-800'} size={32} />
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
          Checklists
        </h1>
      </div>

      {checklists.length === 0 ? (
        <div className={`p-6 rounded text-center ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <p className={darkMode ? 'text-slate-300 mb-4' : 'text-gray-700 mb-4'}>
            No checklists yet. Create some default checklists to get started.
          </p>
          <button
            onClick={createDefaultChecklists}
            className={`px-6 py-3 rounded font-semibold transition ${
              darkMode
                ? 'bg-theme-accent-dark text-white hover:bg-theme-accent-dark/80'
                : 'bg-theme-accent text-white hover:bg-theme-accent/80'
            }`}
          >
            Create Default Checklists
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Checklist List */}
          <div className={`p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
              My Checklists
            </h2>

            <div className="space-y-2 mb-4">
              {checklists.map(checklist => (
                <button
                  key={checklist.id}
                  onClick={() => {
                    setSelectedChecklistId(checklist.id);
                    setEditingChecklist(checklist);
                  }}
                  className={`w-full text-left px-4 py-3 rounded transition ${
                    selectedChecklistId === checklist.id
                      ? darkMode
                        ? 'bg-theme-accent-dark text-white'
                        : 'bg-theme-accent text-white'
                      : darkMode
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{checklist.name}</div>
                  <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {checklist.items.filter(i => i.completed).length}/{checklist.items.length} done
                  </div>
                </button>
              ))}
            </div>

            {/* New Checklist Form */}
            <div className={`p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-300 bg-gray-50'}`}>
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
          </div>

          {/* Checklist Editor */}
          {editingChecklist && (
            <div className={`lg:col-span-3 p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    {editingChecklist.name}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {editingChecklist.type.charAt(0).toUpperCase() + editingChecklist.type.slice(1)} Checklist
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDuplicateChecklist}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition ${
                      darkMode
                        ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteChecklist(editingChecklist.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition ${
                      darkMode
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3 mb-6">
                {editingChecklist.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => handleUpdateItem(item.id, 'completed', e.target.checked)}
                        className="mt-1 w-5 h-5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => handleUpdateItem(item.id, 'text', e.target.value)}
                          placeholder="Checklist item"
                          className={`${inputClass} mb-2 ${item.completed ? 'line-through' : ''}`}
                        />
                        <textarea
                          value={item.notes}
                          onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                          placeholder="Notes (optional)"
                          className={`${inputClass} text-sm resize-none`}
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className={`p-2 rounded transition ${
                          darkMode
                            ? 'text-red-400 hover:bg-red-600 hover:text-white'
                            : 'text-red-500 hover:bg-red-100'
                        }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Item Button */}
              <button
                onClick={handleAddItem}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded font-medium transition mb-6 ${
                  darkMode
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Plus size={20} />
                Add Item
              </button>

              {/* Save Button */}
              <button
                onClick={handleSaveChecklist}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded font-semibold transition ${
                  darkMode
                    ? 'bg-theme-accent-dark text-white hover:bg-theme-accent-dark/80'
                    : 'bg-theme-accent text-white hover:bg-theme-accent/80'
                }`}
              >
                <Save size={20} />
                Save Checklist
              </button>

              {/* Progress */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className={`mb-2 text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Progress: {editingChecklist.items.filter(i => i.completed).length}/{editingChecklist.items.length}
                </div>
                <div className={`w-full h-2 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded transition-all ${darkMode ? 'bg-theme-accent-dark' : 'bg-theme-accent'}`}
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
