import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../components/ui/Components';
import { Zap, Shield, Lock, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Powers = () => {
  const { addToast } = useToast();
  const [myPowers, setMyPowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetId, setTargetId] = useState({}); 
  const [currentWeek, setCurrentWeek] = useState(1);
  
  const [isEligible, setIsEligible] = useState(false);
  const [teamRank, setTeamRank] = useState(999);

  const fetchPowers = async () => {
    try {
      const [powersRes, teamRes, leadRes, subsRes] = await Promise.all([
        api.get('/powers/my'),
        api.get('/team/me'),
        api.get('/team/leaderboard'),
        api.get('/submissions/my') // No longer need to fetch active tasks!
      ]);
      
      setMyPowers(powersRes.data);
      const myTeam = teamRes.data;
      setCurrentWeek(myTeam.week_number);

      // 1. Check Rank
      const rankData = leadRes.data.find(t => t.team_id === myTeam.team_id);
      const currentRank = rankData ? rankData.rank : 999;
      setTeamRank(currentRank);

      // 2. BULLETPROOF Bonus Check using backend flag
      const hasCompletedBonus = subsRes.data.some(s => 
        s.status === 'APPROVED' && s.is_bonus === true
      );

      // 3. Set Final Eligibility
      if (currentRank <= 10 || hasCompletedBonus) {
        setIsEligible(true);
      } else {
        setIsEligible(false);
      }

    } catch (error) {
      addToast("Failed to fetch arsenal", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPowers();
  }, []);

  const handleRequest = async (type) => {
    try {
      await api.post('/powers/request', { power_type: type });
      addToast(`${type} requested successfully. Awaiting Master approval.`, "success");
      fetchPowers();
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to request power", "error");
    }
  };

  const handleUsePower = async (powerId) => {
    const target_team_id = Number(targetId[powerId]);
    if (!target_team_id) {
      addToast("Enter a valid Target Team ID", "error");
      return;
    }

    try {
      const res = await api.post('/powers/use', { 
        power_id: powerId, 
        target_team_id: target_team_id 
      });
      addToast(res.data.message || "Power activated.", "success");
      fetchPowers(); 
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to deploy power", "error");
    }
  };

  if (loading) return <Loader />;

  const hasPowerThisWeek = myPowers.some(p => p.week_number === currentWeek);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Arsenal</h1>
        <p className="text-zinc-500">Acquire and deploy special abilities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Card */}
        <Card title="Acquisition Channel">
          <p className="text-zinc-400 text-sm mb-4">
            Powers can be requested if your team is in the Top 10 OR completed a Bonus Task. <span className="text-yellow-500 font-bold">Limit: 1 Power per week.</span>
          </p>

          {!isEligible ? (
            <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-lg text-center">
              <Lock size={24} className="mx-auto mb-2 text-red-500" />
              <p className="text-red-500 font-bold">ACCESS DENIED</p>
              <p className="text-red-400/70 text-sm mt-1">Your team is currently Rank #{teamRank}. You must break into the Top 10 or complete a Bonus Task to unlock powers.</p>
            </div>
          ) : hasPowerThisWeek ? (
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
              <AlertTriangle size={24} className="mx-auto mb-2 text-zinc-500" />
              <p className="text-white font-bold">Limit Reached</p>
              <p className="text-zinc-500 text-sm">You have already requested or acquired a power for Week {currentWeek}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button 
                variant="danger" 
                className="w-full justify-between" 
                onClick={() => handleRequest("CURSE")}
              >
                <span className="flex items-center gap-2"><Zap size={18} /> Request CURSE</span>
                <span className="opacity-50 text-xs font-mono">ATTACK</span>
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-between bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => handleRequest("SHIELD")}
              >
                <span className="flex items-center gap-2"><Shield size={18} /> Request SHIELD</span>
                <span className="opacity-50 text-xs font-mono">DEFENSE</span>
              </Button>
            </div>
          )}
        </Card>

        {/* Active Inventory Card */}
        <Card title="Active Inventory">
          {myPowers.filter(p => p.is_active).length === 0 ? (
            <div className="text-center text-zinc-600 py-8 border border-dashed border-zinc-800 rounded">
              Empty Arsenal
            </div>
          ) : (
            <div className="space-y-4">
              {myPowers.filter(p => p.is_active).map(power => (
                <div key={power.power_id} className="bg-zinc-900 p-4 rounded border border-zinc-800">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 font-bold text-white">
                      {power.power_type === 'CURSE' ? <Zap className="text-red-500" size={18} /> : <Shield className="text-blue-500" size={18} />}
                      {power.power_type} <span className="text-zinc-500 text-xs">({power.power_value} pts)</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">W{power.week_number}</span>
                  </div>
                  
                  {power.power_type === 'CURSE' && (
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        placeholder="Target Team ID"
                        className="bg-black border border-zinc-700 text-white text-sm rounded p-2 flex-1 focus:border-red-500 focus:outline-none"
                        onChange={(e) => setTargetId({...targetId, [power.power_id]: e.target.value})}
                      />
                      <Button size="sm" variant="danger" className="py-1 px-4 text-xs font-bold tracking-wider" onClick={() => handleUsePower(power.power_id)}>
                        FIRE
                      </Button>
                    </div>
                  )}
                  {power.power_type === 'SHIELD' && (
                    <div className="text-xs text-blue-400 bg-blue-900/10 p-2 rounded flex items-center gap-2">
                      <Shield size={14} /> Auto-deploys on next attack.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Powers;