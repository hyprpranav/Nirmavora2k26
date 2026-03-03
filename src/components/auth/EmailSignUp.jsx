import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function EmailSignUp() {
  const { signInWithGoogle, signUpWithEmail, resendVerificationEmail, user, emailVerified, refreshEmailVerified } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  /* Create account → sends Firebase verification email automatically */
  async function handleCreateAccount(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.includes('@')) return setError('Enter a valid email.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPw) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await signUpWithEmail(name, email, password);
      setAccountCreated(true);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 8 characters.');
      } else {
        setError(err.message || 'Account creation failed.');
      }
    } finally {
      setBusy(false);
    }
  }

  /* Resend verification email */
  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await resendVerificationEmail();
      setResendCooldown(60);
      const t = setInterval(() => {
        setResendCooldown((v) => {
          if (v <= 1) { clearInterval(t); return 0; }
          return v - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to resend. Please wait a moment and try again.');
    }
  }

  /* Check if user has verified their email */
  async function handleCheckVerified() {
    setBusy(true);
    const verified = await refreshEmailVerified();
    if (!verified) {
      setError('Email not verified yet. Please check your inbox and click the verification link.');
    }
    setBusy(false);
  }

  /* Google instant sign-up */
  async function handleGoogle() {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      // Redirect will happen — page reloads
    } catch (err) {
      console.error('[SignUp] Google error:', err.code, err.message);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase. Add your Vercel domain to Firebase → Auth → Settings → Authorized domains.');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
      setBusy(false);
    }
  }

  /* After account created — show verification message */
  if (accountCreated || (user && !emailVerified)) {
    return (
      <div className="auth-email-form">
        <div className="auth-form-inner" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📧</div>
          <h3 style={{ color: 'var(--primary-gold)', marginBottom: '8px' }}>Verify Your Email</h3>
          <p style={{ color: 'var(--light-gray)', marginBottom: '16px' }}>
            We sent a verification link to <strong>{user?.email || email}</strong>.
            <br />Click the link in the email, then come back and press the button below.
          </p>
          <div style={{ background: 'rgba(245, 179, 1, 0.08)', border: '1px solid rgba(245, 179, 1, 0.25)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.82rem', color: '#F5B301', textAlign: 'left' }}>
            <strong>📂 Check your Spam / Junk folder</strong> — Gmail sometimes routes our verification email there.
            Look for an email from <em>noreply@nirmavora-1aab8.firebaseapp.com</em> and mark it as "Not Spam".
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary w-full" onClick={handleCheckVerified} disabled={busy} style={{ marginBottom: '10px' }}>
            {busy ? 'Checking…' : "I've Verified — Continue"}
          </button>
          <button
            type="button"
            className="btn-link"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-email-form">
      {/* Google button always visible */}
      <button className="btn-google" onClick={handleGoogle} disabled={busy} type="button">
        <i className="fab fa-google"></i>
        Continue with Google
      </button>

      <div className="auth-divider"><span>or sign up with email</span></div>

      <form onSubmit={handleCreateAccount} className="auth-form-inner">
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
        <div className="form-group">
          <label>Password</label>
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
    </div>
  );
}
