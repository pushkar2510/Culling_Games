import React, { useState } from 'react';
import { Card, Input, Button } from '../../components/ui/Components';
import { useToast } from '../../context/ToastContext';
import { Bell, AlertTriangle, Star, BookOpen, Mic } from 'lucide-react';
import api from '../../utils/api';

const MasterNotifications = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'GENERAL' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const endpoint = form.type === 'GENERAL' 
      ? '/notifications/create' 
      : '/notifications/create-master';

    try {
      await api.post(endpoint, {
        title: form.title,
        message: form.message,
        type: form.type
      });
      addToast(`Broadcast (${form.type}) sent successfully`, "success");
      setForm({ title: '', message: '', type: 'GENERAL' });
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to send broadcast", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Global Announcements</h1>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-zinc-400 text-sm font-medium mb-2 block">Notification Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'GENERAL', icon: Mic, label: 'General' },
                { id: 'ALERT', icon: AlertTriangle, label: 'Alert' },
                { id: 'BONUS_TASK', icon: Star, label: 'Bonus' },
                { id: 'GUIDE', icon: BookOpen, label: 'Guide' }
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setForm({...form, type: type.id})}
                  className={`flex flex-col items-center justify-center p-4 rounded border transition-all cursor-pointer ${
                    form.type === type.id
                      ? 'bg-red-900/30 border-red-500 text-red-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                  }`}
                >
                  <type.icon size={24} className="mb-2" />
                  <span className="text-xs font-bold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Input 
            label="Title" 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})} 
            required 
          />
          
          <div>
            <label className="text-zinc-400 text-sm font-medium mb-1 block">Message Content</label>
            <textarea 
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white h-32 focus:outline-none focus:border-red-600"
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              required
            ></textarea>
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
            <Bell size={18} /> {isSubmitting ? 'Broadcasting...' : 'Publish Broadcast'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default MasterNotifications;