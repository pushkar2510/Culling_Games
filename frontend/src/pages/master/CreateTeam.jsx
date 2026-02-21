import React, { useState } from 'react';
import { Card, Input, Button } from '../../components/ui/Components';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const CreateTeam = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    team_name: '',
    leader_name: '',
    leader_email: '',
    leader_password: '',
    members: [{ name: '', email: '' }, { name: '', email: '' }, { name: '', email: '' }, { name: '', email: '' }]
  });

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...form.members];
    newMembers[index][field] = value;
    setForm({ ...form, members: newMembers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean up members array to ensure no empty objects are sent if not fully filled out
    const validMembers = form.members.filter(m => m.name.trim() !== '' && m.email.trim() !== '');

    try {
      // Real API Call to Backend
      const res = await api.post('/admin/create-team', {
        team_name: form.team_name,
        leader_name: form.leader_name,
        leader_email: form.leader_email,
        leader_password: form.leader_password,
        members: validMembers
      });

      addToast(res.data.message || `Team "${form.team_name}" created successfully.`, "success");
      
      // Reset form
      setForm({
        team_name: '',
        leader_name: '',
        leader_email: '',
        leader_password: '',
        members: [{ name: '', email: '' }, { name: '', email: '' }, { name: '', email: '' }, { name: '', email: '' }]
      });
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to create team", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Register New Team</h1>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Team Name" 
              value={form.team_name}
              onChange={e => setForm({...form, team_name: e.target.value})}
              required
            />
            <div className="hidden md:block"></div> {/* Spacer */}
            
            <Input 
              label="Leader Name" 
              value={form.leader_name}
              onChange={e => setForm({...form, leader_name: e.target.value})}
              required
            />
            <Input 
              label="Leader Email" 
              type="email"
              value={form.leader_email}
              onChange={e => setForm({...form, leader_email: e.target.value})}
              required
            />
            <Input 
              label="Leader Password" 
              type="password"
              value={form.leader_password}
              onChange={e => setForm({...form, leader_password: e.target.value})}
              required
            />
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <h3 className="text-white font-bold mb-4">Team Members (Required: 4)</h3>
            <div className="space-y-4">
              {form.members.map((member, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder={`Member ${index + 2} Name`}
                    value={member.name}
                    onChange={e => handleMemberChange(index, 'name', e.target.value)}
                    required
                  />
                  <Input 
                    placeholder={`Member ${index + 2} Email`}
                    type="email"
                    value={member.email}
                    onChange={e => handleMemberChange(index, 'email', e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Create Team'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateTeam;