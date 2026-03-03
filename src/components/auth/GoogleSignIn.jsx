import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sendOTP } from '../../config/emailjs';

export default function GoogleSignIn() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSignIn() {
    setBusy(true);
    setError('');
    try {
      const firebaseUser = await signInWithGoogle();

      /* Generate and send OTP */
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('nirmavora_otp', otp);
      sessionStorage.setItem('nirmavora_otp_ts', Date.now().toString());
      sessionStorage.setItem('nirmavora_otp_retries', '0');

      await sendOTP(firebaseUser.email, otp, firebaseUser.displayName || 'Participant');

      navigate('/auth?step=otp');
    } catch (err) {
      console.error(err);
      setError('Sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="google-signin">
      <button className="btn-google" onClick={handleSignIn} disabled={busy}>
        <i className="fab fa-google"></i>
        {busy ? 'Signing in…' : 'Continue with Google'}
      </button>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
