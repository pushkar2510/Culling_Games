import React, { useState, useEffect } from 'react';
import { Card, Loader } from '../../components/ui/Components';
import { Users, User, Trophy } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Overview = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_teams: 0,
    total_players: 0,
    total_coordinators: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (error) {
        addToast("Failed to fetch dashboard stats", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Coordinator Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-900/20 rounded-lg text-blue-500">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Total Teams</p>
              <h2 className="text-3xl font-bold text-white">{stats.total_teams}</h2>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-900/20 rounded-lg text-green-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Active Players</p>
              <h2 className="text-3xl font-bold text-white">{stats.total_players}</h2>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-900/20 rounded-lg text-purple-500">
              <User size={24} />
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Coordinators</p>
              <h2 className="text-3xl font-bold text-white">{stats.total_coordinators}</h2>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
           <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800 text-zinc-400 text-sm">
             Select an action from the sidebar to manage teams or verify submissions.
           </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;