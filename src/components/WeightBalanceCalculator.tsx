import { useEffect, useState } from 'react';
import { Scale, Plus, Minus } from 'lucide-react';
import sampleAircrafts from '../data/sampleAircrafts.json';

interface WeightItem {
  id: string;
  name: string;
  weight: string;
  arm: string;
}

interface WeightBalanceCalculatorProps {
  darkMode: boolean;
}

const WeightBalanceCalculator: React.FC<WeightBalanceCalculatorProps> = ({ darkMode }) => {
  const [weightItems, setWeightItems] = useState<WeightItem[]>(() => {
    const profile = (sampleAircrafts as any[]).find(a => a.id === 'c172');
    return [
      { id: '1', name: 'Empty Weight', weight: profile ? String(profile.emptyWeight) : '', arm: profile ? String(profile.emptyArm) : '' },
      { id: '2', name: 'Pilot & Front Passenger', weight: '', arm: '37' },
      { id: '3', name: 'Rear Passengers', weight: '', arm: '73' },
      { id: '4', name: 'Baggage', weight: '', arm: '95' },
      { id: '5', name: 'Fuel (lbs)', weight: profile ? String(profile.fuelWeightLbs || 318) : '', arm: profile ? String(profile.fuelArm || 48) : '48' }
    ];
  });

  const [aircraftLimits, setAircraftLimits] = useState({
    maxWeight: '2300',
    forwardCG: '35.0',
    aftCG: '47.3'
  });

  const [aircraftData, setAircraftData] = useState(() => {
    const profile = (sampleAircrafts as any[]).find(a => a.id === 'c172');
    return {
      emptyWeight: profile ? String(profile.emptyWeight) : '1720.9',
      emptyArm: profile ? String(profile.emptyArm) : '41.9',
      fuelWeight: profile ? String(profile.fuelWeightLbs || 318) : '318',
      fuelArm: profile ? String(profile.fuelArm || 48) : '48',
      rampArm: profile ? String(profile.rampArm || 41.9) : '42.21',
      takeoffArm: profile ? String(profile.takeoffArm || 41.9) : '42.20',
      landingArm: profile ? String(profile.landingArm || 41.5) : '41.20',
      startupDeduction: profile ? String(profile.startupDeductionLbs || 8) : '8',
      burnedDeduction: profile ? String(profile.burnedDeductionLbs || 120) : '120'
    };
  });

  const [aircraftProfile, setAircraftProfile] = useState<string>('c172');
  // startup and burned fuel are now entered as weightItems rows (gallons)

  useEffect(() => {
    // load default profile and prefill empty weight/arm/limits
    const profile = (sampleAircrafts as any[]).find(a => a.id === aircraftProfile);
    if (profile) {
      setAircraftLimits({
        maxWeight: String(profile.maxWeight),
        forwardCG: String(profile.forwardCG),
        aftCG: String(profile.aftCG)
      });

      setAircraftData({
        emptyWeight: String(profile.emptyWeight),
        emptyArm: String(profile.emptyArm),
        fuelWeight: String(profile.fuelWeightLbs || 318),
        fuelArm: String(profile.fuelArm || 48),
        rampArm: String(profile.rampArm || profile.emptyArm),
        takeoffArm: String(profile.takeoffArm || profile.emptyArm),
        landingArm: String(profile.landingArm || profile.emptyArm),
        startupDeduction: String(profile.startupDeductionLbs || 8),
        burnedDeduction: String(profile.burnedDeductionLbs || 120)
      });

      // set empty weight and arm on first row and prefill fuel weight
      setWeightItems(items => items.map(it => {
        if (it.name === 'Empty Weight') return { ...it, weight: String(profile.emptyWeight), arm: String(profile.emptyArm) };
        if (it.name === 'Fuel (lbs)') return { ...it, weight: String(profile.fuelWeightLbs || 318), arm: String(profile.fuelArm || 48) };
        return it;
      }));
    }
  }, [aircraftProfile]);

  // Update weight items when aircraft data changes
  useEffect(() => {
    setWeightItems(items => items.map(it => {
      if (it.name === 'Empty Weight') return { ...it, weight: aircraftData.emptyWeight, arm: aircraftData.emptyArm };
      if (it.name === 'Fuel (lbs)') return { ...it, weight: aircraftData.fuelWeight, arm: aircraftData.fuelArm };
      return it;
    }));
  }, [aircraftData]);

  const addWeightItem = () => {
    const newItem: WeightItem = {
      id: Date.now().toString(),
      name: 'Custom Item',
      weight: '',
      arm: ''
    };
    setWeightItems([...weightItems, newItem]);
  };

  const removeWeightItem = (id: string) => {
    if (weightItems.length > 1) {
      setWeightItems(weightItems.filter(item => item.id !== id));
    }
  };

  const updateWeightItem = (id: string, field: keyof WeightItem, value: string) => {
    setWeightItems(weightItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateWeightAndBalance = () => {

    let totalWeight = 0;
    let totalMoment = 0;

    // determine fuel arm from aircraft data
    // Use fixed fuel arm from aircraft data for all fuel calculations
    const fuelArmValue = isNaN(Number(aircraftData.fuelArm)) ? 48 : Number(aircraftData.fuelArm);

    // accumulate payload weights and fuel weight (lbs)
    let payloadWeight = 0;
    let payloadMoment = 0;
    let fuelLbs = 0;

    weightItems.forEach(item => {
      const arm = parseFloat(item.arm) || 0;
      const val = parseFloat(item.weight) || 0;
      
      // Detect fuel, startup, and burned rows
      const isStartup = /startup|taxi|runup/i.test(item.name);
      const isBurned = /burn|en-?route|enroute/i.test(item.name);
      const isFuel = /fuel(?!.*(startup|taxi|runup|burn|en-?route|enroute))/i.test(item.name);
      
      if (isFuel) {
        fuelLbs = val;
        // Use fixed fuel arm, not the one from the table
      } else if (isStartup || isBurned) {
        // These are handled by fixed deductions, not table calculations
        // Just skip them in the payload calculation
      } else {
        // Regular payload items
        payloadWeight += val;
        payloadMoment += val * arm;
      }
    });

    // Use fixed deductions from aircraft data
    const startupDeduction = Number(aircraftData.startupDeduction) || 8;
    const burnedDeduction = Number(aircraftData.burnedDeduction) || 120;

    const fuelMoment = fuelLbs * fuelArmValue;

    totalWeight = payloadWeight + fuelLbs;
    totalMoment = payloadMoment + fuelMoment;

  // Ramp calculations
  const rampWeight = totalWeight;
  const rampMoment = totalMoment;
  const rampCG = rampWeight > 0 ? rampMoment / rampWeight : 0;

  // Use arms from aircraft data
  const rampArm = isNaN(Number(aircraftData.rampArm)) ? 42.21 : Number(aircraftData.rampArm);
  const takeoffArm = isNaN(Number(aircraftData.takeoffArm)) ? 42.20 : Number(aircraftData.takeoffArm);
  const landingArm = isNaN(Number(aircraftData.landingArm)) ? 41.20 : Number(aircraftData.landingArm);

  // Derived rows
  const takeoffWeight = Math.max(0, rampWeight - startupDeduction);
  const takeoffMoment = Math.max(0, rampMoment - 384); // -8 * 48 = -384
  const takeoffCG = takeoffWeight > 0 ? takeoffMoment / takeoffWeight : 0;

  const landingWeight = Math.max(0, takeoffWeight - burnedDeduction);
  const landingMoment = Math.max(0, takeoffMoment - 5760); // -120 * 48 = -5760
  const landingCG = landingWeight > 0 ? landingMoment / landingWeight : 0;

    const isWithinWeightLimit = rampWeight <= Number(aircraftLimits.maxWeight);
    const isWithinCGLimit = rampCG >= Number(aircraftLimits.forwardCG) && rampCG <= Number(aircraftLimits.aftCG);

    return {
      totalWeight,
      totalMoment,
      rampWeight,
      rampMoment,
      rampCG,
      takeoffWeight,
      takeoffMoment,
      takeoffCG,
      landingWeight,
      landingMoment,
      landingCG,
      startupDeduction,
      burnedDeduction,
      rampArm,
      takeoffArm,
      landingArm,
      isWithinWeightLimit,
      isWithinCGLimit,
      fuelLbs,
      startupWeightLbs: startupDeduction,
      burnedWeightLbs: burnedDeduction,
      startupMoment: 384,
      burnedMoment: 5760
    };
  };

  const results = calculateWeightAndBalance();

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-b ${
        darkMode ? 'border-gray-600' : 'border-gray-200'
      } p-6`}>
        <div className="flex items-center space-x-3 mb-4">
          <Scale className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className="text-2xl font-bold">Weight and Balance Calculator</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aircraft Profile</label>
            <select
              value={aircraftProfile}
              onChange={(e) => setAircraftProfile(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {(sampleAircrafts as any[]).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Gross Weight (lbs)</label>
            <input
              type="number"
              value={aircraftLimits.maxWeight}
              onChange={(e) => setAircraftLimits({...aircraftLimits, maxWeight: e.target.value})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Forward CG Limit (in)</label>
            <input
              type="number"
              step="0.1"
              value={aircraftLimits.forwardCG}
              onChange={(e) => setAircraftLimits({...aircraftLimits, forwardCG: e.target.value})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Aft CG Limit (in)</label>
            <input
              type="number"
              step="0.1"
              value={aircraftLimits.aftCG}
              onChange={(e) => setAircraftLimits({...aircraftLimits, aftCG: e.target.value})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Empty Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={aircraftData.emptyWeight}
              onChange={(e) => setAircraftData({...aircraftData, emptyWeight: e.target.value})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Empty Weight Arm (in)</label>
            <input
              type="number"
              step="0.1"
              value={aircraftData.emptyArm}
              onChange={(e) => setAircraftData({...aircraftData, emptyArm: e.target.value})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fuel Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={aircraftData.fuelWeight}
              onChange={(e) => setAircraftData({...aircraftData, fuelWeight: e.target.value})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fuel Arm (in)</label>
            <input
              type="number"
              step="0.1"
              value={aircraftData.fuelArm}
              onChange={(e) => setAircraftData({...aircraftData, fuelArm: e.target.value})}
              className={`w-full p-2 border rounded-md ${
                darkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Startup Deduction (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={aircraftData.startupDeduction}
              onChange={(e) => setAircraftData({...aircraftData, startupDeduction: e.target.value})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Burned Fuel Deduction (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={aircraftData.burnedDeduction}
              onChange={(e) => setAircraftData({...aircraftData, burnedDeduction: e.target.value})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Weight Items</h3>
          <div className="space-x-2">
            <button
              onClick={addWeightItem}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Item
            </button>
            <button
              onClick={() => window.print()}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors border ${
                darkMode ? 'border-gray-500 text-white' : 'border-gray-300 text-gray-900'
              }`}
            >
              Print
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <th className="border border-gray-300 p-3 text-left font-medium">Item</th>
                <th className="border border-gray-300 p-3 text-center font-medium">Weight (lbs)</th>
                <th className="border border-gray-300 p-3 text-center font-medium">Arm (in)</th>
                <th className="border border-gray-300 p-3 text-center font-medium">Moment</th>
                <th className="border border-gray-300 p-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {weightItems.map((item, index) => {
                const arm = isNaN(parseFloat(item.arm)) ? 0 : parseFloat(item.arm);
                const val = parseFloat(item.weight) || 0;

                // Detect fuel, startup, and burned rows
                const isStartup = /startup|taxi|runup/i.test(item.name);
                const isBurned = /burn|en-?route|enroute/i.test(item.name);
                const isFuel = /fuel(?!.*(startup|taxi|runup|burn|en-?route|enroute))/i.test(item.name);

                // determine fuel arm default
                const fuelArmDefault = isNaN(Number(aircraftData.fuelArm)) ? 48 : Number(aircraftData.fuelArm);

                // For fuel-related rows, the item.weight is in pounds (not gallons)
                let displayWeight = val; // default (lbs for payload rows)
                let moment = 0;
                if (isFuel) {
                  // Fuel is already in pounds, use fixed fuel arm from aircraft data
                  displayWeight = val;
                  moment = val * fuelArmDefault;
                } else if (isStartup) {
                  // Startup fuel entered as pounds, use fixed fuel arm
                  displayWeight = -val; // show as deduction
                  moment = -val * fuelArmDefault;
                } else if (isBurned) {
                  // Burned fuel entered as pounds, use fixed fuel arm
                  displayWeight = -val; // deduction
                  moment = -val * fuelArmDefault;
                } else {
                  // payload in lbs
                  displayWeight = val;
                  moment = val * arm;
                }

                return (
                  <tr key={item.id} className={index % 2 === 0 ? 
                    (darkMode ? 'bg-gray-800' : 'bg-white') : 
                    (darkMode ? 'bg-gray-750' : 'bg-gray-50')
                  }>
                    <td className="border border-gray-300 p-3">
                      <div className="flex flex-col">
                        <span className="mb-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateWeightItem(item.id, 'name', e.target.value)}
                            className={`w-full p-2 border rounded ${
                              darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </span>
                        {isFuel && (
                          <small className="text-xs opacity-75">Enter fuel in gallons above; weight column shows lbs</small>
                        )}
                        {isStartup && (
                          <small className="text-xs opacity-75">Enter startup/taxi/runup in gallons above</small>
                        )}
                        {isBurned && (
                          <small className="text-xs opacity-75">Enter burned fuel (gal) above</small>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3">
                      {/* display weight: for fuel rows show lbs (computed), otherwise editable lbs */}
                      {isFuel || isStartup || isBurned ? (
                        <input
                          type="text"
                          value={displayWeight.toFixed(1)}
                          disabled
                          className={`w-full p-2 border rounded text-center ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      ) : (
                        <input
                          type="number"
                          value={item.weight}
                          onChange={(e) => updateWeightItem(item.id, 'weight', e.target.value)}
                          className={`w-full p-2 border rounded text-center ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="0"
                        />
                      )}
                    </td>
                    <td className="border border-gray-300 p-3">
                      <input
                        type="number"
                        step="0.1"
                        value={item.arm}
                        onChange={(e) => updateWeightItem(item.id, 'arm', e.target.value)}
                        className={`w-full p-2 border rounded text-center ${
                          darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="0.0"
                      />
                    </td>
                    <td className="border border-gray-300 p-3 text-center font-medium">
                      {moment.toFixed(1)}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      {/* allow removal only for custom items (id length > 10) */}
                      {parseInt(item.id) && item.id.length > 10 ? (
                        <button
                          onClick={() => removeWeightItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}

              {/* Derived rows: Ramp, Less Startup, Takeoff, Less Fuel Burned, Landing */}
              {(() => {
                // reuse results computed earlier
                const r = results as any;
                const rows = [];
                const profile = (sampleAircrafts as any[]).find(a => a.id === aircraftProfile) || {};
                const fuelArmDefault = profile.fuelArm ? Number(profile.fuelArm) : 48;

                rows.push(
                  <tr key="ramp" className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td className="border border-gray-300 p-3">Ramp Weight</td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={r.rampWeight.toFixed(1)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={r.rampCG.toFixed(2)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center font-medium">{r.rampMoment.toFixed(1)}</td>
                    <td className="border border-gray-300 p-3 text-center"></td>
                  </tr>
                );

                // Less Startup (deduction)
                rows.push(
                  <tr key="less-startup" className={darkMode ? 'bg-gray-750' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-3">Less Startup/Taxi/Run-up</td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={(-r.startupWeightLbs).toFixed(1)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={fuelArmDefault.toFixed(2)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center font-medium">{(-r.startupMoment).toFixed(1)}</td>
                    <td className="border border-gray-300 p-3 text-center"></td>
                  </tr>
                );

                // Takeoff
                rows.push(
                  <tr key="takeoff" className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td className="border border-gray-300 p-3">Takeoff Weight</td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={r.takeoffWeight.toFixed(1)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={r.takeoffCG.toFixed(2)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center font-medium">{r.takeoffMoment.toFixed(1)}</td>
                    <td className="border border-gray-300 p-3 text-center"></td>
                  </tr>
                );

                // Less Fuel Burned
                rows.push(
                  <tr key="less-burn" className={darkMode ? 'bg-gray-750' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-3">Less Fuel Burned</td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={(-r.burnedWeightLbs).toFixed(1)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={fuelArmDefault.toFixed(2)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center font-medium">{(-r.burnedMoment).toFixed(1)}</td>
                    <td className="border border-gray-300 p-3 text-center"></td>
                  </tr>
                );

                // Landing
                rows.push(
                  <tr key="landing" className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td className="border border-gray-300 p-3">Landing Weight</td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={r.landingWeight.toFixed(1)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center"><input type="text" disabled value={r.landingCG.toFixed(2)} className="w-full p-2 border rounded text-center"/></td>
                    <td className="border border-gray-300 p-3 text-center font-medium">{r.landingMoment.toFixed(1)}</td>
                    <td className="border border-gray-300 p-3 text-center"></td>
                  </tr>
                );

                return rows;
              })()}
            </tbody>
          </table>
        </div>

        {/* Results Section */}
        <div className={`mt-6 grid grid-cols-1 md:grid-cols-2 gap-6`}>
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className="text-lg font-semibold mb-4">Results</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Ramp Weight:</span>
                <span className={results.isWithinWeightLimit ? 'text-green-600' : 'text-red-600'}>
                  {results.rampWeight.toFixed(1)} lbs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ramp CG:</span>
                <span className={results.isWithinCGLimit ? 'text-green-600' : 'text-red-600'}>
                  {results.rampCG.toFixed(2)} in
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Takeoff Weight:</span>
                <span>{results.takeoffWeight.toFixed(1)} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Takeoff CG:</span>
                <span>{results.takeoffCG.toFixed(2)} in</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Landing Weight:</span>
                <span>{results.landingWeight.toFixed(1)} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Landing CG:</span>
                <span>{results.landingCG.toFixed(2)} in</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className="text-lg font-semibold mb-4">Safety Limits Check</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Weight Limit:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  results.isWithinWeightLimit
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {results.isWithinWeightLimit ? 'WITHIN LIMITS' : 'OVERWEIGHT'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>CG Envelope:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  results.isWithinCGLimit
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {results.isWithinCGLimit ? 'WITHIN ENVELOPE' : 'OUT OF ENVELOPE'}
                </span>
              </div>
              <div className="text-sm opacity-75">
                CG Range: {aircraftLimits.forwardCG}" - {aircraftLimits.aftCG}"
              </div>
              <div className="text-sm opacity-75">
                Max Weight: {aircraftLimits.maxWeight} lbs
              </div>
            </div>

            {(!results.isWithinWeightLimit || !results.isWithinCGLimit) && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  ⚠️ Aircraft is outside safe operating limits!
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {!results.isWithinWeightLimit && 'Weight exceeds maximum limit. '}
                  {!results.isWithinCGLimit && 'CG is outside safe envelope.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CG Envelope Image */}
        <div className={`mt-6 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className="text-lg font-semibold mb-4">Center of Gravity Envelope</h4>
          <div className="text-center">
            <img
              src="/centerofgravitycessna172.png"
              alt="Cessna 172 Center of Gravity Envelope"
              className="w-full h-auto rounded-lg shadow-xl border-2 border-gray-300 dark:border-gray-600 mx-auto"
              style={{
                maxWidth: '1200px',
                maxHeight: '800px',
                width: '100%',
                height: '100%'
              }}
            />
            <div className="mt-6">
              <div className="text-xl font-bold mb-3">
                Current Position: {results.rampCG.toFixed(2)}" CG, {results.rampWeight.toFixed(1)} lbs
              </div>
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-medium ${
                results.isWithinCGLimit
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              }`}>
                {results.isWithinCGLimit ? (
                  <>
                    <span className="mr-3 text-2xl">✓</span>
                    WITHIN CG ENVELOPE
                  </>
                ) : (
                  <>
                    <span className="mr-3 text-2xl">⚠️</span>
                    OUTSIDE CG ENVELOPE
                  </>
                )}
              </div>
              <div className="mt-4 text-sm opacity-75">
                <div>Forward CG Limit: {aircraftLimits.forwardCG}" | Aft CG Limit: {aircraftLimits.aftCG}"</div>
                <div>Current CG Position: {results.rampCG.toFixed(2)}" from datum</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fuel Analysis */}
        <div className={`mt-6 p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className="text-lg font-semibold mb-3">Fuel Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-80">
                <div>Fuel weight conversion: 1 gal = 6 lbs</div>
                <div className="mt-2">Fuel on board: {(results.fuelLbs / 6).toFixed(1)} gal ({results.fuelLbs.toFixed(1)} lbs)</div>
                <div>Startup deduction: {aircraftData.startupDeduction} lbs</div>
                <div>Burned fuel deduction: {aircraftData.burnedDeduction} lbs</div>
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80">
                <div>Remaining fuel after startup: {(results.fuelLbs - Number(aircraftData.startupDeduction)).toFixed(1)} lbs</div>
                <div>Remaining fuel after flight: {(results.fuelLbs - Number(aircraftData.startupDeduction) - Number(aircraftData.burnedDeduction)).toFixed(1)} lbs</div>
                <div className="mt-2 text-xs">
                  <span className={results.fuelLbs - Number(aircraftData.startupDeduction) - Number(aircraftData.burnedDeduction) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {results.fuelLbs - Number(aircraftData.startupDeduction) - Number(aircraftData.burnedDeduction) >= 0 ? '✓ Sufficient fuel' : '⚠️ Insufficient fuel'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightBalanceCalculator;