import { useState } from 'react';
import { FileText, CheckSquare2, Plane } from 'lucide-react';
import Briefing from './Briefing';
import Checklists from './Checklists';
import AircraftProfileManager from './AircraftProfileManager';

interface ToolsHubProps {
  darkMode: boolean;
}

const ToolsHub: React.FC<ToolsHubProps> = ({ darkMode }) => {
  const [activeTool, setActiveTool] = useState<'briefing' | 'checklists' | 'aircraft'>('briefing');

  const tools = [
    { id: 'briefing', label: 'Briefing', icon: FileText, component: Briefing },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare2, component: Checklists },
    { id: 'aircraft', label: 'Aircraft', icon: Plane, component: AircraftProfileManager }
  ];

  const ActiveComponent = tools.find(t => t.id === activeTool)?.component || Briefing;

  return (
    <div className="w-full space-y-4">
      {/* Sub-tabs */}
      <div className={`border-b ${darkMode ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-white'}`}>
        <div className="flex gap-0">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTool === tool.id
                    ? darkMode
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-500 text-blue-600'
                    : darkMode
                    ? 'border-transparent text-slate-400 hover:text-slate-200'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {tool.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Content */}
      <ActiveComponent darkMode={darkMode} />
    </div>
  );
};

export default ToolsHub;
