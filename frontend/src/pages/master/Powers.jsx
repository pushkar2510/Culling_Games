import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../components/ui/Components';
import { Zap, Shield, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Powers = () => {
  const { addToast } = useToast();
  const [powers, setPowers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPowers = async () => {
    try {
      const res = await api.get('/admin/pending-powers');
      setPowers(res.data);
    } catch (error) {
      addToast("Failed to fetch power requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPowers();
  }, []);

  const handleApprove = async (id, type) => {
    try {
      await api.put(`/powers/approve/${id}`);
      addToast(`${type} Approved for deployment.`, "success");
      setPowers(prev => prev.filter(p => p.power_id !== id));
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to approve power", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Power Requests</h1>
      
      {powers.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded">No pending power requests.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {powers.map(power => (
            <Card key={power.power_id} className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`p-3 rounded-full ${power.power_type === 'CURSE' ? 'bg-red-900/20 text-red-500' : 'bg-blue-900/20 text-blue-500'}`}>
                    {power.power_type === 'CURSE' ? <Zap size={24} /> : <Shield size={24} />}
                </div>
                <div>
                    <h3 className="font-bold text-white">{power.power_type} REQUEST</h3>
                    <p className="text-zinc-500 text-sm">Team: <span className="text-zinc-300">{power.team_name}</span></p>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 w-full md:w-auto" onClick={() => handleApprove(power.power_id, power.power_type)}>
                <Check size={18} /> Approve Power
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Powers;