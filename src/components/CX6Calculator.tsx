import { useState } from 'react';
import { Calculator, Wind, Gauge, Clock } from 'lucide-react';

interface CX6CalculatorProps {
  darkMode: boolean;
}

const CX6Calculator: React.FC<CX6CalculatorProps> = ({ darkMode }) => {
  const [activeCalculator, setActiveCalculator] = useState('wind-triangle');
  
  // Wind Triangle Calculator State
  const [windTriangle, setWindTriangle] = useState({
    trueAirspeed: '',
    windDirection: '',
    windSpeed: '',
    trueCourse: '',
    results: {
      groundSpeed: 0,
      windCorrectionAngle: 0,
      heading: 0
    }
  });

  // True Airspeed Calculator State
  const [tasCalculator, setTasCalculator] = useState({
    indicatedAirspeed: '',
    pressureAltitude: '',
    temperature: '',
    result: 0
  });

  // Time-Speed-Distance Calculator State
  const [tsdCalculator, setTsdCalculator] = useState({
    time: '',
    speed: '',
    distance: '',
    calculateFor: 'distance' as 'time' | 'speed' | 'distance'
  });

  // Fuel Consumption Calculator State
  const [fuelCalculator, setFuelCalculator] = useState({
    fuelFlow: '',
    time: '',
    distance: '',
    speed: '',
    calculateFor: 'consumption' as 'consumption' | 'endurance' | 'range'
  });

  // Crosswind Calculator State
  const [crosswindCalculator, setCrosswindCalculator] = useState({
    runwayHeading: '',
    windDirection: '',
    windSpeed: '',
    results: {
      crosswindComponent: 0,
      headwindComponent: 0,
      crosswindDirection: '' as 'left' | 'right' | ''
    }
  });

  const calculateWindTriangle = () => {
    const tas = parseFloat(windTriangle.trueAirspeed);
    const wd = parseFloat(windTriangle.windDirection) * (Math.PI / 180); // Convert to radians
    const ws = parseFloat(windTriangle.windSpeed);
    const tc = parseFloat(windTriangle.trueCourse) * (Math.PI / 180); // Convert to radians

    if (isNaN(tas) || isNaN(wd) || isNaN(ws) || isNaN(tc)) return;

    // Wind triangle calculations
    const windAngle = wd - tc;
    const wca = Math.asin((ws * Math.sin(windAngle)) / tas);
    const gs = Math.sqrt(Math.pow(tas, 2) + Math.pow(ws, 2) - 2 * tas * ws * Math.cos(Math.PI - windAngle));
    const heading = tc + wca;

    setWindTriangle(prev => ({
      ...prev,
      results: {
        groundSpeed: Math.round(gs),
        windCorrectionAngle: Math.round(wca * (180 / Math.PI) * 10) / 10,
        heading: Math.round((heading * (180 / Math.PI)) % 360)
      }
    }));
  };

  const calculateTrueAirspeed = () => {
    const ias = parseFloat(tasCalculator.indicatedAirspeed);
    const pa = parseFloat(tasCalculator.pressureAltitude);
    const temp = parseFloat(tasCalculator.temperature);

    if (isNaN(ias) || isNaN(pa) || isNaN(temp)) return;

    // Simplified TAS calculation (approximation)
    const standardTemp = 15 - (pa / 1000 * 2); // Standard temperature at altitude
    const tempRatio = (temp + 273.15) / (standardTemp + 273.15);
    const densityRatio = Math.pow(1 - pa / 44330, 4.256);
    const tas = ias * Math.sqrt(tempRatio / densityRatio);

    setTasCalculator(prev => ({
      ...prev,
      result: Math.round(tas)
    }));
  };

  const calculateTSD = () => {
    const time = parseFloat(tsdCalculator.time);
    const speed = parseFloat(tsdCalculator.speed);
    const distance = parseFloat(tsdCalculator.distance);

    if (tsdCalculator.calculateFor === 'distance' && !isNaN(time) && !isNaN(speed)) {
      setTsdCalculator(prev => ({ ...prev, distance: (time * speed).toFixed(1) }));
    } else if (tsdCalculator.calculateFor === 'time' && !isNaN(distance) && !isNaN(speed)) {
      setTsdCalculator(prev => ({ ...prev, time: (distance / speed).toFixed(2) }));
    } else if (tsdCalculator.calculateFor === 'speed' && !isNaN(distance) && !isNaN(time)) {
      setTsdCalculator(prev => ({ ...prev, speed: (distance / time).toFixed(1) }));
    }
  };

  const calculateCrosswind = () => {
    const runway = parseFloat(crosswindCalculator.runwayHeading);
    const windDir = parseFloat(crosswindCalculator.windDirection);
    const windSpeed = parseFloat(crosswindCalculator.windSpeed);

    if (isNaN(runway) || isNaN(windDir) || isNaN(windSpeed)) return;

    // Calculate the angle between runway and wind
    let angle = Math.abs(runway - windDir);
    if (angle > 180) angle = 360 - angle;

    // Calculate crosswind and headwind components
    const crosswind = Math.round(windSpeed * Math.sin(angle * Math.PI / 180));
    const headwind = Math.round(windSpeed * Math.cos(angle * Math.PI / 180));

    // Determine crosswind direction
    let crosswindDirection: 'left' | 'right' | '' = '';
    if (crosswind !== 0) {
      const windToRunway = (windDir - runway + 360) % 360;
      crosswindDirection = windToRunway > 180 ? 'left' : 'right';
    }

    setCrosswindCalculator(prev => ({
      ...prev,
      results: {
        crosswindComponent: Math.abs(crosswind),
        headwindComponent: headwind,
        crosswindDirection
      }
    }));
  };

  const calculators = [
    { id: 'wind-triangle', label: 'Wind Triangle', icon: Wind },
    { id: 'true-airspeed', label: 'True Airspeed', icon: Gauge },
    { id: 'time-speed-distance', label: 'Time/Speed/Distance', icon: Clock },
    { id: 'fuel', label: 'Fuel Planning', icon: Calculator },
    { id: 'crosswind', label: 'Crosswind Component', icon: Wind }
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-b ${
        darkMode ? 'border-gray-600' : 'border-gray-200'
      } p-6`}>
        <h2 className="text-2xl font-bold mb-4">CX-6 Flight Computer</h2>
        <div className="flex flex-wrap gap-2">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeCalculator === calc.id
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : darkMode
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{calc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Wind Triangle Calculator */}
        {activeCalculator === 'wind-triangle' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Wind Triangle Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">True Airspeed (kts)</label>
                  <input
                    type="number"
                    value={windTriangle.trueAirspeed}
                    onChange={(e) => setWindTriangle({...windTriangle, trueAirspeed: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Wind Direction (°)</label>
                  <input
                    type="number"
                    value={windTriangle.windDirection}
                    onChange={(e) => setWindTriangle({...windTriangle, windDirection: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="270"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Wind Speed (kts)</label>
                  <input
                    type="number"
                    value={windTriangle.windSpeed}
                    onChange={(e) => setWindTriangle({...windTriangle, windSpeed: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">True Course (°)</label>
                  <input
                    type="number"
                    value={windTriangle.trueCourse}
                    onChange={(e) => setWindTriangle({...windTriangle, trueCourse: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="090"
                  />
                </div>
                <button
                  onClick={calculateWindTriangle}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Calculate Wind Triangle
                </button>
              </div>
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4">Results</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Ground Speed:</span>
                    <span>{windTriangle.results.groundSpeed} kts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Wind Correction Angle:</span>
                    <span>{windTriangle.results.windCorrectionAngle}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Magnetic Heading:</span>
                    <span>{windTriangle.results.heading}°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* True Airspeed Calculator */}
        {activeCalculator === 'true-airspeed' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">True Airspeed Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Indicated Airspeed (kts)</label>
                  <input
                    type="number"
                    value={tasCalculator.indicatedAirspeed}
                    onChange={(e) => setTasCalculator({...tasCalculator, indicatedAirspeed: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pressure Altitude (ft)</label>
                  <input
                    type="number"
                    value={tasCalculator.pressureAltitude}
                    onChange={(e) => setTasCalculator({...tasCalculator, pressureAltitude: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="5500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
                  <input
                    type="number"
                    value={tasCalculator.temperature}
                    onChange={(e) => setTasCalculator({...tasCalculator, temperature: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="5"
                  />
                </div>
                <button
                  onClick={calculateTrueAirspeed}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Calculate True Airspeed
                </button>
              </div>
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4">Result</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {tasCalculator.result} kts
                  </div>
                  <div className="text-sm opacity-75">True Airspeed</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time/Speed/Distance Calculator */}
        {activeCalculator === 'time-speed-distance' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Time/Speed/Distance Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Calculate:</label>
                  <select
                    value={tsdCalculator.calculateFor}
                    onChange={(e) => setTsdCalculator({...tsdCalculator, calculateFor: e.target.value as 'time' | 'speed' | 'distance'})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="distance">Distance</option>
                    <option value="time">Time</option>
                    <option value="speed">Speed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time (hours)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tsdCalculator.time}
                    onChange={(e) => setTsdCalculator({...tsdCalculator, time: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="1.5"
                    disabled={tsdCalculator.calculateFor === 'time'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Speed (kts)</label>
                  <input
                    type="number"
                    value={tsdCalculator.speed}
                    onChange={(e) => setTsdCalculator({...tsdCalculator, speed: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="120"
                    disabled={tsdCalculator.calculateFor === 'speed'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Distance (nm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tsdCalculator.distance}
                    onChange={(e) => setTsdCalculator({...tsdCalculator, distance: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="180"
                    disabled={tsdCalculator.calculateFor === 'distance'}
                  />
                </div>
                <button
                  onClick={calculateTSD}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Calculate
                </button>
              </div>
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4">Quick Reference</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Distance = Speed × Time</strong></div>
                  <div><strong>Time = Distance ÷ Speed</strong></div>
                  <div><strong>Speed = Distance ÷ Time</strong></div>
                </div>
                <div className="mt-6">
                  <h5 className="font-medium mb-2">Unit Conversions:</h5>
                  <div className="text-sm space-y-1 opacity-75">
                    <div>1 nm = 1.15 statute miles</div>
                    <div>1 nm = 6,076 feet</div>
                    <div>60 nm = 1 degree latitude</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fuel Planning Calculator */}
        {activeCalculator === 'fuel' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Fuel Planning Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fuel Flow (gal/hr)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fuelCalculator.fuelFlow}
                    onChange={(e) => setFuelCalculator({...fuelCalculator, fuelFlow: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="8.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Flight Time (hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fuelCalculator.time}
                    onChange={(e) => setFuelCalculator({...fuelCalculator, time: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Distance (nm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fuelCalculator.distance}
                    onChange={(e) => setFuelCalculator({...fuelCalculator, distance: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ground Speed (kts)</label>
                  <input
                    type="number"
                    value={fuelCalculator.speed}
                    onChange={(e) => setFuelCalculator({...fuelCalculator, speed: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="120"
                  />
                </div>
              </div>
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4">Fuel Calculations</h4>
                <div className="space-y-4">
                  {fuelCalculator.fuelFlow && fuelCalculator.time && (
                    <div className="flex justify-between">
                      <span className="font-medium">Fuel Required:</span>
                      <span>{(parseFloat(fuelCalculator.fuelFlow) * parseFloat(fuelCalculator.time)).toFixed(1)} gal</span>
                    </div>
                  )}
                  {fuelCalculator.distance && fuelCalculator.speed && (
                    <div className="flex justify-between">
                      <span className="font-medium">Flight Time:</span>
                      <span>{(parseFloat(fuelCalculator.distance) / parseFloat(fuelCalculator.speed)).toFixed(2)} hrs</span>
                    </div>
                  )}
                  {fuelCalculator.fuelFlow && fuelCalculator.distance && fuelCalculator.speed && (
                    <div className="flex justify-between">
                      <span className="font-medium">Fuel per NM:</span>
                      <span>{(parseFloat(fuelCalculator.fuelFlow) / parseFloat(fuelCalculator.speed)).toFixed(2)} gal/nm</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Safety Reminders:</h5>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Always carry VFR reserve (45 min day / 45 min night)</li>
                    <li>• IFR reserve: Destination + Alternate + 45 min</li>
                    <li>• Consider weather and alternate airports</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crosswind Calculator */}
        {activeCalculator === 'crosswind' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Crosswind Component Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Runway Heading (°)</label>
                  <input
                    type="number"
                    value={crosswindCalculator.runwayHeading}
                    onChange={(e) => setCrosswindCalculator({...crosswindCalculator, runwayHeading: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="090"
                    min="0"
                    max="360"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Wind Direction (°)</label>
                  <input
                    type="number"
                    value={crosswindCalculator.windDirection}
                    onChange={(e) => setCrosswindCalculator({...crosswindCalculator, windDirection: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="270"
                    min="0"
                    max="360"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Wind Speed (kts)</label>
                  <input
                    type="number"
                    value={crosswindCalculator.windSpeed}
                    onChange={(e) => setCrosswindCalculator({...crosswindCalculator, windSpeed: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="15"
                    min="0"
                  />
                </div>
                <button
                  onClick={calculateCrosswind}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Calculate Crosswind
                </button>
              </div>
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4">Crosswind Analysis</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Crosswind Component:</span>
                    <span className={`${crosswindCalculator.results.crosswindComponent > 15 ? 'text-red-600 font-bold' : crosswindCalculator.results.crosswindComponent > 10 ? 'text-orange-600' : 'text-green-600'}`}>
                      {crosswindCalculator.results.crosswindComponent} kts
                      {crosswindCalculator.results.crosswindDirection && ` (${crosswindCalculator.results.crosswindDirection})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Headwind Component:</span>
                    <span className={crosswindCalculator.results.headwindComponent < 0 ? 'text-blue-600' : 'text-green-600'}>
                      {crosswindCalculator.results.headwindComponent} kts
                      {crosswindCalculator.results.headwindComponent < 0 ? ' (Tailwind)' : ' (Headwind)'}
                    </span>
                  </div>

                  <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Crosswind Limits:</h5>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• &lt; 10 kts: No special consideration</li>
                      <li>• 10-15 kts: Use caution, check aircraft limits</li>
                      <li>• &gt; 15 kts: May exceed aircraft crosswind limits</li>
                      <li>• Always consult POH for specific limits</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Safety Notes:</h5>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Crosswind affects takeoff and landing</li>
                      <li>• Higher crosswinds require more runway</li>
                      <li>• Consider wind gusts in calculations</li>
                      <li>• Practice crosswind landings in training</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CX6Calculator;