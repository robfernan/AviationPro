import { useState, useEffect } from 'react';
import { Calendar, Plane, Clock, FileText, Plus, Trash2 } from 'lucide-react';

interface FlightLog {
  id: string;
  date: string;
  aircraftNNumber: string;
  flightTime: string;
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
    notes: ''
  });

  const [isAdding, setIsAdding] = useState(false);

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
      notes: newLog.notes,
      timestamp: Date.now()
    };

    setFlightLogs([log, ...flightLogs]);
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      aircraftNNumber: '',
      flightTime: '',
      notes: ''
    });
    setIsAdding(false);
  };

  const deleteFlightLog = (id: string) => {
    if (window.confirm('Are you sure you want to delete this flight log?')) {
      setFlightLogs(flightLogs.filter(log => log.id !== id));
    }
  };

  const totalFlightTime = flightLogs.reduce((total, log) => {
    const time = parseFloat(log.flightTime) || 0;
    return total + time;
  }, 0);

  const formatFlightTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-b ${
        darkMode ? 'border-gray-600' : 'border-gray-200'
      } p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className="text-2xl font-bold">Flight Logs</h2>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Total Flight Time</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatFlightTime(totalFlightTime)} hrs
            </div>
          </div>
        </div>
        <p className="text-sm opacity-75 mt-2">
          Log and track your flight hours with detailed records.
        </p>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Flight Records</h3>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Cancel' : 'Add Flight'}</span>
          </button>
        </div>

        {isAdding && (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
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
                  onChange={(e) => setNewLog({...newLog, date: e.target.value})}
                  className={`w-full p-3 border rounded-md ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
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
                  onChange={(e) => setNewLog({...newLog, aircraftNNumber: e.target.value})}
                  className={`w-full p-3 border rounded-md ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
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
                  onChange={(e) => setNewLog({...newLog, flightTime: e.target.value})}
                  className={`w-full p-3 border rounded-md ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Notes
                </label>
                <textarea
                  placeholder="Flight details, route, conditions..."
                  value={newLog.notes}
                  onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
                  rows={3}
                  className={`w-full p-3 border rounded-md ${
                    darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsAdding(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={addFlightLog}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Save Flight Log
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {flightLogs.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">No flight logs yet</p>
              <p className="text-sm">Add your first flight log to get started</p>
            </div>
          ) : (
            flightLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium">{new Date(log.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Plane className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium">{log.aircraftNNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium">{log.flightTime} hrs</span>
                      </div>
                    </div>
                    {log.notes && (
                      <div className="text-sm opacity-75 mt-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        {log.notes}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteFlightLog(log.id)}
                    className="text-red-500 hover:text-red-700 p-1 ml-4"
                    title="Delete flight log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {flightLogs.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Flight Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="opacity-75 text-gray-700 dark:text-gray-200">Total Flights</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">{flightLogs.length}</div>
              </div>
              <div>
                <div className="opacity-75 text-gray-700 dark:text-gray-200">Total Hours</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">{formatFlightTime(totalFlightTime)}</div>
              </div>
              <div>
                <div className="opacity-75 text-gray-700 dark:text-gray-200">Average Flight</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">{formatFlightTime(totalFlightTime / flightLogs.length)}</div>
              </div>
              <div>
                <div className="opacity-75 text-gray-700 dark:text-gray-200">Aircraft Flown</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">{new Set(flightLogs.map(log => log.aircraftNNumber)).size}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightLogs;
