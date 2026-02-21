// import React, { useState } from 'react';
// import { Outlet, Link, useLocation } from 'react-router-dom';
// import { 
//   Shield, Menu, X, LogOut, Activity, Users, FileText, 
//   Zap, Settings, AlertTriangle, UserPlus, PlayCircle, Plus, Bell
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// const MasterLayout = () => {
//   const { user, logout } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const location = useLocation();

//   const links = [
//     { to: '/master/dashboard', icon: Activity, label: 'Platform Overview' },
//     { to: '/master/game-control', icon: PlayCircle, label: 'Game Control' },
//     { to: '/master/teams', icon: Users, label: 'Manage Teams' },
//     { to: '/master/create-team', icon: Plus, label: 'Create Team' },
//     { to: '/master/manage-tasks', icon: FileText, label: 'Create Task' }, // UPDATED
//     { to: '/master/notifications', icon: Bell, label: 'Announcements' }, // UPDATED
//     { to: '/master/submissions', icon: FileText, label: 'Approvals' },
//     { to: '/master/powers', icon: Zap, label: 'Power Requests' },
//     { to: '/master/coordinators', icon: Users, label: 'Coordinators' },
//     { to: '/master/create-admin', icon: UserPlus, label: 'Create Admin' },
//     { to: '/master/adjust-points', icon: Settings, label: 'Point Adjust' },
//   ];

//   return (
//     <div className="min-h-screen bg-black text-zinc-200 flex overflow-hidden">
//       {/* Sidebar */}
//       <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-red-900/30 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col h-full`}>
//         <div className="h-16 flex items-center justify-between px-6 border-b border-red-900/30 shrink-0">
//           <div className="flex items-center">
//             <Shield className="text-red-600 mr-2" />
//             <span className="text-lg font-black tracking-wider text-white">MASTER<span className="text-red-600">KEY</span></span>
//           </div>
//           <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
//             <X size={20} />
//           </button>
//         </div>
        
//         <div className="p-4 space-y-1 overflow-y-auto flex-1">
//           <div className="px-4 py-2 mb-4">
//             <p className="text-xs text-red-500 uppercase font-bold tracking-wider">God Mode</p>
//           </div>
//           {links.map((link) => (
//             <Link 
//               key={link.to}
//               to={link.to} 
//               onClick={() => setSidebarOpen(false)}
//               className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
//                 location.pathname === link.to 
//                   ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
//                   : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
//               }`}
//             >
//               <link.icon size={20} />
//               <span className="font-medium">{link.label}</span>
//             </Link>
//           ))}
//         </div>

//         <div className="p-4 border-t border-red-900/30 bg-zinc-950 shrink-0">
//           <div className="flex items-center gap-3 mb-4 px-2">
//             <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shrink-0">
//               M
//             </div>
//             <div className="overflow-hidden">
//               <p className="text-sm font-medium text-white truncate">Game Master</p>
//               <p className="text-xs text-zinc-500 truncate">{user?.user_id}</p>
//             </div>
//           </div>
//           <button 
//             onClick={logout} 
//             className="w-full flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors px-2 py-2 rounded hover:bg-zinc-900"
//           >
//             <LogOut size={18} />
//             <span className="text-sm">Sign Out</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
//         <header className="h-16 bg-zinc-950/50 backdrop-blur border-b border-zinc-900 flex items-center justify-between px-4 lg:px-8 shrink-0">
//           <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-zinc-400 hover:text-white p-2">
//             <Menu />
//           </button>
//           <div className="flex-1 px-4"></div>
//           <div className="flex items-center gap-4">
//             <div className="hidden md:flex items-center gap-2 text-xs font-mono text-red-500 border border-red-900/50 px-3 py-1 rounded-full bg-red-900/10">
//               <AlertTriangle size={12} /> ADMIN ACCESS ACTIVE
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-black w-full">
//           <div className="max-w-7xl mx-auto w-full">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default MasterLayout;

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Shield, Menu, X, LogOut, Activity, Users, FileText, 
  Zap, Settings, AlertTriangle, UserPlus, PlayCircle, Plus, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MasterLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isSuperAdmin = user?.email === 'uzumakiaditya433@gmail.com';

  const links = [
    { to: '/master/dashboard', icon: Activity, label: 'Platform Overview' },
    { to: '/master/game-control', icon: PlayCircle, label: 'Game Control' },
    { to: '/master/teams', icon: Users, label: 'Manage Teams' },
    { to: '/master/create-team', icon: Plus, label: 'Create Team' },
    { to: '/master/manage-tasks', icon: FileText, label: 'Create Task' },
    { to: '/master/notifications', icon: Bell, label: 'Announcements' },
    { to: '/master/submissions', icon: FileText, label: 'Approvals' },
    { to: '/master/powers', icon: Zap, label: 'Power Requests' },
    { to: '/master/coordinators', icon: Users, label: 'Coordinators' },
    { to: '/master/create-admin', icon: UserPlus, label: 'Create Admin' },
  ];

  // Only add Point Adjust if Super Admin
  if (isSuperAdmin) {
    links.push({ to: '/master/adjust-points', icon: Settings, label: 'Point Adjust' });
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-red-900/30 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col h-full`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-red-900/30 shrink-0">
          <div className="flex items-center">
            <Shield className="text-red-600 mr-2" />
            <span className="text-lg font-black tracking-wider text-white">MASTER<span className="text-red-600">KEY</span></span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <div className="px-4 py-2 mb-4">
            <p className="text-xs text-red-500 uppercase font-bold tracking-wider">God Mode</p>
          </div>
          {links.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                location.pathname === link.to 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              <link.icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-red-900/30 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shrink-0">
              M
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {isSuperAdmin ? 'Super Admin' : 'Game Master'}
              </p>
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
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-red-500 border border-red-900/50 px-3 py-1 rounded-full bg-red-900/10">
              <AlertTriangle size={12} /> {isSuperAdmin ? 'SUPER ADMIN ACCESS' : 'ADMIN ACCESS ACTIVE'}
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

export default MasterLayout;