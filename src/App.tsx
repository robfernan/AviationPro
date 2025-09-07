import { useState, useEffect } from 'react';
import { Calculator, Plane, Wind, MapPin, Route, FileText } from 'lucide-react';
import FlightPlanForm from './components/FlightPlanForm';
import WeatherCalculator from './components/WeatherCalculator';
import WeightBalanceCalculator from './components/WeightBalanceCalculator';
import CX6Calculator from './components/CX6Calculator';
import NavigationTools from './components/NavigationTools';
import FlightLogs from './components/FlightLogs';

function App() {
  const [activeTab, setActiveTab] = useState('planner');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const tabs = [
    { id: 'planner', label: 'Flight Planner', icon: Route },
    { id: 'cx6', label: 'CX-6 Computer', icon: Calculator },
    { id: 'weather', label: 'Weather Tools', icon: Wind },
    { id: 'performance', label: 'Performance', icon: Plane },
    { id: 'navigation', label: 'Navigation', icon: MapPin },
    { id: 'logs', label: 'Flight Logs', icon: FileText }
  ];

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b-2 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-blue-400 shadow-lg shadow-blue-400/20' 
          : 'bg-white border-blue-600 shadow-lg shadow-blue-600/10'
      }`}>
        <div className="w-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Plane className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <h1 className="text-2xl font-bold">AviationPro</h1>
                  <p className="text-sm opacity-75">Professional Flight Planning Suite</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open('https://foreflight.com', '_blank')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
                }`}
                title="Open ForeFlight Web"
              >
                <Plane className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => window.open('https://pilot.garmin.com', '_blank')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-green-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-green-600'
                }`}
                title="Open Garmin Pilot"
              >
                <MapPin className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`sticky top-20 z-40 border-b transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="w-full mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? darkMode
                        ? 'border-blue-400 text-blue-400 bg-gray-700'
                        : 'border-blue-600 text-blue-600 bg-blue-50'
                      : darkMode
                        ? 'border-transparent text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 py-6">
        {activeTab === 'planner' && <FlightPlanForm darkMode={darkMode} />}
        {activeTab === 'cx6' && <CX6Calculator darkMode={darkMode} />}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <WeatherCalculator darkMode={darkMode} />
          </div>
        )}
        {activeTab === 'performance' && <WeightBalanceCalculator darkMode={darkMode} />}
        {activeTab === 'navigation' && <NavigationTools darkMode={darkMode} />}
        {activeTab === 'logs' && <FlightLogs darkMode={darkMode} />}
      </main>

      {/* Footer */}
      <footer className={`mt-12 border-t transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="w-full mx-auto px-4 py-6">
          <div className="text-center text-sm opacity-60">
            <p>© 2025 AviationPro Flight Planning Suite. For simulation purposes only.</p>
            <p className="mt-1">Always consult official publications and current weather for actual flight planning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;