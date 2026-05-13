import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Download, Edit2, FileText, Plane, Plus, Search, Trash2 } from 'lucide-react';

interface FlightLog {
  id: string;
  date: string;
  aircraftNNumber: string;
  flightTime: string;
  night: boolean;
  crossCountry: boolean;
  solo: boolean;
  dual: boolean;
  notes: string;
  timestamp: number;
}

interface FlightLogsProps {
  darkMode: boolean;
}

const FlightLogs: React.FC<FlightLogsProps> = ({ darkMode }) => {
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>(() => {
    const saved = localStorage.getItem('flightLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    aircraftNNumber: '',
    flightTime: '',
    night: false,
    crossCountry: false,
    solo: false,
    dual: false,
    notes: ''
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLog, setEditLog] = useState<FlightLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'time-desc' | 'time-asc'>('date-desc');

  useEffect(() => {
    localStorage.setItem('flightLogs', JSON.stringify(flightLogs));
  }, [flightLogs]);

  const addFlightLog = () => {
    if (!newLog.aircraftNNumber.trim() || !newLog.flightTime.trim()) {
      alert('Please fill in aircraft N-number and flight time');
      return;
    }

    const log: FlightLog = {
      id: Date.now().toString(),
      date: newLog.date,
      aircraftNNumber: newLog.aircraftNNumber.toUpperCase(),
      flightTime: newLog.flightTime,
      night: newLog.night,
      crossCountry: newLog.crossCountry,
      solo: newLog.solo,
      dual: newLog.dual,
      notes: newLog.notes,
      timestamp: Date.now()
    };

    setFlightLogs([log, ...flightLogs]);
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      aircraftNNumber: '',
      flightTime: '',
      night: false,
      crossCountry: false,
      solo: false,
      dual: false,
      notes: ''
    });
    setIsAdding(false);
  };

  const startEditingLog = (log: FlightLog) => {
    setEditingId(log.id);
    setEditLog({ ...log });
  };

  const updateFlightLog = () => {
    if (!editLog) return;
    if (!editLog.aircraftNNumber.trim() || !editLog.flightTime.trim()) {
      alert('Please fill in aircraft N-number and flight time');
      return;
    }

    setFlightLogs(
      flightLogs.map((log) =>
        log.id === editLog.id
          ? { ...editLog, aircraftNNumber: editLog.aircraftNNumber.toUpperCase() }
          : log
      )
    );
    setEditingId(null);
    setEditLog(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLog(null);
  };

  const deleteFlightLog = (id: string) => {
    if (window.confirm('Are you sure you want to delete this flight log?')) {
      setFlightLogs(flightLogs.filter((log) => log.id !== id));
    }
  };

  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const now = Date.now();

    return flightLogs
      .filter((log) => {
        const matchesSearch =
          !term ||
          log.aircraftNNumber.toLowerCase().includes(term) ||
          log.notes.toLowerCase().includes(term) ||
          log.date.includes(term);

        const matchesDate =
          dateFilter === 'all' ||
          (dateFilter === 'today' && log.date === new Date().toISOString().split('T')[0]) ||
          (dateFilter === 'week' && now - log.timestamp <= 7 * 24 * 60 * 60 * 1000) ||
          (dateFilter === 'month' && now - log.timestamp <= 30 * 24 * 60 * 60 * 1000);

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const dateDelta = new Date(a.date).getTime() - new Date(b.date).getTime();
        const timeDelta = (parseFloat(a.flightTime) || 0) - (parseFloat(b.flightTime) || 0);

        switch (sortBy) {
          case 'date-asc':
            return dateDelta;
          case 'date-desc':
            return -dateDelta;
          case 'time-asc':
            return timeDelta;
          case 'time-desc':
            return -timeDelta;
          default:
            return -dateDelta;
        }
      });
  }, [dateFilter, flightLogs, searchTerm, sortBy]);

  const totalFlightTime = flightLogs.reduce((total, log) => total + (parseFloat(log.flightTime) || 0), 0);
  const averageFlightTime = flightLogs.length > 0 ? totalFlightTime / flightLogs.length : 0;
  const uniqueAircraftCount = new Set(flightLogs.map((log) => log.aircraftNNumber)).size;
  const nightFlightCount = flightLogs.filter((log) => log.night).length;
  const crossCountryCount = flightLogs.filter((log) => log.crossCountry).length;
  const soloFlightCount = flightLogs.filter((log) => log.solo).length;
  const dualFlightCount = flightLogs.filter((log) => log.dual).length;

  const formatFlightTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Aircraft N-Number', 'Flight Time (hrs)', 'Night', 'Cross Country', 'Solo', 'Dual', 'Notes'];
    const rows = filteredLogs.map((log) => [
      log.date,
      log.aircraftNNumber,
      log.flightTime,
      log.night ? 'Yes' : 'No',
      log.crossCountry ? 'Yes' : 'No',
      log.solo ? 'Yes' : 'No',
      log.dual ? 'Yes' : 'No',
      `"${log.notes.replace(/"/g, '""')}"`
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flight-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={darkMode ? 'rounded-lg shadow-lg border border-zinc-800 bg-black' : 'rounded-lg shadow-lg border border-zinc-800 bg-black'}>
      <div className="bg-zinc-900 border-b border-zinc-800 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold">Flight Logs</h2>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Total Flight Time</div>
            <div className="text-xl font-bold text-red-500">
              {formatFlightTime(totalFlightTime)} hrs
            </div>
          </div>
        </div>
        <p className="text-sm opacity-75 mt-2">Log and track your flight hours with detailed records.</p>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-lg font-semibold">Flight Records</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                'bg-zinc-900 hover:bg-zinc-800 text-zinc-100'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                'bg-red-700 hover:bg-red-800 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Cancel' : 'Add Flight'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary dark:text-theme-secondary-dark" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search aircraft, notes, or date"
              className={`w-full pl-10 pr-3 py-3 border rounded-md ${
                'bg-black border-zinc-800 text-white'
              }`}
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className={`w-full px-3 py-3 border rounded-md ${
              'bg-black border-zinc-800 text-white'
            }`}
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className={`w-full px-3 py-3 border rounded-md ${
              'bg-black border-zinc-800 text-white'
            }`}
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="time-desc">Longest flights</option>
            <option value="time-asc">Shortest flights</option>
          </select>
        </div>

        {isAdding && (
          <div className="mb-6 p-4 rounded-lg bg-zinc-900">
            <h4 className="font-medium mb-4">Add New Flight Log</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Plane className="w-4 h-4 inline mr-2" />
                  Aircraft N-Number
                </label>
                <input
                  type="text"
                  placeholder="N12345"
                  value={newLog.aircraftNNumber}
                  onChange={(e) => setNewLog({ ...newLog, aircraftNNumber: e.target.value })}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Flight Time (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="1.5"
                  value={newLog.flightTime}
                  onChange={(e) => setNewLog({ ...newLog, flightTime: e.target.value })}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Flight Type</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { key: 'night', label: 'Night' },
                    { key: 'crossCountry', label: 'Cross Country' },
                    { key: 'solo', label: 'Solo' },
                    { key: 'dual', label: 'Dual' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center gap-2 rounded-md border border-zinc-800 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={newLog[option.key as keyof typeof newLog] as boolean}
                        onChange={(e) => setNewLog({ ...newLog, [option.key]: e.target.checked })}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Notes
                </label>
                <textarea
                  placeholder="Flight details, route, conditions..."
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-zinc-900 hover:bg-zinc-800 text-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={addFlightLog}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md text-sm font-medium transition-colors"
              >
                Save Flight Log
              </button>
            </div>
          </div>
        )}

        {editingId && editLog && (
          <div className="mb-6 p-4 rounded-lg border-2 border-yellow-500 bg-zinc-950/80">
            <h4 className="font-medium mb-4 text-yellow-700 dark:text-yellow-300">Edit Flight Log</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  value={editLog.date}
                  onChange={(e) => setEditLog({ ...editLog, date: e.target.value })}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Plane className="w-4 h-4 inline mr-2" />
                  Aircraft N-Number
                </label>
                <input
                  type="text"
                  placeholder="N12345"
                  value={editLog.aircraftNNumber}
                  onChange={(e) => setEditLog({ ...editLog, aircraftNNumber: e.target.value })}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Flight Time (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="1.5"
                  value={editLog.flightTime}
                  onChange={(e) => setEditLog({ ...editLog, flightTime: e.target.value })}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Flight Type</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { key: 'night', label: 'Night' },
                    { key: 'crossCountry', label: 'Cross Country' },
                    { key: 'solo', label: 'Solo' },
                    { key: 'dual', label: 'Dual' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center gap-2 rounded-md border border-zinc-800 p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(editLog[option.key as keyof FlightLog])}
                        onChange={(e) => setEditLog({ ...editLog, [option.key]: e.target.checked })}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Notes
                </label>
                <textarea
                  placeholder="Flight details, route, conditions..."
                  value={editLog.notes}
                  onChange={(e) => setEditLog({ ...editLog, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 border rounded-md bg-black border-zinc-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-zinc-900 hover:bg-zinc-800 text-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={updateFlightLog}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md text-sm font-medium transition-colors"
              >
                Update Flight Log
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Aircraft</th>
                <th className="px-4 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Notes</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center opacity-60">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">No flight logs found</p>
                    <p className="text-sm">Try adjusting your search or add a new flight log</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-t border-zinc-800 hover:bg-zinc-900/70 ${
                      editingId === log.id ? 'bg-yellow-50/40 dark:bg-yellow-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        {new Date(log.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-red-500" />
                        <span className="font-medium">{log.aircraftNNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="font-medium">{log.flightTime} hrs</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {log.night && <span className="rounded-full bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-100">Night</span>}
                        {log.crossCountry && <span className="rounded-full bg-red-700/20 px-2 py-1 text-xs font-medium text-red-300">XC</span>}
                        {log.solo && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">Solo</span>}
                        {log.dual && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">Dual</span>}
                        {!log.night && !log.crossCountry && !log.solo && !log.dual && <span className="text-zinc-500">None</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-md">
                      <p className="truncate" title={log.notes}>
                        {log.notes || 'No notes'}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => startEditingLog(log)}
                          className="text-red-500 hover:text-red-400 p-1 transition-colors"
                          title="Edit flight log"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFlightLog(log.id)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Delete flight log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {flightLogs.length > 0 && (
          <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
            <h4 className="font-medium mb-2 text-white">Flight Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="opacity-75 text-zinc-400">Total Flights</div>
                <div className="font-bold text-lg text-white">{flightLogs.length}</div>
              </div>
              <div>
                <div className="opacity-75 text-zinc-400">Total Hours</div>
                <div className="font-bold text-lg text-white">{formatFlightTime(totalFlightTime)}</div>
              </div>
              <div>
                <div className="opacity-75 text-zinc-400">Average Flight</div>
                <div className="font-bold text-lg text-white">{formatFlightTime(averageFlightTime)}</div>
              </div>
              <div>
                <div className="opacity-75 text-zinc-400">Aircraft Flown</div>
                <div className="font-bold text-lg text-white">{uniqueAircraftCount}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="opacity-75 text-zinc-400">Night Flights</div>
                <div className="font-bold text-lg text-white">{nightFlightCount}</div>
              </div>
              <div>
                <div className="opacity-75 text-zinc-400">Cross Country</div>
                <div className="font-bold text-lg text-white">{crossCountryCount}</div>
              </div>
              <div>
                <div className="opacity-75 text-zinc-400">Solo Flights</div>
                <div className="font-bold text-lg text-white">{soloFlightCount}</div>
              </div>
              <div>
                <div className="opacity-75 text-theme-secondary dark:text-theme-secondary-dark">Dual Flights</div>
                <div className="font-bold text-lg text-theme-primary dark:text-theme-primary-dark">{dualFlightCount}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightLogs;
