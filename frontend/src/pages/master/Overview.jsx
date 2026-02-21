import React, { useState, useEffect } from 'react';
import { Card, Loader } from '../../components/ui/Components';
import { Users, User, Trophy, FileText, Zap, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const Overview = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [stats, setStats] = useState({
    total_teams: 0,
    total_coordinators: 0,
    total_masters: 0,
    total_players: 0,
    total_submissions: 0,
    pending_submissions: 0,
    active_powers: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, gameRes] = await Promise.all([
          api.get('/admin/master-dashboard'),
          api.get('/game/status')
        ]);
        setStats(dashRes.data);
        setCurrentWeek(gameRes.data.current_week || 1);
      } catch (error) {
        addToast("Failed to fetch platform overview.", "error");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [addToast]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Platform Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center py-6 border-zinc-800">
          <Users className="mx-auto text-blue-500 mb-2" size={24} />
          <h3 className="text-3xl font-bold text-white">{stats.total_teams}</h3>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Teams</p>
        </Card>
        <Card className="text-center py-6 border-zinc-800">
          <FileText className="mx-auto text-yellow-500 mb-2" size={24} />
          <h3 className="text-3xl font-bold text-white">{stats.pending_submissions}</h3>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Pending</p>
        </Card>
        <Card className="text-center py-6 border-zinc-800">
          <Zap className="mx-auto text-red-500 mb-2" size={24} />
          <h3 className="text-3xl font-bold text-white">{stats.active_powers}</h3>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Active Powers</p>
        </Card>
        <Card className="text-center py-6 border-zinc-800">
          <Trophy className="mx-auto text-green-500 mb-2" size={24} />
          <h3 className="text-3xl font-bold text-white">W{currentWeek}</h3>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Current Week</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="System Health">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-800">
              <span className="text-zinc-400">Database Connection</span>
              <span className="text-green-500 font-bold text-sm">HEALTHY</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-800">
              <span className="text-zinc-400">Total Players</span>
              <span className="text-white font-bold text-sm">{stats.total_players}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-800">
              <span className="text-zinc-400">Total Coordinators</span>
              <span className="text-white font-bold text-sm">{stats.total_coordinators}</span>
            </div>
          </div>
        </Card>

        <Card title="Recent Alerts">
          <div className="space-y-3">
             <p className="text-zinc-500 text-sm text-center py-4">Live websocket alerts will appear here.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;