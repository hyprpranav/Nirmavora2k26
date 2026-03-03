import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/command-center.css';

export default function CoordinatorAuth() {
  const { user, profile, emailVerified, signInWithGoogle, signInWithEmail, requestOrganiserRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* Request access form */
  const [reason, setReason] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  /* If already authenticated and authorised, redirect */
  if (user && emailVerified && profile) {
    if (profile.role === 'admin' || profile.role === 'organiser') {
      /* Use setTimeout to avoid render-time navigate */
      setTimeout(() => navigate('/coordinator/panel'), 0);
      return null;
    }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      /* AuthContext will update profile, re-render will redirect if authorised */
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRequestAccess(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    try {
      await requestOrganiserRole(reason);
      setRequestSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  /* ─── Signed in but NOT a coordinator yet ─── */
  if (user && emailVerified && profile && profile.role === 'participant') {
    return (
      <div className="cc-auth-page">
        <div className="cc-auth-container">
          {requestSent ? (
            <div className="cc-pending-msg">
              <div className="cc-pending-icon">⏳</div>
              <h3>Request Submitted</h3>
              <p>Your coordinator access request has been sent to the admin. You'll be notified once approved.</p>
              <button className="cc-btn secondary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          ) : (
            <>
              <h2>Request Coordinator Access</h2>
              <p>You're signed in as <strong>{user.email}</strong> but you don't have coordinator privileges yet.</p>
              <form onSubmit={handleRequestAccess}>
                <div className="cc-form-group" style={{ textAlign: 'left' }}>
                  <label>Why do you need coordinator access?</label>
                  <textarea
                    className="cc-textarea"
                    rows={3}
                    placeholder="e.g. I'm a member of the organizing committee…"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                  />
                </div>
                <button className="cc-btn primary" type="submit" style={{ width: '100%' }}>
                  Submit Request
                </button>
              </form>
              {error && <p className="cc-msg error" style={{ marginTop: 10 }}>{error}</p>}
              <button className="cc-btn secondary" style={{ marginTop: 14, width: '100%' }} onClick={() => navigate('/')}>
                Back to Home
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ─── Not signed in ─── */
  return (
    <div className="cc-auth-page">
      <div className="cc-auth-container">
        <h2>Coordinator Sign In</h2>
        <p>Sign in with your coordinator credentials to access the Command Center.</p>

        <form onSubmit={handleSignIn}>
          <div className="cc-form-group" style={{ textAlign: 'left' }}>
            <label>Email</label>
            <input
              type="email"
              className="cc-input"
              placeholder="coordinator@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="cc-form-group" style={{ textAlign: 'left' }}>
            <label>Password</label>
            <input
              type="password"
              className="cc-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="cc-btn primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {error && <p className="cc-msg error" style={{ marginTop: 10 }}>{error}</p>}

        <div className="cc-auth-divider">or</div>

        <button className="cc-google-btn" onClick={handleGoogle}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
