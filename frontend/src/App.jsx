import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyles from './components/shared/GlobalStyles';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Layouts
import TeamLayout from './layouts/TeamLayout';
import CoordinatorLayout from './layouts/CoordinatorLayout';
import MasterLayout from './layouts/MasterLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Leaderboard from './pages/public/Leaderboard';

// Team Pages
import TeamOverview from './pages/team/Overview';
import Tasks from './pages/team/Tasks';
import Submit from './pages/team/Submit';
import Submissions from './pages/team/Submissions';
import Powers from './pages/team/Powers';
import TeamQueries from './pages/team/Queries';
import TeamNotifications from './pages/team/Notifications';
import Profile from './pages/team/Profile';

// Coordinator Pages
import CoordOverview from './pages/coordinator/Overview';
import CoordTeams from './pages/coordinator/Teams';
import CoordPending from './pages/coordinator/Pending';
import CoordVerified from './pages/coordinator/Verified';
import CoordCreateTeam from './pages/coordinator/CreateTeam';
import CoordQueries from './pages/coordinator/Queries';
import CoordNotifications from './pages/coordinator/Notifications';

// Master Pages
import MasterOverview from './pages/master/Overview';
import MasterGameControl from './pages/master/GameControl';
import MasterTeams from './pages/master/Teams';
import MasterSubmissions from './pages/master/Submissions';
import MasterTeamDetail from './pages/master/TeamDetail';
import MasterPowers from './pages/master/Powers';
import MasterCoordinators from './pages/master/Coordinators';
import MasterCreateAdmin from './pages/master/CreateAdmin';
import MasterAdjustPoints from './pages/master/AdjustPoints';
import MasterCreateTeam from './pages/master/CreateTeam';
import MasterManageTasks from './pages/master/ManageTasks'; // NEW
import MasterNotifications from './pages/master/Notifications'; // NEW

const App = () => {
  return (
    <>
      <GlobalStyles />
      <Router>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Team Routes */}
              <Route path="/team" element={<TeamLayout />}>
                <Route path="dashboard" element={<TeamOverview />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="submit" element={<Submit />} />
                <Route path="my-submissions" element={<Submissions />} />
                <Route path="powers" element={<Powers />} />
                <Route path="queries" element={<TeamQueries />} />
                <Route path="notifications" element={<TeamNotifications />} />
                <Route path="profile" element={<Profile />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Coordinator Routes */}
              <Route path="/coordinator" element={<CoordinatorLayout />}>
                <Route path="dashboard" element={<CoordOverview />} />
                <Route path="teams" element={<CoordTeams />} />
                <Route path="pending" element={<CoordPending />} />
                <Route path="verified" element={<CoordVerified />} />
                <Route path="create-team" element={<CoordCreateTeam />} />
                <Route path="queries" element={<CoordQueries />} />
                <Route path="notifications" element={<CoordNotifications />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Master Routes */}
              <Route path="/master" element={<MasterLayout />}>
                <Route path="dashboard" element={<MasterOverview />} />
                <Route path="game-control" element={<MasterGameControl />} />
                <Route path="teams" element={<MasterTeams />} />
                <Route path="create-team" element={<MasterCreateTeam />} />
                <Route path="manage-tasks" element={<MasterManageTasks />} /> {/* NEW ROUTE */}
                <Route path="notifications" element={<MasterNotifications />} /> {/* NEW ROUTE */}
                <Route path="team/:id" element={<MasterTeamDetail />} />
                <Route path="submissions" element={<MasterSubmissions />} />
                <Route path="powers" element={<MasterPowers />} />
                <Route path="coordinators" element={<MasterCoordinators />} />
                <Route path="create-admin" element={<MasterCreateAdmin />} />
                <Route path="adjust-points" element={<MasterAdjustPoints />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </>
  );
};

export default App;