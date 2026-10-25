import React, { useState } from 'react';
import { Wind, Gauge, Clock, Fuel, Zap, Scale, Send } from 'lucide-react';
import { AviationMath } from '../core/aviationMath';
import WeightBalanceCalculator from './WeightBalanceCalculator';

interface CX6CalculatorProps {
  darkMode: boolean;
}

const CX6Calculator: React.FC<CX6CalculatorProps> = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('WIND');

  return (
    <div className="flex flex-col h-full border bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden rounded-lg">
      
      {/* 🛠️ UNIFIED MFD NAVIGATION BAR */}
      <div className="flex flex-wrap bg-zinc-900/90 border-b border-zinc-800">
        <TabBtn active={activeTab === 'WIND'} onClick={() => setActiveTab('WIND')} icon={<Wind size={13}/>} label="WIND" />
        <TabBtn active={activeTab === 'TAS'} onClick={() => setActiveTab('TAS')} icon={<Gauge size={13}/>} label="TAS" />
        <TabBtn active={activeTab === 'TSD'} onClick={() => setActiveTab('TSD')} icon={<Clock size={13}/>} label="TSD" />
        <TabBtn active={activeTab === 'FUEL'} onClick={() => setActiveTab('FUEL')} icon={<Fuel size={13}/>} label="FUEL" />
        <TabBtn active={activeTab === 'X-WIND'} onClick={() => setActiveTab('X-WIND')} icon={<Zap size={13}/>} label="X-WIND" />
        <TabBtn active={activeTab === 'WB'} onClick={() => setActiveTab('WB')} icon={<Scale size={13}/>} label="W&B" />
      </div>

      {/* 🖥️ MAIN INSTRUMENT DISPLAY */}
      <div className="flex-1 overflow-y-auto">
        <div className={activeTab === 'WB' ? "" : "p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto"}>
          {activeTab === 'WIND' && <WindTriangleView />}
          {activeTab === 'TAS' && <TASView />}
          {activeTab === 'TSD' && <TSDView />}
          {activeTab === 'FUEL' && <FuelView />}
          {activeTab === 'X-WIND' && <XWindView />}
          
          {activeTab === 'WB' && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
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
      windSpd: wSpd,
      heading: res.heading,
      gs: res.groundSpeed,
      wca: res.windCorrectionAngle,
      timestamp: Date.now()
    };
    localStorage.setItem('latest_wind_result', JSON.stringify(snapshot));
    alert("Wind calculation sent to Briefing Builder.");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="True Airspeed (TAS)" value={tas} onChange={setTas} unit="KT" />
        <Input label="Course (CRS)" value={course} onChange={setCourse} unit="°" />
        <Input label="Wind Direction (DIR)" value={wDir} onChange={setWDir} unit="°" />
        <Input label="Wind Speed (SPD)" value={wSpd} onChange={setWSpd} unit="KT" />
      </div>
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg p-5 grid grid-cols-3 gap-3 shadow-inner">
        <Stat label="Calculated Heading" val={`${res.heading}°`} />
        <Stat label="Ground Speed" val={`${res.groundSpeed} KT`} />
        <Stat label="Wind Correction" val={`${res.windCorrectionAngle}°`} color="text-red-400" />
      </div>
      <button
        onClick={handleSendToBriefing}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-700 hover:bg-red-600 text-white transition-all text-xs font-black uppercase tracking-widest rounded shadow-md active:scale-98"
      >
        <Send size={14} /> Push To Flight Plan Briefing
      </button>
    </div>
  );
};

const TASView = () => {
  const [ias, setIas] = useState(110);
  const [pa, setPa] = useState(4500);
  const [temp, setTemp] = useState(20);
  const tas = AviationMath.calculateTAS(ias, pa, temp);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Indicated Airspeed (IAS)" value={ias} onChange={setIas} unit="KIAS" />
        <Input label="Pressure Altitude (PA)" value={pa} onChange={setPa} unit="FT" />
        <Input label="Outside Air Temp (OAT)" value={temp} onChange={setTemp} unit="°C" />
      </div>
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg p-6 text-center shadow-inner">
        <Stat label="Calculated True Airspeed (TAS)" val={`${tas} KT`} color="text-red-400" />
      </div>
    </div>
  );
};

const TSDView = () => {
  const [dist, setDist] = useState(120);
  const [gs, setGs] = useState(115);
  const time = (dist / gs).toFixed(2);
  const minutes = Math.round((dist / gs) * 60);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Leg Distance" value={dist} onChange={setDist} unit="NM" />
        <Input label="Ground Speed (GS)" value={gs} onChange={setGs} unit="KT" />
      </div>
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg p-6 shadow-inner flex justify-around">
        <Stat label="Time Enroute (Decimal)" val={`${time} HRS`} />
        <Stat label="Estimated Time" val={`${minutes} MIN`} color="text-red-400" />
      </div>
    </div>
  );
};

const FuelView = () => {
  const [flow, setFlow] = useState(8.5);
  const [time, setTime] = useState(2.2);
  const burn = AviationMath.calculateFuel(flow, time);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Fuel Consumption Rate" value={flow} onChange={setFlow} unit="GPH" />
        <Input label="Total Flight Duration" value={time} onChange={setTime} unit="HRS" />
      </div>
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg p-6 shadow-inner border-l-4 border-l-red-600 flex justify-around">
        <Stat label="Estimated Fuel Burned" val={`${burn} GAL`} color="text-red-400" />
        <Stat label="Weight Equivalent (100LL)" val={`${(burn * 6).toFixed(1)} LBS`} />
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Runway Heading" value={rwy} onChange={setRwy} unit="°" />
        <Input label="Wind Direction" value={wDir} onChange={setWDir} unit="°" />
        <Input label="Wind Speed" value={wSpd} onChange={setWSpd} unit="KT" />
      </div>
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg p-6 shadow-inner flex justify-around">
        <Stat label="Crosswind Component" val={`${res.xwind} KT ${res.direction}`} color="text-red-400" />
        <Stat label="Headwind Component" val={`${res.headwind} KT`} />
      </div>
    </div>
  );
};

// --- Atomic UI Components ---

const Input = ({ label, value, onChange, unit }: any) => (
  <div className="space-y-1.5">
    <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">{label}</div>
    <div className="relative">
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(Number(e.target.value))} 
        className="w-full bg-[#121217] border border-zinc-700 p-2.5 pr-10 text-white outline-none focus:border-red-500 rounded text-sm font-mono font-bold" 
      />
      <div className="absolute right-3 top-2.5 text-[10px] text-zinc-400 font-bold uppercase">{unit}</div>
    </div>
  </div>
);

const Stat = ({ label, val, color = "text-white" }: any) => (
  <div className="text-center sm:text-left">
    <div className="text-[10px] text-zinc-400 uppercase mb-1 font-bold tracking-wider">{label}</div>
    <div className={`text-2xl font-black ${color} tracking-tight`}>{val}</div>
  </div>
);

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex-1 min-w-[70px] flex items-center justify-center gap-2 py-3.5 text-[10px] sm:text-xs font-black tracking-widest border-r border-zinc-800 transition-all ${
      active 
        ? 'bg-red-700 text-white shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]' 
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

export default CX6Calculator;
