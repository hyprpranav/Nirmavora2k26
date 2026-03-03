import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/command-center.css';

export default function OrganiserAuth() {
  const { user, profile, loading, signInWithEmail, signUpAsOrganiser, signOut } = useAuth();
  const navigate = useNavigate();

  // Sign-in form state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siError, setSiError] = useState('');
  const [siBusy, setSiBusy] = useState(false);

  // Request form state
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPassword, setReqPassword] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqError, setReqError] = useState('');
  const [reqSuccess, setReqSuccess] = useState(false);
  const [reqBusy, setReqBusy] = useState(false);

  const [activeForm, setActiveForm] = useState('signin'); // 'signin' | 'request'

  // Redirect approved organisers / admins automatically
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'organiser' || profile.role === 'admin') {
        navigate('/organiser/panel', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  async function handleSignIn(e) {
    e.preventDefault();
    setSiError('');
    setSiBusy(true);
    try {
      await signInWithEmail(siEmail, siPassword);
      // useEffect above handles redirect for organiser/admin
      // If role is participant (pending), the pending screen is shown below
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setSiError('Invalid email or password.');
      } else if (code === 'auth/too-many-requests') {
        setSiError('Too many attempts. Try again later.');
      } else {
        setSiError('Sign-in failed. Please try again.');
      }
    } finally {
      setSiBusy(false);
    }
  }

  async function handleRequest(e) {
    e.preventDefault();
    setReqError('');
    setReqBusy(true);
    try {
      await signUpAsOrganiser(reqName, reqEmail, reqPassword, reqReason);
      setReqSuccess(true);
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') {
        setReqError('This email is already registered. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setReqError('Password must be at least 6 characters.');
      } else {
        setReqError(err.message || 'Failed to submit request. Please try again.');
      }
    } finally {
      setReqBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="cc-fullpage cc-auth-page">
        <div className="cc-loader">Loading…</div>
      </div>
    );
  }

  // ── PENDING SCREEN: signed in but not yet approved ──────────────────────────
  if (user && profile && profile.role !== 'organiser' && profile.role !== 'admin') {
    return (
      <div className="cc-fullpage cc-auth-page">
        <div className="cc-auth-container cc-pending-container">
          <div className="cc-auth-logo">
            <span className="cc-logo-text">NIRMAVORA</span>
            <span className="cc-logo-year">FEST 2026</span>
          </div>
          <div className="cc-pending-icon">⏳</div>
          <h2 className="cc-pending-title">Request Pending Approval</h2>
          <p className="cc-pending-desc">
            Your coordinator request has been submitted. The admin will review and approve your
            account shortly.
          </p>
          <div className="cc-pending-contact">
            <p className="cc-contact-label">Need to follow up? Contact the admin:</p>
            <a href="mailto:harishspranav2006@gmail.com" className="cc-contact-link">
              harishspranav2006@gmail.com
            </a>
            <a href="tel:+917845693765" className="cc-contact-link">
              +91 78456 93765
            </a>
          </div>
          <button
            className="cc-btn-secondary"
            style={{ marginTop: '24px' }}
            onClick={async () => { await signOut(); }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ── AUTH SCREEN: not signed in (or reqSuccess state) ────────────────────────
  return (
    <div className="cc-fullpage cc-auth-page">
      <div className="cc-auth-container">
        {/* Header */}
        <div className="cc-auth-logo">
          <span className="cc-logo-text">NIRMAVORA</span>
          <span className="cc-logo-year">FEST 2026</span>
        </div>
        <h2 className="cc-auth-title">Coordinator Access</h2>

        {/* Tab switcher */}
        <div className="cc-auth-tabs">
          <button
            className={`cc-auth-tab${activeForm === 'signin' ? ' active' : ''}`}
            onClick={() => setActiveForm('signin')}
          >
            Sign In
          </button>
          <button
            className={`cc-auth-tab${activeForm === 'request' ? ' active' : ''}`}
            onClick={() => { setActiveForm('request'); setReqSuccess(false); }}
          >
            Submit Request
          </button>
        </div>

        {/* ── SIGN IN FORM ── */}
        {activeForm === 'signin' && (
          <form className="cc-auth-form" onSubmit={handleSignIn}>
            <p className="cc-form-subtitle">Sign in with your approved coordinator account.</p>
            <div className="cc-form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="coordinator@example.com"
                value={siEmail}
                onChange={(e) => setSiEmail(e.target.value)}
                required
              />
            </div>
            <div className="cc-form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={siPassword}
                onChange={(e) => setSiPassword(e.target.value)}
                required
              />
            </div>
            {siError && <p className="cc-form-error">{siError}</p>}
            <button className="cc-btn-primary" type="submit" disabled={siBusy}>
              {siBusy ? 'Signing in…' : 'Sign In'}
            </button>
            <p className="cc-form-switch">
              New coordinator?{' '}
              <button
                type="button"
                className="cc-btn-link"
                onClick={() => setActiveForm('request')}
              >
                Submit a request
              </button>
            </p>
          </form>
        )}

        {/* ── SUBMIT REQUEST FORM ── */}
        {activeForm === 'request' && (
          <>
            {reqSuccess ? (
              <div className="cc-request-success">
                <div className="cc-success-icon">✅</div>
                <h3>Request Submitted!</h3>
                <p>
                  Your coordinator request has been sent. You'll be notified once the admin
                  approves your account.
                </p>
                <p className="cc-contact-label">Questions? Contact the admin:</p>
                <a href="mailto:harishspranav2006@gmail.com" className="cc-contact-link">
                  harishspranav2006@gmail.com
                </a>
                <a href="tel:+917845693765" className="cc-contact-link">
                  +91 78456 93765
                </a>
                <button
                  className="cc-btn-secondary"
                  style={{ marginTop: '16px' }}
                  onClick={() => { setActiveForm('signin'); setReqSuccess(false); }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form className="cc-auth-form" onSubmit={handleRequest}>
                <p className="cc-form-subtitle">
                  Submit a request to become a coordinator. The admin will review and approve your
                  account.
                </p>
                <div className="cc-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    required
                  />
                </div>
                <div className="cc-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="cc-form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={reqPassword}
                    onChange={(e) => setReqPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="cc-form-group">
                  <label>Reason for Request</label>
                  <textarea
                    placeholder="Briefly explain why you should be a coordinator…"
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                {reqError && <p className="cc-form-error">{reqError}</p>}
                <button className="cc-btn-primary" type="submit" disabled={reqBusy}>
                  {reqBusy ? 'Submitting…' : 'Submit Request'}
                </button>
                <p className="cc-form-switch">
                  Already approved?{' '}
                  <button
                    type="button"
                    className="cc-btn-link"
                    onClick={() => setActiveForm('signin')}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
