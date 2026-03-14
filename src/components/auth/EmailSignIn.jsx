import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DEVELOPER } from '../../config/constants';

export default function EmailSignIn() {
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      // Explicitly route after sign-in so mobile browsers do not leave users on auth screen.
      navigate('/events', { replace: true });
    } catch (err) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-email-form">
      <div className="auth-divider"><span>sign in with email</span></div>

      <form onSubmit={handleSignIn} className="auth-form-inner">
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
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy} type="submit">
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Forgot Password Note */}
      <div className="auth-forgot-note">
        <i className="fas fa-lock" style={{ marginRight: 6, color: '#FF9800' }}></i>
        <span>
          <strong>Forgot your password?</strong> Contact the developer to reset your password:<br/>
          <a href={`mailto:${DEVELOPER.email}`}>{DEVELOPER.email}</a> &nbsp;|&nbsp;
          <a href={`tel:+91${DEVELOPER.phoneRaw}`}>{DEVELOPER.phone}</a>
        </span>
      </div>
    </div>
  );
}
