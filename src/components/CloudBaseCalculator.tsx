import { useState } from 'react';
import { Cloud } from 'lucide-react';

interface CloudBaseCalculatorProps {
  darkMode: boolean;
}

const CloudBaseCalculator: React.FC<CloudBaseCalculatorProps> = ({ darkMode }) => {
  const [temperature, setTemperature] = useState('');
  const [dewPoint, setDewPoint] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculateCloudBase = () => {
    const temp = parseFloat(temperature);
    const dew = parseFloat(dewPoint);

    if (isNaN(temp) || isNaN(dew)) {
      setResult(null);
      return;
    }

    // Cloud base formula: (Temperature - Dew Point) / 2.5 * 1000 feet
    const cloudBase = ((temp - dew) / 2.5) * 1000;
    setResult(cloudBase);
  };

  const clearCalculation = () => {
    setTemperature('');
    setDewPoint('');
    setResult(null);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    } p-6`}>
      <div className="flex items-center space-x-3 mb-6">
        <Cloud className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <h2 className="text-xl font-bold">Cloud Base Calculator</h2>
      </div>
      
      <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Calculate the approximate height of cloud base using temperature and dew point.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className={`w-full p-3 border rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Enter temperature"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Dew Point (°C)</label>
            <input
              type="number"
              value={dewPoint}
              onChange={(e) => setDewPoint(e.target.value)}
              className={`w-full p-3 border rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Enter dew point"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={calculateCloudBase}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Calculate
            </button>
            <button
              onClick={clearCalculation}
              className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Clear
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <h3 className="text-lg font-semibold mb-4">Result</h3>
          {result !== null ? (
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {result.toFixed(0)} ft
              </div>
              <div className="text-sm opacity-75">AGL Cloud Base</div>
              <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> This is an approximation. Always check current METAR/TAF reports for official ceiling information.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 opacity-50">
              <Cloud className="w-16 h-16 mx-auto mb-4" />
              <p>Enter temperature and dew point to calculate cloud base</p>
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-medium mb-2">Formula Used:</h4>
            <div className={`text-sm p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} font-mono`}>
              Cloud Base = (Temp - Dew Point) / 2.5 × 1000 ft
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudBaseCalculator;