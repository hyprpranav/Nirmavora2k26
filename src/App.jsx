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
import OrganiserDashboard from './components/dashboard/organiser/OrganiserDashboard';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';

function ProtectedRoute({ children, requireOtp = true }) {
  const { user, loading, otpVerified } = useAuth();
  if (loading) return <div className="loader">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (requireOtp && !otpVerified) return <Navigate to="/auth?step=otp" replace />;
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

          {/* Organiser */}
          <Route
            path="/organiser"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['organiser', 'admin']}>
                  <OrganiserDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
