import React, { useState } from 'react';
import { Card, Input, Button } from '../../components/ui/Components';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const CreateAdmin = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'COORDINATOR' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Real API Call to Backend
      const res = await api.post('/auth/create-admin', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      
      addToast(res.data.message || `${form.role} created successfully.`, "success");
      setForm({ name: '', email: '', password: '', role: 'COORDINATOR' });
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to create admin", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Create System Admin</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-zinc-400 text-sm mb-1 block">Role</label>
                <select 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-red-600 focus:outline-none"
                    value={form.role}
                    onChange={e => setForm({...form, role: e.target.value})}
                >
                    <option value="COORDINATOR">Coordinator</option>
                    <option value="MASTER">Master Admin</option>
                </select>
            </div>
            <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            
            <Button type="submit" className="w-full mt-4 bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Grant Access'}
            </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateAdmin;