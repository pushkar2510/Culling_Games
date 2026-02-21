import React, { useState, useEffect } from 'react';
import { Card, Loader } from '../../components/ui/Components';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const Submissions = () => {
  const { addToast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/submissions/my');
        setSubmissions(res.data);
      } catch (error) {
        addToast("Failed to fetch transmission logs", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span className="flex items-center gap-1 text-green-500 bg-green-900/20 px-2 py-1 rounded text-xs font-bold w-fit"><CheckCircle size={12} /> APPROVED</span>;
      case 'PENDING': return <span className="flex items-center gap-1 text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded text-xs font-bold w-fit"><Clock size={12} /> PENDING</span>;
      case 'VERIFIED': return <span className="flex items-center gap-1 text-blue-500 bg-blue-900/20 px-2 py-1 rounded text-xs font-bold w-fit"><Eye size={12} /> VERIFIED</span>;
      default: return <span className="flex items-center gap-1 text-red-500 bg-red-900/20 px-2 py-1 rounded text-xs font-bold w-fit"><XCircle size={12} /> REJECTED</span>;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Transmission Log</h1>
      
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="p-4">Sub. ID</th>
              <th className="p-4">Task ID</th>
              <th className="p-4">Week</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Points Awarded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {submissions.map(sub => (
              <tr key={sub.id} className="text-zinc-300 hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 font-mono text-zinc-500">#{sub.id}</td>
                <td className="p-4 font-medium text-white">Task {sub.task_id}</td>
                <td className="p-4 text-zinc-500">W{sub.week_number}</td>
                <td className="p-4 text-zinc-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                <td className="p-4">{getStatusBadge(sub.status)}</td>
                <td className="p-4 text-right font-mono font-bold text-white">
                  {sub.status === 'APPROVED' ? `+${sub.points_awarded}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && (
          <div className="p-8 text-center text-zinc-500">No submissions found.</div>
        )}
      </div>
    </div>
  );
};

export default Submissions;