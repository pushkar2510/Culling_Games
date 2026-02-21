import React, { useState } from 'react';
import { Card, Input, Button } from '../../components/ui/Components';
import { useToast } from '../../context/ToastContext';
import { PlusCircle, Star, Clock } from 'lucide-react';
import api from '../../utils/api';

const ManageTasks = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    points: 100,
    is_bonus: false,
    is_one_time: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/tasks/create', {
        name: form.name,
        category: form.category,
        description: form.description,
        points: Number(form.points),
        is_bonus: form.is_bonus,
        is_one_time: form.is_one_time
      });
      addToast(`Task "${form.name}" created successfully.`, "success");
      setForm({ name: '', category: '', description: '', points: 100, is_bonus: false, is_one_time: false });
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to create task", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Create Game Tasks</h1>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Task Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              required 
            />
            <Input 
              label="Category (e.g. CODING, CIPHER)" 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm font-medium mb-1 block">Description</label>
            <textarea 
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white h-32 focus:outline-none focus:border-red-600"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            ></textarea>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center p-4 bg-zinc-900 rounded border border-zinc-800">
            <div className="flex-1 w-full">
              <Input 
                label="Points Awarded" 
                type="number" 
                value={form.points} 
                onChange={e => setForm({...form, points: e.target.value})} 
                required 
              />
            </div>
            
            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 border rounded flex items-center justify-center ${form.is_bonus ? 'bg-yellow-500 border-yellow-500' : 'border-zinc-600'}`}>
                  {form.is_bonus && <Star size={12} className="text-black" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={form.is_bonus} 
                  onChange={e => setForm({...form, is_bonus: e.target.checked})} 
                />
                <span className={`text-sm font-bold ${form.is_bonus ? 'text-yellow-500' : 'text-zinc-400'}`}>Bonus Task</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 border rounded flex items-center justify-center ${form.is_one_time ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'}`}>
                  {form.is_one_time && <Clock size={12} className="text-black" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={form.is_one_time} 
                  onChange={e => setForm({...form, is_one_time: e.target.checked})} 
                />
                <span className={`text-sm font-bold ${form.is_one_time ? 'text-blue-500' : 'text-zinc-400'}`}>One-Time</span>
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
            <PlusCircle size={18} /> {isSubmitting ? 'Deploying...' : 'Deploy Task'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ManageTasks;