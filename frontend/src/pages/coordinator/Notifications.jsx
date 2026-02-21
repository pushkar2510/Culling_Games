import React, { useState } from 'react';
import { Card, Input, Button } from '../../components/ui/Components';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import { Bell } from 'lucide-react';

const Notifications = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/notifications/create', {
        title: form.title,
        message: form.message,
        type: 'GENERAL'
      });
      addToast("Broadcast sent successfully", "success");
      setForm({ title: '', message: '' });
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to send broadcast", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">System Broadcast</h1>
      <Card>
        <p className="text-zinc-400 text-sm mb-6 border-b border-zinc-800 pb-4">
          Send general announcements to all teams. (Only the Game Master can send Alerts or Bonus Task notifications).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Title" 
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            required
          />
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Message</label>
            <textarea 
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white h-32 focus:border-blue-500 focus:outline-none"
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              required
            ></textarea>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
            <Bell size={18} /> {isSubmitting ? 'Broadcasting...' : 'Publish Broadcast'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Notifications;