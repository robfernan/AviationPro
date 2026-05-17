import React, { useState } from 'react';
import { Wind, Gauge, Clock, Fuel, Zap, Scale, Send } from 'lucide-react';
import { AviationMath } from '../core/aviationMath';
// Import the full-scale W&B module we just finalized
import WeightBalanceCalculator from './WeightBalanceCalculator';

interface CX6CalculatorProps {
  darkMode: boolean;
}

const CX6Calculator: React.FC<CX6CalculatorProps> = ({ darkMode }) => {
  // Added 'WB' as a possible state
  const [activeTab, setActiveTab] = useState('WIND');

  return (
    <div className={`flex flex-col h-full border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} shadow-2xl overflow-hidden`}>
      
      {/* 🛠️ UNIFIED MFD NAVIGATION BAR */}
      <div className="flex flex-wrap bg-black border-b border-zinc-800">
        <TabBtn active={activeTab === 'WIND'} onClick={() => setActiveTab('WIND')} icon={<Wind size={12}/>} label="WIND" />
        <TabBtn active={activeTab === 'TAS'} onClick={() => setActiveTab('TAS')} icon={<Gauge size={12}/>} label="TAS" />
        <TabBtn active={activeTab === 'TSD'} onClick={() => setActiveTab('TSD')} icon={<Clock size={12}/>} label="TSD" />
        <TabBtn active={activeTab === 'FUEL'} onClick={() => setActiveTab('FUEL')} icon={<Fuel size={12}/>} label="FUEL" />
        <TabBtn active={activeTab === 'X-WIND'} onClick={() => setActiveTab('X-WIND')} icon={<Zap size={12}/>} label="X-WIND" />
        
        {/* NEW WEIGHT & BALANCE INTEGRATION */}
        <TabBtn 
          active={activeTab === 'WB'} 
          onClick={() => setActiveTab('WB')} 
          icon={<Scale size={12}/>} 
          label="W&B" 
        />
      </div>

      {/* 🖥️ MAIN INSTRUMENT DISPLAY */}
      <div className="flex-1 overflow-y-auto">
        {/* Only apply internal padding for CX6 modules; W&B handles its own padding */}
        <div className={activeTab === 'WB' ? "" : "p-6 space-y-6"}>
          {activeTab === 'WIND' && <WindTriangleView />}
          {activeTab === 'TAS' && <TASView />}
          {activeTab === 'TSD' && <TSDView />}
          {activeTab === 'FUEL' && <FuelView />}
          {activeTab === 'X-WIND' && <XWindView />}
          
          {/* THE STRATEGIC W&B ENGINE */}
          {activeTab === 'WB' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <WeightBalanceCalculator darkMode={darkMode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- View Modules (CX-6 Core) ---

const WindTriangleView = () => {
  const [tas, setTas] = useState(120);
  const [wDir, setWDir] = useState(270);
  const [wSpd, setWSpd] = useState(15);
  const [course, setCourse] = useState(90);
  const res = AviationMath.calculateWCA(course, tas, wDir, wSpd);

  const handleSendToBriefing = () => {
    const snapshot = {
      tas,
      course,
      windDir: wDir,
      windSpd,
      heading: res.heading,
      gs: res.groundSpeed,
      wca: res.windCorrectionAngle,
      timestamp: Date.now()
    };
    localStorage.setItem('latest_wind_result', JSON.stringify(snapshot));
    alert("Wind calculation sent to Briefing Builder.");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="TAS" value={tas} onChange={setTas} unit="KT" />
        <Input label="COURSE" value={course} onChange={setCourse} unit="°" />
        <Input label="WIND DIR" value={wDir} onChange={setWDir} unit="°" />
        <Input label="WIND SPD" value={wSpd} onChange={setWSpd} unit="KT" />
      </div>
      <div className="bg-black p-4 grid grid-cols-3 gap-2 border border-zinc-800">
        <Stat label="HDG" val={`${res.heading}°`} />
        <Stat label="GS" val={`${res.groundSpeed}`} />
        <Stat label="WCA" val={`${res.windCorrectionAngle}°`} color="text-red-500" />
      </div>
      <button
        onClick={handleSendToBriefing}
        className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
      >
        <Send size={12} /> Push_To_Briefing
      </button>
    </div>
  );
};

const TASView = () => {
  const [ias, setIas] = useState(100);
  const [pa, setPa] = useState(5000);
  const [temp, setTemp] = useState(15);
  const tas = AviationMath.calculateTAS(ias, pa, temp);
  return (
    <div className="space-y-4">
      <Input label="Indicated Airspeed" value={ias} onChange={setIas} unit="KIAS" />
      <Input label="Pressure Altitude" value={pa} onChange={setPa} unit="FT" />
      <Input label="Temperature" value={temp} onChange={setTemp} unit="°C" />
      <div className="bg-red-700 p-6 text-center">
        <Stat label="True Airspeed" val={`${tas} KT`} />
      </div>
    </div>
  );
};

const TSDView = () => {
  const [dist, setDist] = useState(100);
  const [gs, setGs] = useState(120);
  const time = (dist / gs).toFixed(2);
  return (
    <div className="space-y-4">
      <Input label="Distance" value={dist} onChange={setDist} unit="NM" />
      <Input label="Ground Speed" value={gs} onChange={setGs} unit="KT" />
      <div className="bg-zinc-800 p-6">
        <Stat label="Time Enroute" val={`${time} HR`} />
      </div>
    </div>
  );
};

const FuelView = () => {
  const [flow, setFlow] = useState(8.5);
  const [time, setTime] = useState(2);
  const burn = AviationMath.calculateFuel(flow, time);
  return (
    <div className="space-y-4">
      <Input label="Fuel Flow" value={flow} onChange={setFlow} unit="GPH" />
      <Input label="Flight Time" value={time} onChange={setTime} unit="HR" />
      <div className="bg-zinc-800 p-6 border-l-4 border-red-600">
        <Stat label="Total Fuel Burn" val={`${burn} GAL`} />
      </div>
    </div>
  );
};

const XWindView = () => {
  const [rwy, setRwy] = useState(90);
  const [wDir, setWDir] = useState(120);
  const [wSpd, setWSpd] = useState(15);
  const res = AviationMath.calculateCrosswind(rwy, wDir, wSpd);
  return (
    <div className="space-y-4">
      <Input label="Runway Heading" value={rwy} onChange={setRwy} unit="°" />
      <Input label="Wind Direction" value={wDir} onChange={setWDir} unit="°" />
      <Input label="Wind Speed" value={wSpd} onChange={setWSpd} unit="KT" />
      <div className="bg-black p-4 border border-zinc-800 flex justify-between">
        <Stat label="X-WIND" val={`${res.xwind} ${res.direction}`} color="text-red-500" />
        <Stat label="HEADWIND" val={`${res.headwind}`} />
      </div>
    </div>
  );
};

// --- Atomic UI Components ---

const Input = ({ label, value, onChange, unit }: any) => (
  <div className="space-y-1">
    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</div>
    <div className="relative">
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(Number(e.target.value))} 
        className="w-full bg-black border border-zinc-800 p-2 text-white outline-none focus:border-red-600 text-xs font-mono" 
      />
      <div className="absolute right-2 top-2 text-[8px] text-zinc-700 font-bold uppercase">{unit}</div>
    </div>
  </div>
);

const Stat = ({ label, val, color = "text-white" }: any) => (
  <div>
    <div className="text-[8px] text-zinc-500 uppercase mb-1 font-bold tracking-widest">{label}</div>
    <div className={`text-xl font-black ${color}`}>{val}</div>
  </div>
);

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex-1 min-w-[70px] flex items-center justify-center gap-2 py-4 text-[9px] font-black tracking-widest border-r border-zinc-800 transition-all ${
      active ? 'bg-red-700 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

export default CX6Calculator;