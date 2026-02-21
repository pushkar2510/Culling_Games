import React, { useState, useEffect } from 'react';
import { Loader } from '../../components/ui/Components';
import { Bell, Info, AlertCircle, Star } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Notifications = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/all');
        setNotifications(res.data);
      } catch (error) {
        addToast("Failed to fetch system broadcasts", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const filtered = activeTab === 'ALL' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const getIcon = (type) => {
    switch(type) {
      case 'ALERT': return <AlertCircle className="text-red-500" />;
      case 'BONUS_TASK': return <Star className="text-yellow-500" />;
      case 'GUIDE': return <Info className="text-blue-500" />;
      default: return <Bell className="text-zinc-500" />;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">System Broadcasts</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-4 overflow-x-auto">
        {['ALL', 'GENERAL', 'BONUS_TASK', 'GUIDE', 'ALERT'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === tab ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white bg-zinc-900'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(n => (
          <div key={n.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex gap-4 hover:border-zinc-700 transition-colors">
            <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
            <div>
              <h3 className="font-bold text-white">{n.title}</h3>
              <p className="text-zinc-400 text-sm mt-1">{n.message}</p>
              <p className="text-zinc-600 text-xs mt-2">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-zinc-500 text-center py-12 border border-dashed border-zinc-800 rounded">
            No broadcasts found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;