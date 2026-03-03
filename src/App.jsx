import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import EventSelect from './pages/EventSelect';
import RegisterPage from './pages/RegisterPage';
import QRPublic from './pages/QRPublic';
import ParticipantDashboard from './components/dashboard/participant/ParticipantDashboard';
import AdminPanel from './pages/AdminPanel';
import CoordinatorPanel from './pages/CoordinatorPanel';
import CoordinatorAuth from './pages/CoordinatorAuth';

function ProtectedRoute({ children }) {
  const { user, loading, emailVerified } = useAuth();
  if (loading) return <div className="loader">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!emailVerified) return <Navigate to="/auth?verify=1" replace />;
  return children;
}

function RoleRoute({ children, roles }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="loader">Loading…</div>;
  if (!profile || !roles.includes(profile.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* ═══ Command Center – Full-page, NO Navbar/Footer ═══ */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['admin']}>
              <AdminPanel />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route path="/coordinator" element={<CoordinatorAuth />} />
      <Route
        path="/coordinator/panel"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['organiser', 'admin']}>
              <CoordinatorPanel />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* ═══ Main site with Navbar/Footer ═══ */}
      <Route
        path="*"
        element={
          <div className="app">
            <Navbar />
            <main>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/qr/:teamId" element={<QRPublic />} />

                {/* Protected – Participant */}
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventSelect />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/register/:eventType"
                  element={
                    <ProtectedRoute>
                      <RegisterPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ParticipantDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}
