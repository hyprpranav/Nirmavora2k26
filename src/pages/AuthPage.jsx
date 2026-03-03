import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmailSignUp from '../components/auth/EmailSignUp';
import EmailSignIn from '../components/auth/EmailSignIn';
import '../styles/auth.css';

export default function AuthPage() {
  const { user, emailVerified, loading } = useAuth();
  const [tab, setTab] = useState('signin');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && emailVerified) {
      navigate('/events', { replace: true });
    }
  }, [user, emailVerified, loading, navigate]);

  if (loading) return <div className="loader">Loading…</div>;

  return (
    <section className="auth-page">
      <div className="auth-container">
        {/* Logo / Title */}
        <div className="auth-logo">
          <span className="auth-logo-text">NIRMAVORA</span>
          <span className="auth-logo-year">FEST 2026</span>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'signin' ? ' active' : ''}`}
            onClick={() => setTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Tab content */}
        {tab === 'signin' ? (
          <>
            <p className="auth-subtitle">Welcome back! Sign in to your account.</p>
            <EmailSignIn />
            <p className="auth-switch">
              Don't have an account?{' '}
              <button className="btn-link" onClick={() => setTab('signup')}>Sign Up</button>
            </p>
          </>
        ) : (
          <>
            <p className="auth-subtitle">Create your account to register for the fest.</p>
            <EmailSignUp />
            <p className="auth-switch">
              Already have an account?{' '}
              <button className="btn-link" onClick={() => setTab('signin')}>Sign In</button>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
