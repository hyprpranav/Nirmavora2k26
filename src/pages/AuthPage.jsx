import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignIn from '../components/auth/GoogleSignIn';
import OTPVerify from '../components/auth/OTPVerify';
import '../styles/auth.css';

export default function AuthPage() {
  const { user, otpVerified, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const step = searchParams.get('step');

  useEffect(() => {
    if (!loading && user && otpVerified) {
      navigate('/events', { replace: true });
    }
  }, [user, otpVerified, loading, navigate]);

  if (loading) return <div className="loader">Loading…</div>;

  /* Already signed in but needs OTP */
  if (user && !otpVerified) {
    return (
      <section className="auth-page">
        <div className="auth-container">
          <h2>Verify Your Email</h2>
          <p className="auth-subtitle">An OTP has been sent to <strong>{user.email}</strong></p>
          <OTPVerify />
        </div>
      </section>
    );
  }

  /* Not signed in */
  return (
    <section className="auth-page">
      <div className="auth-container">
        <h2>Welcome to NIRMAVORA FEST 2026</h2>
        <p className="auth-subtitle">Sign in to register or access your dashboard</p>
        <GoogleSignIn />
      </div>
    </section>
  );
}
