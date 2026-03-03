import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import EventSelect from './pages/EventSelect';
import RegisterPage from './pages/RegisterPage';
import QRPublic from './pages/QRPublic';
import ParticipantDashboard from './components/dashboard/participant/ParticipantDashboard';
import AdminPanel from './pages/AdminPanel';
import CoordinatorPanel from './pages/CoordinatorPanel';
import OrganiserAuth from './pages/OrganiserAuth';
import FeedbackFloat from './components/FeedbackFloat';

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

function CoordinatorRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="loader">Loading…</div>;
  if (!user) return <Navigate to="/organiser" replace />;
  if (!profile || !['organiser', 'admin'].includes(profile.role)) return <Navigate to="/organiser" replace />;
  return children;
}

export default function App() {
  return (
    <>
    <FeedbackFloat />
    <Routes>
      {/* ═══ Command Center — full-page, NO Navbar/Footer ═══ */}
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
      <Route path="/organiser" element={<OrganiserAuth />} />
      <Route
        path="/organiser/panel"
        element={
          <CoordinatorRoute>
            <CoordinatorPanel />
          </CoordinatorRoute>
        }
      />

      {/* ═══ Main site — Navbar + Footer via MainLayout ═══ */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/qr/:teamId" element={<QRPublic />} />
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
      </Route>
    </Routes>
    </>
  );
}
