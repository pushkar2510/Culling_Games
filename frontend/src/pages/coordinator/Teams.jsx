// import React, { useState, useEffect } from 'react';
// import { Card, Loader } from '../../components/ui/Components';
// import { Shield, AlertCircle } from 'lucide-react';
// import { useToast } from '../../context/ToastContext';
// import api from '../../utils/api';

// const Teams = () => {
//   const { addToast } = useToast();
//   const [teams, setTeams] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAssignedTeams = async () => {
//       try {
//         const res = await api.get('/admin/coordinator-dashboard');
//         setTeams(res.data);
//       } catch (error) {
//         addToast("Failed to fetch assigned teams", "error");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAssignedTeams();
//   }, [addToast]);

//   if (loading) return <Loader />;

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <h1 className="text-3xl font-bold text-white mb-6">Assigned Teams</h1>
      
//       {teams.length === 0 ? (
//         <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded">
//           No teams have been assigned to your oversight yet.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4">
//           {teams.map(team => (
//             <Card key={team.team_id} className={`flex flex-col md:flex-row justify-between items-center gap-4 ${team.is_disqualified ? 'opacity-75 border-red-900/50' : ''}`}>
//               <div className="flex items-center gap-4 flex-1">
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
//                   team.is_disqualified ? 'bg-red-900/20 text-red-500' : 'bg-blue-600 text-white'
//                 }`}>
//                   {team.team_name.charAt(0)}
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                     {team.team_name}
//                     {team.is_disqualified && <span className="text-xs bg-red-600 px-2 py-1 rounded text-white flex items-center gap-1"><AlertCircle size={12}/> DQ</span>}
//                   </h3>
//                   <p className="text-zinc-500 text-sm">Leader: {team.leader.name} | Members: {team.members?.length || 0}</p>
//                 </div>
//               </div>

//               <div className="flex gap-8 text-center">
//                 <div>
//                   <p className="text-zinc-500 text-xs uppercase">Total Points</p>
//                   <p className="text-xl font-bold text-white">{team.total_points}</p>
//                 </div>
//                 <div>
//                   <p className="text-zinc-500 text-xs uppercase">Weekly Points</p>
//                   <p className="text-xl font-bold text-blue-500">{team.weekly_points}</p>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Teams;



import React, { useState, useEffect } from 'react';
import { Card, Loader } from '../../components/ui/Components';
import { Shield, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Teams = () => {
  const { addToast } = useToast();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedTeams = async () => {
      try {
        const res = await api.get('/admin/coordinator-dashboard');
        setTeams(res.data);
      } catch (error) {
        addToast("Failed to fetch assigned teams", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedTeams();
  }, [addToast]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Assigned Teams</h1>
      
      {teams.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded">
          No teams have been assigned to your oversight yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {teams.map(team => (
            <Card key={team.team_id} className={`flex flex-col md:flex-row justify-between items-center gap-4 ${team.is_disqualified ? 'opacity-75 border-red-900/50' : ''}`}>
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                  team.is_disqualified ? 'bg-red-900/20 text-red-500' : 'bg-blue-600 text-white'
                }`}>
                  {team.team_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {/* HIGHLIGHTED TEAM ID FOR COORDINATOR */}
                    <span className="text-blue-500 font-mono">#{team.team_id}</span> 
                    {team.team_name}
                    {team.is_disqualified && <span className="text-xs bg-red-600 px-2 py-1 rounded text-white flex items-center gap-1"><AlertCircle size={12}/> DQ</span>}
                  </h3>
                  <p className="text-zinc-500 text-sm">Leader: {team.leader.name} | Members: {team.members?.length || 0}</p>
                </div>
              </div>

              <div className="flex gap-8 text-center shrink-0 mt-4 md:mt-0">
                <div>
                  <p className="text-zinc-500 text-xs uppercase">Total Points</p>
                  <p className="text-xl font-bold text-white">{team.total_points}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase">Weekly Points</p>
                  <p className="text-xl font-bold text-blue-500">{team.weekly_points}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;