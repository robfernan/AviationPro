import { useState } from 'react';
import { Calculator, Plane, Wind, MapPin, Navigation, FileText } from 'lucide-react';
import FlightPlanForm from './src/components/FlightPlanForm';
import WeatherCalculator from './src/components/WeatherCalculator';
import WeightBalanceCalculator from './src/components/WeightBalanceCalculator';
import CX6Calculator from './src/components/CX6Calculator';
import NavigationTools from './src/components/NavigationTools';
import FlightLogs from './src/components/FlightLogs';

type AviationProAppProps = {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

function AviationProApp({ darkMode = false, toggleDarkMode }: AviationProAppProps) {
  const [activeTab, setActiveTab] = useState('planner');

  const tabs = [
    { id: 'planner', label: 'Flight Planner', icon: Navigation },
    { id: 'cx6', label: 'CX-6 Computer', icon: Calculator },
    { id: 'weather', label: 'Weather Tools', icon: Wind },
    { id: 'performance', label: 'Performance', icon: Plane },
    { id: 'navigation', label: 'Navigation', icon: MapPin },
    { id: 'logs', label: 'Flight Logs', icon: FileText }
  ];

  // toggleDarkMode is provided by parent; if not provided, fall back to noop
  const localToggle = toggleDarkMode ?? (() => {});

  return (
    <div className="aviation-scope min-h-screen bg-theme-bg dark:bg-theme-bg-dark text-theme-primary dark:text-theme-primary-dark">
      <header className="border-b border-theme-accent/30 dark:border-theme-accent-dark/30 bg-theme-header dark:bg-theme-header-dark">
        <div className="px-2 py-1 flex items-center justify-between gap-1">
          <h1 className="text-lg sm:text-2xl font-bold text-theme-primary dark:text-theme-primary-dark flex-shrink-0">AviationPro</h1>
          <nav className="flex gap-0.5 flex-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center justify-center p-1 sm:p-2 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-theme-accent dark:bg-theme-accent-dark text-white' 
                    : 'bg-theme-card dark:bg-theme-card-dark text-theme-secondary dark:text-theme-secondary-dark hover:bg-theme-accent/10 dark:hover:bg-theme-accent-dark/10'
                }`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="p-4">
        {activeTab === 'planner' && <FlightPlanForm darkMode={darkMode} />}
        {activeTab === 'cx6' && <CX6Calculator darkMode={darkMode} />}
        {activeTab === 'weather' && <WeatherCalculator darkMode={darkMode} />}
        {activeTab === 'performance' && <WeightBalanceCalculator darkMode={darkMode} />}
        {activeTab === 'navigation' && <NavigationTools darkMode={darkMode} />}
        {activeTab === 'logs' && <FlightLogs darkMode={darkMode} />}
      </main>
    </div>
  );
}

export default AviationProApp;
