import { useState } from 'react';
import { MapPin, Navigation, Ruler, Globe, Clock, ExternalLink } from 'lucide-react';

interface NavigationToolsProps {
  darkMode: boolean;
}

const NavigationTools: React.FC<NavigationToolsProps> = ({ darkMode }) => {
  const [activetool, setActiveTool] = useState('distance');
  
  // Distance Calculator State
  const [distanceCalc, setDistanceCalc] = useState({
    lat1: '',
    lon1: '',
    lat2: '',
    lon2: '',
    result: null as number | null
  });

  // Bearing Calculator State
  const [bearingCalc, setBearingCalc] = useState({
    lat1: '',
    lon1: '',
    lat2: '',
    lon2: '',
    result: null as number | null
  });

  // Unit Conversions State
  const [conversions, setConversions] = useState({
    nauticalMiles: '',
    statuteMiles: '',
    kilometers: '',
    feet: ''
  });

  // Aviation Weather Links
  const weatherServices = [
    {
      name: 'Aviation Weather Center (NOAA)',
      url: 'https://aviationweather.gov',
      description: 'Official US aviation weather - METARs, TAFs, NOTAMs'
    },
    {
      name: 'National Weather Service Aviation',
      url: 'https://weather.gov/aviation',
      description: 'Aviation-specific forecasts and weather graphics'
    },
    {
      name: 'SkyVector',
      url: 'https://skyvector.com',
      description: 'Free aviation charts and planning tools'
    },
    {
      name: 'AirNav',
      url: 'https://airnav.com',
      description: 'Airport and FBO information database'
    },
    {
      name: 'FlightAware',
      url: 'https://flightaware.com',
      description: 'Flight tracking and delay information'
    },
    {
      name: '1800WXBrief',
      url: 'https://1800wxbrief.com',
      description: 'FAA weather briefing service'
    }
  ];

  // Time Zone Converter State
  const [timeConverter, setTimeConverter] = useState({
    utcTime: '',
    localOffset: '',
    convertedTime: ''
  });

  const tools = [
    { id: 'distance', label: 'Distance Calculator', icon: Ruler },
    { id: 'bearing', label: 'Bearing Calculator', icon: Navigation },
    { id: 'conversions', label: 'Unit Conversions', icon: MapPin },
    { id: 'aviation-weather', label: 'Aviation Weather', icon: Globe },
    { id: 'time-zones', label: 'Time Zone Converter', icon: Clock }
  ];

  // Convert degrees to radians
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  // Convert radians to degrees
  const toDegrees = (radians: number) => radians * (180 / Math.PI);

  const calculateDistance = () => {
    const lat1 = parseFloat(distanceCalc.lat1);
    const lon1 = parseFloat(distanceCalc.lon1);
    const lat2 = parseFloat(distanceCalc.lat2);
    const lon2 = parseFloat(distanceCalc.lon2);

    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return;

    // Haversine formula for great circle distance
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setDistanceCalc(prev => ({ ...prev, result: distance }));
  };

  const calculateBearing = () => {
    const lat1 = parseFloat(bearingCalc.lat1);
    const lon1 = parseFloat(bearingCalc.lon1);
    const lat2 = parseFloat(bearingCalc.lat2);
    const lon2 = parseFloat(bearingCalc.lon2);

    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return;

    const dLon = toRadians(lon2 - lon1);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;
    
    setBearingCalc(prev => ({ ...prev, result: bearing }));
  };

  const convertTimeZone = () => {
    const utcTime = timeConverter.utcTime;
    const offset = parseFloat(timeConverter.localOffset);

    if (!utcTime || isNaN(offset)) return;

    // Parse UTC time (assuming HH:MM format)
    const [hours, minutes] = utcTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    // Convert to minutes since midnight UTC
    const utcMinutes = hours * 60 + minutes;

    // Apply offset
    const localMinutes = utcMinutes + (offset * 60);

    // Handle day wraparound
    const adjustedMinutes = ((localMinutes % 1440) + 1440) % 1440;

    // Convert back to HH:MM format
    const localHours = Math.floor(adjustedMinutes / 60);
    const localMins = Math.floor(adjustedMinutes % 60);

    const convertedTime = `${localHours.toString().padStart(2, '0')}:${localMins.toString().padStart(2, '0')}`;
    setTimeConverter(prev => ({ ...prev, convertedTime }));
  };

  const convertUnits = (value: number, fromUnit: string) => {
    // Convert everything to nautical miles first, then to target units
    let nm: number;

    switch (fromUnit) {
      case 'nm':
        nm = value;
        break;
      case 'sm':
        nm = value / 1.15078;
        break;
      case 'km':
        nm = value / 1.852;
        break;
      case 'ft':
        nm = value / 6076.12;
        break;
      default:
        return;
    }

    setConversions({
      nauticalMiles: nm.toFixed(3),
      statuteMiles: (nm * 1.15078).toFixed(3),
      kilometers: (nm * 1.852).toFixed(3),
      feet: (nm * 6076.12).toFixed(0)
    });
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-b ${
        darkMode ? 'border-gray-600' : 'border-gray-200'
      } p-6`}>
        <h2 className="text-2xl font-bold mb-4">Navigation Tools</h2>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activetool === tool.id
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : darkMode
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Distance Calculator */}
  {activetool === 'distance' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Distance Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">From Coordinates</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={distanceCalc.lat1}
                        onChange={(e) => setDistanceCalc({...distanceCalc, lat1: e.target.value})}
                        className={`w-full p-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="40.7128"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={distanceCalc.lon1}
                        onChange={(e) => setDistanceCalc({...distanceCalc, lon1: e.target.value})}
                        className={`w-full p-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">To Coordinates</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={distanceCalc.lat2}
                        onChange={(e) => setDistanceCalc({...distanceCalc, lat2: e.target.value})}
                        className={`w-full p-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="34.0522"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={distanceCalc.lon2}
                        onChange={(e) => setDistanceCalc({...distanceCalc, lon2: e.target.value})}
                        className={`w-full p-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="-118.2437"
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={calculateDistance}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Calculate Distance
                </button>
              </div>
              
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4">Result</h4>
                {distanceCalc.result !== null ? (
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {distanceCalc.result.toFixed(1)} nm
                    </div>
                    <div className="text-sm space-y-1 opacity-75">
                      <div>{(distanceCalc.result * 1.15078).toFixed(1)} statute miles</div>
                      <div>{(distanceCalc.result * 1.852).toFixed(1)} kilometers</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-50">
                    <Ruler className="w-16 h-16 mx-auto mb-4" />
                    <p>Enter coordinates to calculate distance</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bearing Calculator */}
  {activetool === 'bearing' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Bearing Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">From Coordinates</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={bearingCalc.lat1}
                        onChange={(e) => setBearingCalc({...bearingCalc, lat1: e.target.value})}
                        className={`w-full p-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={bearingCalc.lon1}
                        onChange={(e) => setBearingCalc({...bearingCalc, lon1: e.target.value})}
                        className={`w-full p-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">To Coordinates</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={bearingCalc.lat2}
                        onChange={(e) => setBearingCalc({...bearingCalc, lat2: e.target.value})}
                        className={`w-full p-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={bearingCalc.lon2}
                        onChange={(e) => setBearingCalc({...bearingCalc, lon2: e.target.value})}
                        className={`w-full p-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={calculateBearing}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Calculate Bearing
                </button>
              </div>
              
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4">Result</h4>
                {bearingCalc.result !== null ? (
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {bearingCalc.result.toFixed(1)}°
                    </div>
                    <div className="text-sm opacity-75">True Bearing</div>
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-50">
                    <Navigation className="w-16 h-16 mx-auto mb-4" />
                    <p>Enter coordinates to calculate bearing</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Unit Conversions */}
  {activetool === 'conversions' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Unit Conversions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nautical Miles</label>
                  <input
                    type="number"
                    step="any"
                    value={conversions.nauticalMiles}
                    onChange={(e) => {
                      setConversions({...conversions, nauticalMiles: e.target.value});
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) convertUnits(val, 'nm');
                    }}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Statute Miles</label>
                  <input
                    type="number"
                    step="any"
                    value={conversions.statuteMiles}
                    onChange={(e) => {
                      setConversions({...conversions, statuteMiles: e.target.value});
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) convertUnits(val, 'sm');
                    }}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="115.078"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kilometers</label>
                  <input
                    type="number"
                    step="any"
                    value={conversions.kilometers}
                    onChange={(e) => {
                      setConversions({...conversions, kilometers: e.target.value});
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) convertUnits(val, 'km');
                    }}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="185.2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Feet</label>
                  <input
                    type="number"
                    step="any"
                    value={conversions.feet}
                    onChange={(e) => {
                      setConversions({...conversions, feet: e.target.value});
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) convertUnits(val, 'ft');
                    }}
                    className={`w-full p-3 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="607612"
                  />
                </div>
              </div>
              
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4">Aviation Distance Reference</h4>
                <div className="space-y-3 text-sm">
                  <div><strong>1 nautical mile =</strong></div>
                  <div>• 1.15078 statute miles</div>
                  <div>• 1.852 kilometers</div>
                  <div>• 6,076.12 feet</div>
                  <div>• 1 minute of latitude</div>
                  
                  <div className="mt-4"><strong>Quick References:</strong></div>
                  <div>• 60 nm = 1° latitude</div>
                  <div>• 1 nm = ~2,000 yards</div>
                  <div>• Standard rate turn: 3°/second</div>
                  <div>• 1 knot = 1 nm/hour</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aviation Weather Services */}
        {activetool === 'aviation-weather' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Official Aviation Weather Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weatherServices.map((service, index) => (
                <div key={index} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{service.name}</h4>
                      <p className="text-xs opacity-75 mb-3">{service.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-50" />
                  </div>
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    <span>Visit Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
              <h4 className="font-semibold mb-2">Weather Briefing Tips</h4>
              <ul className="text-sm space-y-1">
                <li>• Always get an official briefing before flight</li>
                <li>• Check NOTAMs for airspace changes</li>
                <li>• Monitor for convective SIGMETs</li>
                <li>• Review TAFs for destination and alternates</li>
                <li>• Check winds aloft for route planning</li>
              </ul>
            </div>
          </div>
        )}

        {/* Time Zone Converter */}
        {activetool === 'time-zones' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Time Zone Converter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">UTC Time (HH:MM)</label>
                  <input
                    type="time"
                    value={timeConverter.utcTime}
                    onChange={(e) => setTimeConverter({...timeConverter, utcTime: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Local Time Offset (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={timeConverter.localOffset}
                    onChange={(e) => setTimeConverter({...timeConverter, localOffset: e.target.value})}
                    className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="-5"
                    min="-12"
                    max="14"
                  />
                </div>
                <button
                  onClick={convertTimeZone}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Convert Time
                </button>
              </div>

              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className="text-lg font-semibold mb-4">Converted Time</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {timeConverter.convertedTime || '--:--'}
                  </div>
                  <div className="text-sm opacity-75">Local Time</div>
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <h5 className="font-medium">Common UTC Offsets:</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>EST (UTC-5)</div>
                    <div>CST (UTC-6)</div>
                    <div>MST (UTC-7)</div>
                    <div>PST (UTC-8)</div>
                    <div>GMT (UTC+0)</div>
                    <div>CET (UTC+1)</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <h6 className="font-medium text-yellow-800 dark:text-yellow-200 text-xs mb-1">Aviation Time Reference:</h6>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    All aviation times are in UTC (Zulu time) unless specified otherwise
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationTools;