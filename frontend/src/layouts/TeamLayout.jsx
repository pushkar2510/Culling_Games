import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Shield, Menu, X, LogOut, Home, FileText, Upload, CheckCircle, 
  Zap, Trophy, Bell, MessageSquare, User, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeamLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/team/dashboard', icon: Home, label: 'Overview' },
    { to: '/team/tasks', icon: FileText, label: 'Active Tasks' },
    { to: '/team/submit', icon: Upload, label: 'Submit Task' },
    { to: '/team/my-submissions', icon: CheckCircle, label: 'My Submissions' },
    { to: '/team/powers', icon: Zap, label: 'Powers' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/team/notifications', icon: Bell, label: 'Notifications' },
    { to: '/team/queries', icon: MessageSquare, label: 'Queries' },
    { to: '/team/profile', icon: User, label: 'Team Profile' },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col h-full`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900 shrink-0">
          <div className="flex items-center">
            <Shield className="text-red-600 mr-2" />
            <span className="text-lg font-bold tracking-wider text-white">TEAM<span className="text-red-600">PANEL</span></span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <div className="px-4 py-2 mb-4">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Command Center</p>
          </div>
          {links.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                location.pathname === link.to 
                  ? 'bg-red-600/10 text-red-500 border-r-2 border-red-600' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <link.icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-900 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center text-red-500 font-bold shrink-0">
              T
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Team Leader</p>
              <p className="text-xs text-zinc-500 truncate">{user?.user_id}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors px-2 py-2 rounded hover:bg-zinc-900"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-16 bg-zinc-950/50 backdrop-blur border-b border-zinc-900 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-zinc-400 hover:text-white p-2">
            <Menu />
          </button>
          <div className="flex-1 px-4"></div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SYSTEM ONLINE
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-black w-full">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamLayout;