import React, { useState, useEffect } from 'react';
import { Card, Loader } from '../../components/ui/Components';
import { User, Users } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Coordinators = () => {
  const { addToast } = useToast();
  const [coords, setCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        const res = await api.get('/admin/coordinators');
        setCoords(res.data);
      } catch (error) {
        addToast("Failed to fetch coordinators", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCoordinators();
  }, [addToast]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Coordinator Oversight</h1>
      
      {coords.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded">
          No coordinators found in the system.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coords.map(c => (
              <Card key={c.coordinator_id} className="border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center">
                          <User size={20} />
                      </div>
                      <div>
                          <h3 className="font-bold text-white text-lg">{c.name}</h3>
                          <p className="text-zinc-500 text-sm">{c.email}</p>
                      </div>
                  </div>
                  
                  <h4 className="text-zinc-400 text-xs uppercase font-bold mb-3 flex items-center gap-2">
                      <Users size={12} /> Assigned Teams ({c.assigned_teams.length})
                  </h4>
                  <div className="space-y-2">
                      {c.assigned_teams.length === 0 && <p className="text-xs text-zinc-600 italic">No teams assigned yet.</p>}
                      {c.assigned_teams.map((t, i) => (
                          <div key={i} className="flex justify-between bg-zinc-900 p-2 rounded px-4">
                              <span className="text-zinc-300">{t.team_name}</span>
                              <span className="text-zinc-600 text-sm">{t.total_points} pts</span>
                          </div>
                      ))}
                  </div>
              </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coordinators;