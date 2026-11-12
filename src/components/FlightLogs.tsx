import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Download, Edit2, FileText, Plane, Plus, Search, Trash2 } from 'lucide-react';
import { db } from '../services/PersistenceService';
import { FlightLog } from '../types/aviation';
import { useFlightStore } from '../core/flightStore';

interface FlightLogsProps {
  darkMode: boolean;
}

const FlightLogs: React.FC<FlightLogsProps> = () => {
  const { currentAircraft } = useFlightStore();
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultTailNumber = currentAircraft.id === 'c172' ? 'N172SP' : currentAircraft.id === 'pa28' ? 'N281PA' : currentAircraft.id === 'da40' ? 'N400DA' : currentAircraft.id.toUpperCase();

  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    aircraftNNumber: defaultTailNumber,
    flightTime: '',
    night: false,
    crossCountry: false,
    solo: false,
    dual: false,
    notes: ''
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLog, setEditLog] = useState<FlightLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'time-desc' | 'time-asc'>('date-desc');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync default N-number when active aircraft changes
  useEffect(() => {
    setNewLog((prev) => ({
      ...prev,
      aircraftNNumber: defaultTailNumber
    }));
  }, [defaultTailNumber]);

  // Load and Migrate Data
  useEffect(() => {
    const initData = async () => {
      try {
        const legacyData = localStorage.getItem('flightLogs');
        if (legacyData) {
          const logs = JSON.parse(legacyData);
          if (Array.isArray(logs) && logs.length > 0) {
            for (const log of logs) {
              const { id, ...cleanLog } = log;
              await db.flights.add({
                ...cleanLog,
                timestamp: cleanLog.timestamp || Date.now()
              });
            }
          }
          localStorage.removeItem('flightLogs');
        }

        const items = await db.flights.toArray();
        setFlightLogs(items);
      } catch (error) {
        console.error('Logbook Migration Error:', error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const refreshLogs = async () => {
    const items = await db.flights.toArray();
    setFlightLogs(items);
  };

  const addFlightLog = async () => {
    const parsedTime = parseFloat(newLog.flightTime);
    if (!newLog.aircraftNNumber.trim() || !Number.isFinite(parsedTime) || parsedTime <= 0) {
      setValidationError('Enter a valid aircraft tail number and positive flight duration (hours).');
      return;
    }
    setValidationError(null);

    try {
      const log: FlightLog = {
        date: newLog.date,
        aircraftNNumber: newLog.aircraftNNumber.trim().toUpperCase(),
        flightTime: parsedTime.toFixed(1),
        night: newLog.night,
        crossCountry: newLog.crossCountry,
        solo: newLog.solo,
        dual: newLog.dual,
        notes: newLog.notes,
        timestamp: Date.now()
      };

      await db.flights.add(log);
      await refreshLogs();

      setNewLog({
        date: new Date().toISOString().split('T')[0],
        aircraftNNumber: defaultTailNumber,
        flightTime: '',
        night: false,
        crossCountry: false,
        solo: false,
        dual: false,
        notes: ''
      });
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add flight log:', err);
    }
  };

  const startEditingLog = (log: FlightLog) => {
    if (log.id) {
      setEditingId(log.id);
      setEditLog({ ...log });
      setValidationError(null);
    }
  };

  const updateFlightLog = async () => {
    if (!editLog || !editingId) return;
    const parsedTime = parseFloat(editLog.flightTime);
    if (!editLog.aircraftNNumber.trim() || !Number.isFinite(parsedTime) || parsedTime <= 0) {
      setValidationError('Enter a valid aircraft tail number and positive flight duration (hours).');
      return;
    }
    setValidationError(null);

    try {
      await db.flights.update(editingId, {
        ...editLog,
        aircraftNNumber: editLog.aircraftNNumber.trim().toUpperCase(),
        flightTime: parsedTime.toFixed(1)
      });
      await refreshLogs();
      setEditingId(null);
      setEditLog(null);
    } catch (err) {
      console.error('Failed to update log:', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLog(null);
    setValidationError(null);
  };

  const deleteFlightLog = async (id: number | undefined) => {
    if (!id) return;
    await db.flights.delete(id);
    await refreshLogs();
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

  const inputClass = 'w-full px-3 py-2.5 border rounded-lg bg-slate-950 border-slate-800 text-slate-100 text-sm focus:border-sky-500 outline-none';

  if (loading) return <div className="p-6 text-slate-400 font-mono text-xs">Loading pilot logbook...</div>;

  return (
    <div className="rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
      <div className="bg-slate-900/90 border-b border-slate-800 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Pilot Flight Logbook</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Offline IndexedDB flight records with CSV export for PilotBase & ForeFlight import
              </p>
            </div>
          </div>
          <div className="text-right bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Logged Time</div>
            <div className="text-xl font-bold font-mono text-sky-400">
              {totalFlightTime.toFixed(1)} hrs <span className="text-xs text-slate-500">({formatFlightTime(totalFlightTime)})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Flight Records ({filteredLogs.length})</h3>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                setIsAdding(!isAdding);
                setValidationError(null);
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Cancel' : 'Log Flight'}</span>
            </button>
          </div>
        </div>

        {validationError && (
          <div className="mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs">
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mb-6 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tail number, notes, or date..."
              className="w-full pl-9 pr-3 py-2.5 border rounded-lg bg-slate-950 border-slate-800 text-slate-100 text-sm focus:border-sky-500 outline-none"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className={inputClass}
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className={inputClass}
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="time-desc">Longest flights</option>
            <option value="time-asc">Shortest flights</option>
          </select>
        </div>

        {isAdding && (
          <div className="mb-6 p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <h4 className="font-semibold uppercase tracking-wider text-xs text-sky-400">New Flight Log Entry</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
                  Date
                </label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  <Plane className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
                  Aircraft Tail Number
                </label>
                <input
                  type="text"
                  placeholder="N172SP"
                  value={newLog.aircraftNNumber}
                  onChange={(e) => setNewLog({ ...newLog, aircraftNNumber: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
                  Total Time (Hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="1.5"
                  value={newLog.flightTime}
                  onChange={(e) => setNewLog({ ...newLog, flightTime: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 mb-2">Flight Conditions & Category</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { key: 'night', label: 'Night' },
                    { key: 'crossCountry', label: 'Cross Country' },
                    { key: 'solo', label: 'Solo PIC' },
                    { key: 'dual', label: 'Dual Received' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs font-medium text-slate-200 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        className="accent-sky-500 w-4 h-4 rounded"
                        checked={newLog[option.key as keyof typeof newLog] as boolean}
                        onChange={(e) => setNewLog({ ...newLog, [option.key]: e.target.checked })}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  <FileText className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
                  Route & Remarks
                </label>
                <textarea
                  placeholder="KPBI - KSUA, maneuvers, landings, weather notes..."
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={addFlightLog}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Save Flight Log
              </button>
            </div>
          </div>
        )}

        {editingId && editLog && (
          <div className="mb-6 p-5 rounded-xl border border-sky-500/40 bg-slate-950/90 space-y-4">
            <h4 className="font-semibold uppercase tracking-wider text-xs text-sky-400">Edit Flight Log Entry</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
                <input
                  type="date"
                  value={editLog.date}
                  onChange={(e) => setEditLog({ ...editLog, date: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Aircraft Tail Number</label>
                <input
                  type="text"
                  value={editLog.aircraftNNumber}
                  onChange={(e) => setEditLog({ ...editLog, aircraftNNumber: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Total Time (Hours)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editLog.flightTime}
                  onChange={(e) => setEditLog({ ...editLog, flightTime: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 mb-2">Flight Conditions & Category</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { key: 'night', label: 'Night' },
                    { key: 'crossCountry', label: 'Cross Country' },
                    { key: 'solo', label: 'Solo PIC' },
                    { key: 'dual', label: 'Dual Received' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs font-medium text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-sky-500 w-4 h-4 rounded"
                        checked={Boolean(editLog[option.key as keyof FlightLog])}
                        onChange={(e) => setEditLog({ ...editLog, [option.key]: e.target.checked })}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Route & Remarks</label>
                <textarea
                  value={editLog.notes}
                  onChange={(e) => setEditLog({ ...editLog, notes: e.target.value })}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={updateFlightLog}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Update Entry
              </button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
                <FileText className="w-7 h-7 text-slate-500" />
              </div>
              <h4 className="text-base font-bold text-slate-200 mb-1">No Flight Logs Recorded</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click <span className="text-sky-400 font-semibold">+ Log Flight</span> above to record your flight time, aircraft tail number, and remarks.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5 text-left">Date</th>
                    <th className="px-4 py-3.5 text-left">Tail #</th>
                    <th className="px-4 py-3.5 text-left">Duration</th>
                    <th className="px-4 py-3.5 text-left">Category</th>
                    <th className="px-4 py-3.5 text-left">Remarks</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`border-t border-slate-800/80 hover:bg-slate-900/50 transition-colors ${
                        editingId === log.id ? 'bg-sky-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-300 font-mono text-xs">
                        {log.date}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-100">{log.aircraftNNumber}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-semibold text-sky-400">{log.flightTime} hr</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {log.night && <span className="text-[10px] font-semibold uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">Night</span>}
                          {log.crossCountry && <span className="text-[10px] font-semibold uppercase bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded text-sky-300">XC</span>}
                          {log.solo && <span className="text-[10px] font-semibold uppercase bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-300">Solo</span>}
                          {log.dual && <span className="text-[10px] font-semibold uppercase bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded text-amber-300">Dual</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="truncate text-slate-400 text-xs">{log.notes || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEditingLog(log)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
                            title="Edit entry"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteFlightLog(log.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Delete entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {flightLogs.length > 0 && (
          <div className="mt-6 p-5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-slate-400">Logbook Totals & Experience Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Flights</div>
                <div className="font-bold font-mono text-xl text-slate-100">{flightLogs.length}</div>
              </div>
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Hours</div>
                <div className="font-bold font-mono text-xl text-sky-400">{totalFlightTime.toFixed(1)}</div>
              </div>
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Avg Flight Duration</div>
                <div className="font-bold font-mono text-xl text-slate-100">{averageFlightTime.toFixed(1)} hr</div>
              </div>
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Unique Airframes</div>
                <div className="font-bold font-mono text-xl text-slate-100">{uniqueAircraftCount}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Night Flights', val: nightFlightCount, color: 'text-slate-200' },
                { label: 'Cross Country', val: crossCountryCount, color: 'text-sky-400' },
                { label: 'Solo PIC', val: soloFlightCount, color: 'text-emerald-400' },
                { label: 'Dual Received', val: dualFlightCount, color: 'text-amber-400' }
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
                  <span className="text-xs text-slate-400">{stat.label}</span>
                  <span className={`font-mono font-bold text-sm ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightLogs;
