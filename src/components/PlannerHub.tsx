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
      <div className="flex flex-wrap bg-black border border-zinc-800 rounded-sm overflow-hidden">
        <div className="flex gap-0 overflow-x-auto">
          {plannerTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePlannerTab(tab.id as any)}
                className={`flex items-center justify-center gap-2 px-4 py-4 text-[9px] font-black tracking-widest border-r border-zinc-800 transition-all whitespace-nowrap flex-shrink-0 ${
                  activePlannerTab === tab.id
                    ? 'bg-red-700 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]'
                    : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
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
