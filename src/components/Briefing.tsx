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

  const inputClass = 'bg-black text-white border border-zinc-800 rounded px-3 py-2 w-full text-sm';

  const textareaClass = 'bg-black text-white border border-zinc-800 rounded px-3 py-2 w-full resize-none text-sm';

  return (
    <div className="p-4 sm:p-6 space-y-6 rounded-lg border border-zinc-800 bg-black shadow-2xl">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <FileText className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-xl sm:text-3xl font-bold text-white">
          Flight Briefing Builder
        </h1>
      </div>

      <div className="p-3 sm:p-4 rounded bg-zinc-900">
        <p className="text-xs sm:text-sm text-zinc-300">
          Generate a complete preflight briefing PDF with flight plan, weather, fuel planning, and weight & balance information.
        </p>
      </div>

      {/* Flight Info */}
      <div className="p-3 sm:p-4 rounded border border-zinc-800 bg-zinc-900">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white uppercase tracking-wider">Flight Information</h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
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
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
                From (ICAO)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="KJFK"
                  maxLength={4}
                  value={briefingData.departureAirport}
                  onChange={(e) => setBriefingData({ ...briefingData, departureAirport: e.target.value.toUpperCase() })}
                  className={inputClass}
                />
                <button
                  onClick={() => fetchWeatherData(briefingData.departureAirport)}
                  disabled={loading || !briefingData.departureAirport}
                  className={`px-3 py-2 rounded text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2 whitespace-nowrap ${
                    loading || !briefingData.departureAirport
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                      : 'bg-red-700 text-white hover:bg-red-800'
                  }`}
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  {!loading && 'Fetch'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
                To (ICAO)
              </label>
              <input
                type="text"
                placeholder="KLAX"
                maxLength={4}
                value={briefingData.arrivalAirport}
                onChange={(e) => setBriefingData({ ...briefingData, arrivalAirport: e.target.value.toUpperCase() })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
                Aircraft Type
              </label>
              <input
                type="text"
                placeholder="Cessna 172"
                value={briefingData.aircraftType}
                onChange={(e) => setBriefingData({ ...briefingData, aircraftType: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
                N-Number
              </label>
              <input
                type="text"
                placeholder="N12345"
                value={briefingData.nNumber}
                onChange={(e) => setBriefingData({ ...briefingData, nNumber: e.target.value.toUpperCase() })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weather */}
      <div className="p-3 sm:p-4 rounded border border-zinc-800 bg-zinc-900">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white uppercase tracking-wider">Weather & NOTAMs</h2>

        {weatherError && (
          <div className="mb-4 p-3 rounded flex gap-2 bg-black border border-red-900/50">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{weatherError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              METAR
            </label>
            <textarea
              placeholder="Paste METAR or use Fetch button"
              value={briefingData.metar}
              onChange={(e) => setBriefingData({ ...briefingData, metar: e.target.value })}
              className={textareaClass}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              TAF
            </label>
            <textarea
              placeholder="Paste TAF or use Fetch button"
              value={briefingData.taf}
              onChange={(e) => setBriefingData({ ...briefingData, taf: e.target.value })}
              className={textareaClass}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              NOTAMs
            </label>
            <textarea
              placeholder="Paste NOTAMs (one per line)"
              value={briefingData.notams}
              onChange={(e) => setBriefingData({ ...briefingData, notams: e.target.value })}
              className={textareaClass}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Fuel Plan */}
      <div className="p-3 sm:p-4 rounded border border-zinc-800 bg-zinc-900">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white uppercase tracking-wider">Fuel Plan</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              Dist (nm)
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
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              Time (hrs)
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
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              Burn (gal)
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
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              Reserve
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
      <div className="p-3 sm:p-4 rounded border border-zinc-800 bg-zinc-900">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white uppercase tracking-wider">Weight & Balance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              Ramp (lbs)
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
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              Takeoff (lbs)
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
            <label className="block text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">
              CG (in)
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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-4">
        <button
          onClick={handleGeneratePDF}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded text-xs font-black uppercase tracking-[0.2em] transition bg-red-700 text-white hover:bg-red-800 shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-95"
        >
          <Download size={16} />
          Generate PDF
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded text-xs font-black uppercase tracking-[0.2em] transition bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 active:scale-95"
        >
          Print Briefing
        </button>
      </div>
    </div>
  );
};

export default Briefing;
