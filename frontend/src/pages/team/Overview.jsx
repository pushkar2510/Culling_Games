// import React, { useState, useEffect } from 'react';
// import { Card, Loader } from '../../components/ui/Components';
// import { Trophy, Activity, AlertTriangle, Lock } from 'lucide-react';
// import api from '../../utils/api';
// import { useToast } from '../../context/ToastContext';

// const Overview = () => {
//   const { addToast } = useToast();
//   const [loading, setLoading] = useState(true);
  
//   const [data, setData] = useState({
//     team: null,
//     game: null,
//     config: null,
//     rank: '-'
//   });

//   useEffect(() => {
//     const fetchOverviewData = async () => {
//       try {
//         const [teamRes, gameRes, configRes, leadRes] = await Promise.all([
//           api.get('/team/me'),
//           api.get('/game/status'),
//           api.get('/week-config/all'),
//           api.get('/team/leaderboard')
//         ]);

//         const teamData = teamRes.data;
//         const gameData = gameRes.data;
//         const currentWk = gameData.current_week || 1;
        
//         // Find current week's cap
//         const weekConfig = configRes.data.find(c => c.week_number === currentWk) || { weekly_cap: 300 };
        
//         // Calculate rank from leaderboard
//         const myRank = leadRes.data.find(t => t.team_name === teamData.team_name)?.rank || '-';

//         setData({
//           team: teamData,
//           game: gameData,
//           config: weekConfig,
//           rank: myRank
//         });
//       } catch (error) {
//         addToast("Failed to load command center data", "error");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOverviewData();
//   }, [addToast]);

//   if (loading) return <Loader />;
//   if (!data.team) return <div className="text-white p-8">Team data not found.</div>;

//   const { team, game, config, rank } = data;
//   const capPercentage = (team.weekly_points / config.weekly_cap) * 100;

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex flex-col md:flex-row justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-white mb-2">Mission Overview</h1>
//           <p className="text-zinc-500">Welcome back, {team.team_name}</p>
//         </div>
        
//         {/* Game State Banner */}
//         <div className={`px-4 py-3 rounded border flex items-center gap-3 ${
//           team.is_disqualified ? 'bg-red-900/20 border-red-600 text-red-500' :
//           game.is_paused ? 'bg-yellow-900/20 border-yellow-600 text-yellow-500' :
//           !game.is_active ? 'bg-zinc-800 border-zinc-700 text-zinc-400' :
//           'bg-green-900/20 border-green-600 text-green-500'
//         }`}>
//           {team.is_disqualified ? <AlertTriangle size={20} /> :
//            game.is_paused ? <Lock size={20} /> :
//            <Activity size={20} />}
//           <div className="font-mono font-bold">
//             {team.is_disqualified ? 'DISQUALIFIED' :
//              game.is_paused ? 'GAME PAUSED' :
//              !game.is_active ? 'GAME INACTIVE' :
//              `WEEK ${game.current_week} ACTIVE`}
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card className="relative overflow-hidden">
//           <div className="absolute top-0 right-0 p-4 opacity-10">
//             <Trophy size={64} className="text-white" />
//           </div>
//           <p className="text-zinc-500 text-sm mb-1">Total Points</p>
//           <h2 className="text-4xl font-bold text-white">{team.total_points}</h2>
//           <div className="mt-4 text-xs text-zinc-400">Global Rank: <span className="text-white font-bold">#{rank}</span></div>
//         </Card>

//         <Card>
//           <div className="flex justify-between items-end mb-2">
//             <div>
//               <p className="text-zinc-500 text-sm mb-1">Weekly Progress</p>
//               <h2 className="text-4xl font-bold text-white">{team.weekly_points} <span className="text-lg text-zinc-600">/ {config.weekly_cap}</span></h2>
//             </div>
//             {team.weekly_cap_reached && (
//               <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold">CAP REACHED</span>
//             )}
//           </div>
//           <div className="w-full bg-zinc-900 h-2 rounded-full mt-4 overflow-hidden">
//             <div 
//               className="bg-red-600 h-full transition-all duration-1000" 
//               style={{ width: `${Math.min(capPercentage, 100)}%` }}
//             ></div>
//           </div>
//         </Card>

//         <Card>
//           <p className="text-zinc-500 text-sm mb-1">Status</p>
//           <h2 className={`text-2xl font-bold ${team.is_disqualified ? 'text-red-500' : 'text-green-500'}`}>
//             {team.is_disqualified ? 'TERMINATED' : 'OPERATIONAL'}
//           </h2>
//           <p className="text-xs text-zinc-500 mt-2">
//             Registration: {game.registration_open ? 'OPEN' : 'CLOSED'}
//           </p>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Overview;



import React, { useState, useEffect } from 'react';
import { Card, Loader } from '../../components/ui/Components';
import { Trophy, Activity, AlertTriangle, Lock } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const Overview = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState({
    team: null,
    game: null,
    config: null,
    rank: '-'
  });

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [teamRes, gameRes, configRes, leadRes] = await Promise.all([
          api.get('/team/me'),
          api.get('/game/status'),
          api.get('/week-config/all'),
          api.get('/team/leaderboard')
        ]);

        const teamData = teamRes.data;
        const gameData = gameRes.data;
        const currentWk = gameData.current_week || 1;
        
        const weekConfig = configRes.data.find(c => c.week_number === currentWk) || { weekly_cap: 300 };
        const myRank = leadRes.data.find(t => t.team_id === teamData.team_id || t.team_name === teamData.team_name)?.rank || '-';

        setData({
          team: teamData,
          game: gameData,
          config: weekConfig,
          rank: myRank
        });
      } catch (error) {
        addToast("Failed to load command center data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, []);

  if (loading) return <Loader />;
  if (!data.team) return <div className="text-white p-8">Team data not found.</div>;

  const { team, game, config, rank } = data;
  const capPercentage = (team.weekly_points / config.weekly_cap) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mission Overview</h1>
          {/* TEAM ID HIGHLIGHTED HERE */}
          <p className="text-zinc-500 text-lg">
            Team ID: <span className="font-mono text-red-500 font-bold">#{team.team_id || team.id}</span> | {team.team_name}
          </p>
        </div>
        
        <div className={`px-4 py-3 rounded border flex items-center gap-3 ${
          team.is_disqualified ? 'bg-red-900/20 border-red-600 text-red-500' :
          game.is_paused ? 'bg-yellow-900/20 border-yellow-600 text-yellow-500' :
          !game.is_active ? 'bg-zinc-800 border-zinc-700 text-zinc-400' :
          'bg-green-900/20 border-green-600 text-green-500'
        }`}>
          {team.is_disqualified ? <AlertTriangle size={20} /> :
           game.is_paused ? <Lock size={20} /> :
           <Activity size={20} />}
          <div className="font-mono font-bold">
            {team.is_disqualified ? 'DISQUALIFIED' :
             game.is_paused ? 'GAME PAUSED' :
             !game.is_active ? 'GAME INACTIVE' :
             `WEEK ${game.current_week} ACTIVE`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={64} className="text-white" />
          </div>
          <p className="text-zinc-500 text-sm mb-1">Total Points</p>
          <h2 className="text-4xl font-bold text-white">{team.total_points}</h2>
          <div className="mt-4 text-xs text-zinc-400">Global Rank: <span className="text-white font-bold">#{rank}</span></div>
        </Card>

        <Card>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-zinc-500 text-sm mb-1">Weekly Progress</p>
              <h2 className="text-4xl font-bold text-white">{team.weekly_points} <span className="text-lg text-zinc-600">/ {config.weekly_cap}</span></h2>
            </div>
            {team.weekly_cap_reached && (
              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold">CAP REACHED</span>
            )}
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-red-600 h-full transition-all duration-1000" 
              style={{ width: `${Math.min(capPercentage, 100)}%` }}
            ></div>
          </div>
        </Card>

        <Card>
          <p className="text-zinc-500 text-sm mb-1">Status</p>
          <h2 className={`text-2xl font-bold ${team.is_disqualified ? 'text-red-500' : 'text-green-500'}`}>
            {team.is_disqualified ? 'TERMINATED' : 'OPERATIONAL'}
          </h2>
          <p className="text-xs text-zinc-500 mt-2">
            Registration: {game.registration_open ? 'OPEN' : 'CLOSED'}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Overview;