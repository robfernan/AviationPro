import { useState } from 'react';
import { Navigation, FileText, CheckSquare2, Plane } from 'lucide-react';
import FlightPlanForm from './FlightPlanForm';
import Briefing from './Briefing';
import Checklists from './Checklists';
import AircraftProfileManager from './AircraftProfileManager';

interface PlannerHubProps {
  darkMode: boolean;
}

const PlannerHub: React.FC<PlannerHubProps> = ({ darkMode }) => {
  const [activePlannerTab, setActivePlannerTab] = useState<'flightplan' | 'briefing' | 'checklists' | 'aircraft'>('flightplan');

  const plannerTabs = [
    { id: 'flightplan', label: 'Flight Planner', icon: Navigation, component: FlightPlanForm },
    { id: 'briefing', label: 'Briefing', icon: FileText, component: Briefing },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare2, component: Checklists },
    { id: 'aircraft', label: 'Aircraft', icon: Plane, component: AircraftProfileManager }
  ];

  const ActiveComponent = plannerTabs.find(t => t.id === activePlannerTab)?.component || FlightPlanForm;

  return (
    <div className="w-full space-y-4">
      {/* Planning Sub-tabs */}
      <div className={`border-b ${darkMode ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-white'}`}>
        <div className="flex gap-0 overflow-x-auto">
          {plannerTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePlannerTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                  activePlannerTab === tab.id
                    ? darkMode
                      ? 'border-green-500 text-green-400'
                      : 'border-green-600 text-green-700'
                    : darkMode
                    ? 'border-transparent text-slate-400 hover:text-slate-200'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Planning Tab Content */}
      <ActiveComponent darkMode={darkMode} />
    </div>
  );
};

export default PlannerHub;
