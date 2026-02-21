import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Card, Input, Button } from '../../components/ui/Components';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ teamName: '', email: '', password: '', confirmPass: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(form.password !== form.confirmPass) return alert("Passwords mismatch");
    setIsSubmitting(true);
    try {
      await register(form);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative w-full">
       <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8">
           <Link to="/" className="inline-block">
             <Shield className="text-red-600 w-10 h-10 mx-auto" />
           </Link>
        </div>
        <Card className="backdrop-blur-sm bg-zinc-950/90">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Team Registration</h2>
          <form onSubmit={handleSubmit}>
            <Input 
              label="Team Name" 
              value={form.teamName} 
              onChange={e => setForm({...form, teamName: e.target.value})} 
              required
            />
            <Input 
              label="Email" 
              type="email"
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              required
            />
            <Input 
              label="Password" 
              type="password"
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              required
            />
            <Input 
              label="Confirm Password" 
              type="password"
              value={form.confirmPass} 
              onChange={e => setForm({...form, confirmPass: e.target.value})} 
              required
            />
            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Initialize Team'}
            </Button>
          </form>
          <p className="text-center mt-6 text-zinc-600 text-sm">
            Already registered? <Link to="/login" className="text-red-500 hover:underline">Login</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Register;