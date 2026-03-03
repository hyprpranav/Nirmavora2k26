import { useState } from 'react';
import { updatePayment } from '../../../services/paymentService';
import { PAYMENT_STATUS, EVENT } from '../../../config/constants';

export default function PaymentUpload({ team }) {
  const [txnId, setTxnId] = useState('');
  const [screenshotLink, setScreenshotLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const canPay = team.status === 'approved' && team.paymentStatus !== PAYMENT_STATUS.VERIFIED;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!txnId.trim() || !screenshotLink.match(/^https?:\/\//)) {
      setError('Provide a valid Transaction ID and screenshot Drive link.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await updatePayment(team.id, { txnId, screenshotLink });
      setSuccess(true);
    } catch (err) {
      setError('Upload failed. Try again.');
    }
    setBusy(false);
  }

  if (!canPay) {
    return (
      <div className="payment-section">
        <p>
          {team.paymentStatus === PAYMENT_STATUS.VERIFIED
            ? '✅ Payment verified. You are confirmed!'
            : 'Payment upload will be available after your team is approved.'}
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="payment-section">
        <div className="success-card">
          <i className="fas fa-check-circle"></i>
          <h3>Payment proof uploaded!</h3>
          <p>Admin will verify shortly. Check your dashboard for updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-section">
      <h3>Upload Payment Proof</h3>
      <div className="upi-info">
        <p><strong>UPI ID:</strong> {EVENT.upiId || 'Contact organiser for UPI details'}</p>
        <p><strong>Amount:</strong> ₹{EVENT.feePerHead} × team members</p>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label>UPI Transaction ID *</label>
          <input value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="e.g., 123456789012" />
        </div>
        <div className="form-group">
          <label>Screenshot Drive Link *</label>
          <input value={screenshotLink} onChange={(e) => setScreenshotLink(e.target.value)} placeholder="https://drive.google.com/..." />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Uploading…' : 'Upload Payment'}
        </button>
      </form>
    </div>
  );
}
