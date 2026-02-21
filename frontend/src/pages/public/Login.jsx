import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Card, Input, Button } from '../../components/ui/Components';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEAM'); 
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Call context login (backend decides true role now, not the UI tab)
      await login(email, password);
    } catch (err) {
      // The error toast is handled in AuthContext, we just need to catch here to stop the spinner
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10 animate-fade-in relative">
        <div className="text-center mb-8">
           <Link to="/" className="inline-block">
             <div className="flex items-center gap-2 justify-center mb-6">
                <Shield className="text-red-600 w-10 h-10" />
                <span className="text-2xl font-black tracking-tighter text-white">CULLING<span className="text-red-600">GAMES</span></span>
             </div>
           </Link>
        </div>
        
        <Card className="border-red-900/30 backdrop-blur-sm bg-zinc-950/90">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Identify Yourself</h2>
            <p className="text-zinc-500 text-sm">Select your clearance level to proceed.</p>
          </div>

          {/* Role Selector Tabs (Cosmetic now, as backend verifies actual role) */}
          <div className="grid grid-cols-3 gap-2 mb-6 bg-zinc-900 p-1 rounded-lg">
            {['TEAM', 'COORDINATOR', 'MASTER'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 text-xs font-bold rounded transition-all cursor-pointer ${
                  role === r 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSubmit}>
            <Input 
              label={role === 'MASTER' ? "Admin ID" : "Email / Team ID"}
              type="text" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder={role === 'MASTER' ? "admin@system" : "team@culling.com"}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : `Login as ${role}`}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-zinc-900 text-center">
              <p className="text-zinc-600 text-sm">
               Don't have a team? <Link to="/register" className="text-red-500 hover:text-red-400 font-medium">Register Here</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;