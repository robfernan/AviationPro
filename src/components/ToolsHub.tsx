import { useState } from 'react';
import { FileText, CheckSquare2 } from 'lucide-react';
import Briefing from './Briefing';
import Checklists from './Checklists';

interface ToolsHubProps {
  darkMode: boolean;
}

const ToolsHub: React.FC<ToolsHubProps> = ({ darkMode }) => {
  const [activeTool, setActiveTool] = useState<'briefing' | 'checklists'>('briefing');

  const tools = [
    { id: 'briefing', label: 'Briefing', icon: FileText, component: Briefing },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare2, component: Checklists }
  ];

  const ActiveComponent = tools.find(t => t.id === activeTool)?.component || Briefing;

  return (
    <div className="w-full space-y-4">
      {/* Sub-tabs */}
      <div className="flex flex-wrap bg-black border border-zinc-800 rounded-sm overflow-hidden">
        <div className="flex gap-0">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as any)}
                className={`flex items-center justify-center gap-2 px-4 py-4 text-[9px] font-black tracking-widest border-r border-zinc-800 transition-all ${
                  activeTool === tool.id
                    ? 'bg-red-700 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]'
                    : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
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
      <div className="rounded-lg">
        <ActiveComponent darkMode={darkMode} />
      </div>
    </div>
  );
};

export default ToolsHub;
