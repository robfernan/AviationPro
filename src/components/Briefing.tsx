import { useState } from 'react';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { generateBriefingPDF } from '../utils/briefingBuilder';
import { fetchAirportWeather } from '../utils/weatherService';

interface BriefingComponentProps {
  darkMode: boolean;
}

const Briefing: React.FC<BriefingComponentProps> = ({ darkMode }) => {
  const [briefingData, setBriefingData] = useState({
    date: new Date().toISOString().split('T')[0],
    departureAirport: '',
    arrivalAirport: '',
    aircraftType: '',
    nNumber: '',
    pilot: '',
    metar: '',
    taf: '',
    notams: '',
    fuelPlan: {
      totalDistance: '',
      totalTime: '',
      fuelBurned: '',
      reserve: ''
    },
    weightBalance: {
      rampWeight: '',
      takeoffWeight: '',
      cg: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const fetchWeatherData = async (icao: string) => {
    if (!icao.trim()) {
      setWeatherError('Please enter an ICAO code');
      return;
    }

    setLoading(true);
    setWeatherError(null);

    try {
      const weather = await fetchAirportWeather(icao.toUpperCase());

      if (weather.error) {
        setWeatherError(weather.error);
        return;
      }

      // Update briefing data with fetched weather
      setBriefingData(prev => ({
        ...prev,
        metar: weather.metar ? weather.metar.metar : prev.metar,
        taf: weather.taf ? weather.taf.taf : prev.taf,
      }));

      setWeatherError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch weather data';
      setWeatherError(message);
      console.error('Weather fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    // Trim and check if airports are provided with some validation
    const fromAirport = briefingData.departureAirport.trim().toUpperCase();
    const toAirport = briefingData.arrivalAirport.trim().toUpperCase();
    
    // Make validation less strict - allow generation even without airports,
    // but warn the user if they're not filled
    if (!fromAirport || !toAirport) {
      const confirmed = window.confirm(
        'Departure and/or arrival airports not specified.\n\nContinue anyway? (PDF will show placeholder airports)'
      );
      if (!confirmed) {
        return;
      }
    }

    const doc = generateBriefingPDF({
      date: briefingData.date,
      departureAirport: fromAirport || 'TBD',
      arrivalAirport: toAirport || 'TBD',
      aircraftType: briefingData.aircraftType,
      nNumber: briefingData.nNumber,
      pilot: briefingData.pilot,
      metar: briefingData.metar,
      taf: briefingData.taf,
      notams: briefingData.notams ? briefingData.notams.split('\n').filter(n => n.trim()) : [],
      fuelPlan: {
        totalDistance: briefingData.fuelPlan.totalDistance,
        totalTime: briefingData.fuelPlan.totalTime,
        fuelBurned: briefingData.fuelPlan.fuelBurned,
        reserve: briefingData.fuelPlan.reserve
      },
      weightBalance: {
        rampWeight: briefingData.weightBalance.rampWeight,
        takeoffWeight: briefingData.weightBalance.takeoffWeight,
        cg: briefingData.weightBalance.cg
      }
    });

    doc.save(`Briefing_${fromAirport || 'UNKNOWN'}_${toAirport || 'UNKNOWN'}_${briefingData.date}.pdf`);
  };

  const inputClass = darkMode
    ? 'bg-white text-black border border-gray-300 rounded px-3 py-2 w-full'
    : 'bg-white text-black border border-gray-300 rounded px-3 py-2 w-full';

  const textareaClass = darkMode
    ? 'bg-white text-black border border-gray-300 rounded px-3 py-2 w-full resize-none'
    : 'bg-white text-black border border-gray-300 rounded px-3 py-2 w-full resize-none';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className={darkMode ? 'text-slate-200' : 'text-gray-800'} size={32} />
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
          Flight Briefing Builder
        </h1>
      </div>

      <div className={`p-4 rounded ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
        <p className={darkMode ? 'text-slate-300' : 'text-gray-700'}>
          Generate a complete preflight briefing PDF with flight plan, weather, fuel planning, and weight & balance information.
        </p>
      </div>

      {/* Flight Info */}
      <div className={`p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>Flight Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Date
            </label>
            <input
              type="date"
              value={briefingData.date}
              onChange={(e) => setBriefingData({ ...briefingData, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Pilot Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={briefingData.pilot}
              onChange={(e) => setBriefingData({ ...briefingData, pilot: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              From (ICAO)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., KJFK"
                value={briefingData.departureAirport}
                onChange={(e) => setBriefingData({ ...briefingData, departureAirport: e.target.value.toUpperCase() })}
                className={inputClass}
              />
              <button
                onClick={() => fetchWeatherData(briefingData.departureAirport)}
                disabled={loading || !briefingData.departureAirport}
                className={`px-4 py-2 rounded font-medium transition flex items-center gap-2 whitespace-nowrap ${
                  loading || !briefingData.departureAirport
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : darkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {!loading && 'Fetch Weather'}
              </button>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              To (ICAO)
            </label>
            <input
              type="text"
              placeholder="e.g., KLAX"
              value={briefingData.arrivalAirport}
              onChange={(e) => setBriefingData({ ...briefingData, arrivalAirport: e.target.value.toUpperCase() })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Aircraft Type
            </label>
            <input
              type="text"
              placeholder="e.g., Cessna 172"
              value={briefingData.aircraftType}
              onChange={(e) => setBriefingData({ ...briefingData, aircraftType: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              N-Number
            </label>
            <input
              type="text"
              placeholder="e.g., N12345"
              value={briefingData.nNumber}
              onChange={(e) => setBriefingData({ ...briefingData, nNumber: e.target.value.toUpperCase() })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Weather */}
      <div className={`p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>Weather & NOTAMs</h2>

        {weatherError && (
          <div className={`mb-4 p-3 rounded flex gap-2 ${darkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-300'}`}>
            <AlertCircle size={20} className={darkMode ? 'text-red-400' : 'text-red-600'} />
            <p className={darkMode ? 'text-red-300' : 'text-red-700'}>{weatherError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              METAR
            </label>
            <textarea
              placeholder="Paste METAR here or fetch from airport using the button above"
              value={briefingData.metar}
              onChange={(e) => setBriefingData({ ...briefingData, metar: e.target.value })}
              className={textareaClass}
              rows={3}
            />
            {briefingData.metar && (
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Raw METAR observation
              </p>
            )}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              TAF
            </label>
            <textarea
              placeholder="Paste TAF here or fetch from airport using the button above"
              value={briefingData.taf}
              onChange={(e) => setBriefingData({ ...briefingData, taf: e.target.value })}
              className={textareaClass}
              rows={3}
            />
            {briefingData.taf && (
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Terminal Aerodrome Forecast (valid 24-30 hours)
              </p>
            )}
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              NOTAMs (one per line)
            </label>
            <textarea
              placeholder="Paste NOTAMs here (one per line)"
              value={briefingData.notams}
              onChange={(e) => setBriefingData({ ...briefingData, notams: e.target.value })}
              className={textareaClass}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Fuel Plan */}
      <div className={`p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>Fuel Plan</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Total Distance (nm)
            </label>
            <input
              type="text"
              value={briefingData.fuelPlan.totalDistance}
              onChange={(e) => setBriefingData({
                ...briefingData,
                fuelPlan: { ...briefingData.fuelPlan, totalDistance: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Total Time (hours)
            </label>
            <input
              type="text"
              value={briefingData.fuelPlan.totalTime}
              onChange={(e) => setBriefingData({
                ...briefingData,
                fuelPlan: { ...briefingData.fuelPlan, totalTime: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Fuel Burned (gallons)
            </label>
            <input
              type="text"
              value={briefingData.fuelPlan.fuelBurned}
              onChange={(e) => setBriefingData({
                ...briefingData,
                fuelPlan: { ...briefingData.fuelPlan, fuelBurned: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Reserve (45 min, gallons)
            </label>
            <input
              type="text"
              value={briefingData.fuelPlan.reserve}
              onChange={(e) => setBriefingData({
                ...briefingData,
                fuelPlan: { ...briefingData.fuelPlan, reserve: e.target.value }
              })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Weight & Balance */}
      <div className={`p-4 rounded border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>Weight & Balance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Ramp Weight (lbs)
            </label>
            <input
              type="text"
              value={briefingData.weightBalance.rampWeight}
              onChange={(e) => setBriefingData({
                ...briefingData,
                weightBalance: { ...briefingData.weightBalance, rampWeight: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Takeoff Weight (lbs)
            </label>
            <input
              type="text"
              value={briefingData.weightBalance.takeoffWeight}
              onChange={(e) => setBriefingData({
                ...briefingData,
                weightBalance: { ...briefingData.weightBalance, takeoffWeight: e.target.value }
              })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              CG (inches)
            </label>
            <input
              type="text"
              value={briefingData.weightBalance.cg}
              onChange={(e) => setBriefingData({
                ...briefingData,
                weightBalance: { ...briefingData.weightBalance, cg: e.target.value }
              })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Generate PDF Button */}
      <div className="flex gap-4">
        <button
          onClick={handleGeneratePDF}
          className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition ${
            darkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <Download size={20} />
          Generate & Download PDF
        </button>
        <button
          onClick={() => window.print()}
          className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition ${
            darkMode
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
          }`}
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default Briefing;
