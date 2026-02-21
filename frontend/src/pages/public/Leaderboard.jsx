// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Trophy } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { Loader } from '../../components/ui/Components';
// import { useToast } from '../../context/ToastContext';
// import api from '../../utils/api';

// const Leaderboard = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth(); 
//   const { addToast } = useToast();

//   const [teams, setTeams] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       try {
//         const res = await api.get('/team/leaderboard');
//         setTeams(res.data);
//       } catch (error) {
//         addToast("Failed to fetch live leaderboard data", "error");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLeaderboard();
//   }, [addToast]);

//   const handleBack = () => {
//     // Navigates to whatever page they came from (Landing Page or Dashboard)
//     navigate(-1); 
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="min-h-screen bg-black text-white p-6 md:p-12">
//       <button onClick={handleBack} className="flex items-center gap-2 mb-8 text-zinc-500 hover:text-white transition-colors cursor-pointer">
//         <ArrowLeft size={20} /> Back
//       </button>
      
//       <div className="max-w-4xl mx-auto animate-fade-in">
//         <h1 className="text-4xl md:text-5xl font-black text-center mb-12 text-red-600 tracking-tighter flex items-center justify-center gap-4">
//           <Trophy size={40} className="text-yellow-500" /> GLOBAL LEADERBOARD
//         </h1>
        
//         <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl shadow-red-900/10">
//           <div className="grid grid-cols-12 bg-zinc-950 p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
//             <div className="col-span-2 text-center">Rank</div>
//             <div className="col-span-7">Team Name</div>
//             <div className="col-span-3 text-center">Total Points</div>
//           </div>
          
//           {teams.length === 0 ? (
//             <div className="p-12 text-center text-zinc-500 italic border-t border-zinc-800">
//               No active teams on the board yet.
//             </div>
//           ) : (
//             teams.map((team, index) => (
//               <div key={team.rank} className={`grid grid-cols-12 p-4 items-center border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${index === 0 ? 'bg-yellow-900/5' : ''}`}>
//                 <div className="col-span-2 text-center font-mono font-bold text-lg text-zinc-500 flex justify-center">
//                   {index === 0 ? <span className="text-2xl" title="1st Place">🥇</span> : 
//                    index === 1 ? <span className="text-xl" title="2nd Place">🥈</span> : 
//                    index === 2 ? <span className="text-xl" title="3rd Place">🥉</span> : 
//                    `#${team.rank}`}
//                 </div>
//                 <div className={`col-span-7 font-bold text-lg ${index === 0 ? 'text-yellow-500' : 'text-zinc-200'}`}>
//                   {team.team_name}
//                 </div>
//                 <div className="col-span-3 text-center font-bold text-red-500 text-xl font-mono">
//                   {team.total_points}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Leaderboard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/ui/Components';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Leaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const { addToast } = useToast();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/team/leaderboard');
        setTeams(res.data);
      } catch (error) {
        addToast("Failed to fetch live leaderboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [addToast]);

  const handleBack = () => {
    navigate(-1); 
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <button onClick={handleBack} className="flex items-center gap-2 mb-8 text-zinc-500 hover:text-white transition-colors cursor-pointer">
        <ArrowLeft size={20} /> Back
      </button>
      
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-12 text-red-600 tracking-tighter flex items-center justify-center gap-4">
          <Trophy size={40} className="text-yellow-500" /> GLOBAL LEADERBOARD
        </h1>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl shadow-red-900/10">
          {/* UPDATED GRID COLUMNS TO INCLUDE TEAM ID */}
          <div className="grid grid-cols-12 bg-zinc-950 p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-2 text-center">Team ID</div>
            <div className="col-span-5">Team Name</div>
            <div className="col-span-3 text-center">Total Points</div>
          </div>
          
          {teams.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 italic border-t border-zinc-800">
              No active teams on the board yet.
            </div>
          ) : (
            teams.map((team, index) => (
              <div key={team.rank} className={`grid grid-cols-12 p-4 items-center border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${index === 0 ? 'bg-yellow-900/5' : ''}`}>
                <div className="col-span-2 text-center font-mono font-bold text-lg text-zinc-500 flex justify-center">
                  {index === 0 ? <span className="text-2xl" title="1st Place">🥇</span> : 
                   index === 1 ? <span className="text-xl" title="2nd Place">🥈</span> : 
                   index === 2 ? <span className="text-xl" title="3rd Place">🥉</span> : 
                   `#${team.rank}`}
                </div>
                {/* NEW TEAM ID COLUMN */}
                <div className="col-span-2 text-center font-mono font-bold text-red-500">
                  #{team.team_id}
                </div>
                <div className={`col-span-5 font-bold text-lg truncate ${index === 0 ? 'text-yellow-500' : 'text-zinc-200'}`}>
                  {team.team_name}
                </div>
                <div className="col-span-3 text-center font-bold text-white text-xl font-mono">
                  {team.total_points}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;