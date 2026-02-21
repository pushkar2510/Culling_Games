// import React, { useState, useEffect } from 'react';
// import { Card, Button, Input, Loader } from '../../components/ui/Components';
// import { Play, Pause, Square, RefreshCw, Save } from 'lucide-react';
// import { useToast } from '../../context/ToastContext';
// import api from '../../utils/api';

// const GameControl = () => {
//   const { addToast } = useToast();
//   const [loading, setLoading] = useState(true);
  
//   const [gameState, setGameState] = useState({
//     is_active: false,
//     is_paused: false,
//     current_week: 1,
//     registration_open: false
//   });

//   const [allConfigs, setAllConfigs] = useState([]);

//   const [weekConfig, setWeekConfig] = useState({
//     week_number: 1,
//     weekly_cap: 30,
//     curse_power: 50,
//     shield_power: 100
//   });

//   // Fetch initial game state AND all saved configs
//   const fetchData = async () => {
//     try {
//       const [stateRes, configRes] = await Promise.all([
//         api.get('/game/status'),
//         api.get('/week-config/all')
//       ]);
      
//       const stateData = stateRes.data;
//       const configData = configRes.data;

//       setGameState(stateData);
//       setAllConfigs(configData);
      
//       // Auto-populate the config form with the CURRENT week's saved config
//       const currentWk = stateData.current_week || 1;
//       const matchingConfig = configData.find(c => c.week_number === currentWk);
      
//       if (matchingConfig) {
//         setWeekConfig({
//           week_number: matchingConfig.week_number,
//           weekly_cap: matchingConfig.weekly_cap,
//           curse_power: matchingConfig.curse_power,
//           shield_power: matchingConfig.shield_power
//         });
//       } else {
//         setWeekConfig(prev => ({ ...prev, week_number: currentWk }));
//       }
//     } catch (error) {
//       addToast("Failed to fetch game state or configurations", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleAction = async (action) => {
//     try {
//       if (action === 'STOP' && !window.confirm("Are you sure? This ends the game and determines the winner.")) return;
      
//       const endpoint = `/game/${action.toLowerCase()}`;
//       const res = await api.post(endpoint);
      
//       addToast(res.data.message || `Game ${action} executed successfully`, "success");
//       if(res.data.winner) {
//         addToast(`WINNER: ${res.data.winner}`, "success");
//       }
      
//       await fetchData(); // Refresh state after action
//     } catch (error) {
//       addToast(error.response?.data?.error || `Failed to ${action}`, "error");
//     }
//   };

//   const handleWeekUpdate = async (e) => {
//     e.preventDefault();
//     if(window.confirm("Changing the week resets all weekly points and deactivates powers. Proceed?")) {
//         try {
//           const res = await api.put('/admin/week/set', { week_number: Number(weekConfig.week_number) });
//           addToast(res.data.message, "success");
//           await fetchData();
//         } catch (error) {
//           addToast(error.response?.data?.error || "Failed to update week", "error");
//         }
//     }
//   };

//   const handleConfigUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post('/week-config/set', {
//         week_number: Number(weekConfig.week_number),
//         curse_power: Number(weekConfig.curse_power),
//         shield_power: Number(weekConfig.shield_power),
//         weekly_cap: Number(weekConfig.weekly_cap)
//       });
//       addToast(res.data.message || "Weekly configuration saved", "success");
//       await fetchData(); // Refresh the saved configs list
//     } catch (error) {
//       addToast(error.response?.data?.error || "Failed to save configuration", "error");
//     }
//   };

//   // Auto-fill fields if user types a week number that is already saved in the database
//   const handleTargetWeekChange = (e) => {
//     const selectedWeek = Number(e.target.value);
//     const matchingConfig = allConfigs.find(c => c.week_number === selectedWeek);
    
//     if (matchingConfig) {
//       setWeekConfig({
//         week_number: selectedWeek,
//         weekly_cap: matchingConfig.weekly_cap,
//         curse_power: matchingConfig.curse_power,
//         shield_power: matchingConfig.shield_power
//       });
//     } else {
//       setWeekConfig(prev => ({ ...prev, week_number: selectedWeek }));
//     }
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
//       <h1 className="text-3xl font-bold text-white mb-6">Game Protocol Control</h1>

//       {/* Main Controls */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card title="Global State" className="border-t-4 border-t-red-600">
//           <div className="flex gap-4 flex-wrap">
//             {!gameState.is_active ? (
//                 <Button className="flex-1 bg-green-600 hover:bg-green-700 py-4 text-lg" onClick={() => handleAction('START')}>
//                     <Play size={20} /> START GAME
//                 </Button>
//             ) : (
//                 <>
//                     {gameState.is_paused ? (
//                         <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700" onClick={() => handleAction('RESUME')}>
//                             <Play size={18} /> RESUME
//                         </Button>
//                     ) : (
//                         <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700" onClick={() => handleAction('PAUSE')}>
//                             <Pause size={18} /> PAUSE
//                         </Button>
//                     )}
//                     <Button variant="danger" className="flex-1" onClick={() => handleAction('STOP')}>
//                         <Square size={18} /> STOP GAME
//                     </Button>
//                 </>
//             )}
//           </div>
          
//           <div className="mt-6 p-4 bg-zinc-900 rounded text-center">
//               <span className="text-zinc-500 uppercase text-xs font-bold">Current Status</span>
//               <div className={`text-2xl font-black mt-1 ${
//                   gameState.is_active 
//                     ? (gameState.is_paused ? 'text-yellow-500' : 'text-green-500') 
//                     : 'text-red-600'
//               }`}>
//                   {gameState.is_active 
//                     ? (gameState.is_paused ? 'PAUSED' : 'LIVE') 
//                     : 'NOT LIVE'}
//               </div>
//               <p className="text-zinc-400 mt-2 text-sm">System is currently on Week {gameState.current_week || 1}</p>
//           </div>
//         </Card>

//         <Card title="Week Management" className="border-t-4 border-t-blue-600">
//             <form onSubmit={handleWeekUpdate} className="flex gap-4 items-end">
//                 <Input 
//                     label="Target Week Number" 
//                     type="number" 
//                     min="1"
//                     value={weekConfig.week_number}
//                     onChange={handleTargetWeekChange}
//                 />
//                 <Button type="submit" variant="danger" className="mb-4">
//                     <RefreshCw size={18} /> Set Week
//                 </Button>
//             </form>
//             <p className="text-xs text-red-500 mt-2">
//                 Warning: Changing week resets ALL team weekly points and deactivates ALL active powers and tasks.
//             </p>
//         </Card>
//       </div>

//       {/* Configuration */}
//       <Card title="Rule Configuration">
//           <form onSubmit={handleConfigUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <Input 
//                   label="Target Week Config" 
//                   type="number"
//                   min="1"
//                   value={weekConfig.week_number}
//                   onChange={handleTargetWeekChange}
//                   required
//               />
//               <Input 
//                   label="Weekly Point Cap" 
//                   type="number"
//                   value={weekConfig.weekly_cap}
//                   onChange={e => setWeekConfig({...weekConfig, weekly_cap: e.target.value})}
//                   required
//               />
//               <Input 
//                   label="Curse Power Value" 
//                   type="number"
//                   value={weekConfig.curse_power}
//                   onChange={e => setWeekConfig({...weekConfig, curse_power: e.target.value})}
//                   required
//               />
//               <Input 
//                   label="Shield Power Value" 
//                   type="number"
//                   value={weekConfig.shield_power}
//                   onChange={e => setWeekConfig({...weekConfig, shield_power: e.target.value})}
//                   required
//               />
//               <div className="md:col-span-3">
//                   <Button type="submit" className="w-full">
//                       <Save size={18} /> Save Weekly Configuration
//                   </Button>
//               </div>
//           </form>
//       </Card>
//     </div>
//   );
// };

// export default GameControl;


import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Loader } from '../../components/ui/Components';
import { Play, Pause, Square, RefreshCw, Save, AlertTriangle, Lock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const GameControl = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const isSuperAdmin = user?.email === 'uzumakiaditya433@gmail.com';
  
  const [gameState, setGameState] = useState({
    is_active: false,
    is_paused: false,
    current_week: 1,
    registration_open: false
  });

  const [allConfigs, setAllConfigs] = useState([]);
  const [weekConfig, setWeekConfig] = useState({
    week_number: 1,
    weekly_cap: 30,
    curse_power: 50,
    shield_power: 100
  });

  const fetchData = async () => {
    try {
      const [stateRes, configRes] = await Promise.all([
        api.get('/game/status'),
        api.get('/week-config/all')
      ]);
      
      const stateData = stateRes.data;
      const configData = configRes.data;

      setGameState(stateData);
      setAllConfigs(configData);
      
      const currentWk = stateData.current_week || 1;
      const matchingConfig = configData.find(c => c.week_number === currentWk);
      
      if (matchingConfig) {
        setWeekConfig({
          week_number: matchingConfig.week_number,
          weekly_cap: matchingConfig.weekly_cap,
          curse_power: matchingConfig.curse_power,
          shield_power: matchingConfig.shield_power
        });
      } else {
        setWeekConfig(prev => ({ ...prev, week_number: currentWk }));
      }
    } catch (error) {
      addToast("Failed to fetch game state or configurations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (action) => {
    try {
      if (action === 'STOP' && !window.confirm("Are you sure? This ends the game and determines the winner.")) return;
      
      const endpoint = `/game/${action.toLowerCase()}`;
      const res = await api.post(endpoint);
      
      addToast(res.data.message || `Game ${action} executed successfully`, "success");
      if(res.data.winner) {
        addToast(`WINNER: ${res.data.winner}`, "success");
      }
      
      await fetchData(); 
    } catch (error) {
      addToast(error.response?.data?.error || `Failed to ${action}`, "error");
    }
  };

  const handleWeekUpdate = async (e) => {
    e.preventDefault();
    if(window.confirm("Changing the week resets all weekly points and deactivates powers. Proceed?")) {
        try {
          const res = await api.put('/admin/week/set', { week_number: Number(weekConfig.week_number) });
          addToast(res.data.message, "success");
          await fetchData();
        } catch (error) {
          addToast(error.response?.data?.error || "Failed to update week", "error");
        }
    }
  };

  const handleConfigUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/week-config/set', {
        week_number: Number(weekConfig.week_number),
        curse_power: Number(weekConfig.curse_power),
        shield_power: Number(weekConfig.shield_power),
        weekly_cap: Number(weekConfig.weekly_cap)
      });
      addToast(res.data.message || "Weekly configuration saved", "success");
      await fetchData(); 
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to save configuration", "error");
    }
  };

  const handleTargetWeekChange = (e) => {
    const selectedWeek = Number(e.target.value);
    const matchingConfig = allConfigs.find(c => c.week_number === selectedWeek);
    
    if (matchingConfig) {
      setWeekConfig({
        week_number: selectedWeek,
        weekly_cap: matchingConfig.weekly_cap,
        curse_power: matchingConfig.curse_power,
        shield_power: matchingConfig.shield_power
      });
    } else {
      setWeekConfig(prev => ({ ...prev, week_number: selectedWeek }));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Game Protocol Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Global State" className="border-t-4 border-t-red-600 relative overflow-hidden">
          {!isSuperAdmin ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-zinc-500">
              <Lock size={32} className="mb-2 text-zinc-600" />
              <p className="text-sm font-bold">SUPER ADMIN REQUIRED</p>
              <p className="text-xs text-zinc-600 mt-1">You do not have clearance to alter global game states.</p>
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {!gameState.is_active ? (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 py-4 text-lg" onClick={() => handleAction('START')}>
                      <Play size={20} /> START GAME
                  </Button>
              ) : (
                  <>
                      {gameState.is_paused ? (
                          <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700" onClick={() => handleAction('RESUME')}>
                              <Play size={18} /> RESUME
                          </Button>
                      ) : (
                          <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700" onClick={() => handleAction('PAUSE')}>
                              <Pause size={18} /> PAUSE
                          </Button>
                      )}
                      <Button variant="danger" className="flex-1" onClick={() => handleAction('STOP')}>
                          <Square size={18} /> STOP GAME
                      </Button>
                  </>
              )}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-zinc-900 rounded text-center border border-zinc-800">
              <span className="text-zinc-500 uppercase text-xs font-bold">Current Status</span>
              <div className={`text-2xl font-black mt-1 ${
                  gameState.is_active 
                    ? (gameState.is_paused ? 'text-yellow-500' : 'text-green-500') 
                    : 'text-red-600'
              }`}>
                  {gameState.is_active 
                    ? (gameState.is_paused ? 'PAUSED' : 'LIVE') 
                    : 'NOT LIVE'}
              </div>
              <p className="text-zinc-400 mt-2 text-sm">System is currently on Week {gameState.current_week || 1}</p>
          </div>
        </Card>

        <Card title="Week Management" className="border-t-4 border-t-blue-600">
            <form onSubmit={handleWeekUpdate} className="flex gap-4 items-end">
                <Input 
                    label="Target Week Number" 
                    type="number" 
                    min="1"
                    value={weekConfig.week_number}
                    onChange={handleTargetWeekChange}
                />
                <Button type="submit" variant="danger" className="mb-4">
                    <RefreshCw size={18} /> Set Week
                </Button>
            </form>
            <p className="text-xs text-red-500 mt-2">
                Warning: Changing week resets ALL team weekly points and deactivates ALL active powers and tasks.
            </p>
        </Card>
      </div>

      <Card title="Rule Configuration">
          <form onSubmit={handleConfigUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input 
                  label="Target Week Config" 
                  type="number"
                  min="1"
                  value={weekConfig.week_number}
                  onChange={handleTargetWeekChange}
                  required
              />
              <Input 
                  label="Weekly Point Cap" 
                  type="number"
                  value={weekConfig.weekly_cap}
                  onChange={e => setWeekConfig({...weekConfig, weekly_cap: e.target.value})}
                  required
              />
              <Input 
                  label="Curse Power Value" 
                  type="number"
                  value={weekConfig.curse_power}
                  onChange={e => setWeekConfig({...weekConfig, curse_power: e.target.value})}
                  required
              />
              <Input 
                  label="Shield Power Value" 
                  type="number"
                  value={weekConfig.shield_power}
                  onChange={e => setWeekConfig({...weekConfig, shield_power: e.target.value})}
                  required
              />
              <div className="md:col-span-3">
                  <Button type="submit" className="w-full">
                      <Save size={18} /> Save Weekly Configuration
                  </Button>
              </div>
          </form>
      </Card>
    </div>
  );
};

export default GameControl;