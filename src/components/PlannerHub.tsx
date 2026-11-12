import { useState } from 'react';
import { Navigation, FileText, CheckSquare2, ShieldAlert } from 'lucide-react';
import FlightPlanForm from './FlightPlanForm';
import Briefing from './Briefing';
import Checklists from './Checklists';
import FratAssessment from './FratAssessment';

interface PlannerHubProps {
  darkMode: boolean;
}

const PlannerHub: React.FC<PlannerHubProps> = ({ darkMode }) => {
  const [activePlannerTab, setActivePlannerTab] = useState<'flightplan' | 'briefing' | 'checklists' | 'frat'>('flightplan');

  const plannerTabs = [
    { id: 'flightplan', label: 'NavLog & Flight Planner', shortLabel: 'NavLog', icon: Navigation, component: FlightPlanForm },
    { id: 'briefing', label: 'Preflight Briefing PDF', shortLabel: 'Briefing PDF', icon: FileText, component: Briefing },
    { id: 'checklists', label: 'Checklists', shortLabel: 'Checklists', icon: CheckSquare2, component: Checklists },
    { id: 'frat', label: 'PAVE / FRAT Risk Matrix', shortLabel: 'FRAT Risk', icon: ShieldAlert, component: FratAssessment },
  ];

  const ActiveComponent = plannerTabs.find((t) => t.id === activePlannerTab)?.component || FlightPlanForm;

  return (
    <div className="w-full space-y-2.5 sm:space-y-4">
      {/* Planning Sub-tabs */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap bg-slate-900/90 border border-slate-800/80 rounded-lg p-1 gap-1 w-full sm:w-fit">
        {plannerTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePlannerTab(tab.id as any)}
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold tracking-wide rounded-md transition-all whitespace-nowrap ${
                activePlannerTab === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <Icon size={13} className="shrink-0" />
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Planning Tab Content */}
      <ActiveComponent darkMode={darkMode} />
    </div>
  );
};

export default PlannerHub;
