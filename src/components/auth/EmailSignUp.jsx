import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sendOTP } from '../../config/emailjs';

const STEPS = { EMAIL: 'email', OTP: 'otp', PASSWORD: 'password' };

export default function EmailSignUp() {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  /* ── Step 1: Send OTP ───────────────────────────── */
  async function handleSendOTP(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.includes('@')) return setError('Enter a valid email.');
    setBusy(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('nr_otp', code);
      sessionStorage.setItem('nr_otp_email', email);
      await sendOTP(email, code, name);
      setStep(STEPS.OTP);
      startResendTimer();
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function startResendTimer() {
    setResendTimer(60);
    const t = setInterval(() => {
      setResendTimer((v) => {
        if (v <= 1) { clearInterval(t); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('nr_otp', code);
    try {
      await sendOTP(email, code, name);
      startResendTimer();
      setError('');
    } catch {
      setError('Failed to resend OTP.');
    }
  }

  /* ── Step 2: Verify OTP ─────────────────────────── */
  function handleVerifyOTP(e) {
    e.preventDefault();
    setError('');
    const saved = sessionStorage.getItem('nr_otp');
    if (otp === saved) {
      sessionStorage.removeItem('nr_otp');
      setStep(STEPS.PASSWORD);
    } else {
      setError('Incorrect OTP. Please try again.');
    }
  }

  /* ── Step 3: Set Password & Create Account ───────── */
  async function handleCreateAccount(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPw) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await signUpWithEmail(name, email, password);
      navigate('/events', { replace: true });
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in.');
      } else {
        setError(err.message || 'Account creation failed.');
      }
    } finally {
      setBusy(false);
    }
  }

  /* ── Google instant sign-up ─────────────────────── */
  async function handleGoogle() {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/events', { replace: true });
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-email-form">
      {/* Google button always visible */}
      <button className="btn-google" onClick={handleGoogle} disabled={busy} type="button">
        <i className="fab fa-google"></i>
        Continue with Google
      </button>

      <div className="auth-divider"><span>or sign up with email</span></div>

      {/* ── Step 1: Name + Email ── */}
      {step === STEPS.EMAIL && (
        <form onSubmit={handleSendOTP} className="auth-form-inner">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="yourname@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary w-full" disabled={busy} type="submit">
            {busy ? 'Sending OTP…' : 'Send Verification OTP'}
          </button>
        </form>
      )}

      {/* ── Step 2: OTP ── */}
      {step === STEPS.OTP && (
        <form onSubmit={handleVerifyOTP} className="auth-form-inner">
          <p className="auth-subtitle">OTP sent to <strong>{email}</strong></p>
          <div className="otp-input-row">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary w-full" disabled={busy} type="submit">
            Verify OTP
          </button>
          <button
            type="button"
            className="btn-link"
            onClick={handleResend}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </button>
          <button type="button" className="btn-link" onClick={() => setStep(STEPS.EMAIL)}>
            ← Change email
          </button>
        </form>
      )}

      {/* ── Step 3: Set Password ── */}
      {step === STEPS.PASSWORD && (
        <form onSubmit={handleCreateAccount} className="auth-form-inner">
          <p className="auth-subtitle success-text">✓ Email verified! Set your password.</p>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary w-full" disabled={busy} type="submit">
            {busy ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>
      )}
    </div>
  );
}
