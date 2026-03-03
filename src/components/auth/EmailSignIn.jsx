import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function EmailSignIn() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
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
      {/* Google instant login */}
      <button className="btn-google" onClick={handleGoogle} disabled={busy} type="button">
        <i className="fab fa-google"></i>
        Continue with Google
      </button>

      <div className="auth-divider"><span>or sign in with email</span></div>

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
    </div>
  );
}
