import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sendOTP } from '../../config/emailjs';

const MAX_RETRIES = 3;
const RESEND_COOLDOWN = 60; // seconds

export default function OTPVerify() {
  const { user, markOtpVerified } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [retries, setRetries] = useState(
    parseInt(sessionStorage.getItem('nirmavora_otp_retries') || '0', 10)
  );

  /* Countdown for resend button */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  async function handleVerify(e) {
    e.preventDefault();
    setError('');

    if (retries >= MAX_RETRIES) {
      setError('Maximum attempts reached. Please sign in again.');
      return;
    }

    const savedOtp = sessionStorage.getItem('nirmavora_otp');
    if (otp === savedOtp) {
      setBusy(true);
      await markOtpVerified();
      sessionStorage.removeItem('nirmavora_otp');
      sessionStorage.removeItem('nirmavora_otp_ts');
      sessionStorage.removeItem('nirmavora_otp_retries');
      navigate('/events', { replace: true });
    } else {
      const newRetries = retries + 1;
      setRetries(newRetries);
      sessionStorage.setItem('nirmavora_otp_retries', newRetries.toString());
      setError(`Invalid OTP. ${MAX_RETRIES - newRetries} attempt(s) left.`);
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('nirmavora_otp', newOtp);
    sessionStorage.setItem('nirmavora_otp_ts', Date.now().toString());
    setResendTimer(RESEND_COOLDOWN);
    setRetries(0);
    sessionStorage.setItem('nirmavora_otp_retries', '0');
    try {
      await sendOTP(user.email, newOtp, user.displayName || 'Participant');
    } catch (err) {
      setError('Failed to resend OTP. Try again.');
    }
  }

  return (
    <form className="otp-form" onSubmit={handleVerify}>
      <div className="otp-input-row">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" className="btn-primary" disabled={busy || otp.length < 6}>
        {busy ? 'Verifying…' : 'Verify OTP'}
      </button>

      <button
        type="button"
        className="btn-text"
        onClick={handleResend}
        disabled={resendTimer > 0}
      >
        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
      </button>

      <p className="otp-info">
        <i className="fas fa-info-circle"></i> Check your email ({user?.email}) for the OTP.
      </p>
    </form>
  );
}
