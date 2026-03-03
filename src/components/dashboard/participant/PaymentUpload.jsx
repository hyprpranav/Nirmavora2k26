import { useState } from 'react';
import { updatePayment } from '../../../services/paymentService';
import { PAYMENT_STATUS, EVENT, DEVELOPER } from '../../../config/constants';

/* The QR image — place your UPI QR at src/assets/statics/images/upi-qr.png */
let upiQrImage = null;
try {
  // Vite resolves this at build time; if file doesn't exist the import will fail gracefully
  const modules = import.meta.glob('../../../assets/statics/images/upi-qr.*', { eager: true });
  const key = Object.keys(modules)[0];
  if (key) upiQrImage = modules[key].default;
} catch (_) { /* QR not yet added */ }

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
            : team.status === 'approved'
              ? '⏳ Payment uploaded. Awaiting admin verification.'
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

      {/* UPI Details + QR */}
      <div className="upi-info" style={{ textAlign: 'center' }}>
        {upiQrImage && (
          <div style={{ marginBottom: 16 }}>
            <img src={upiQrImage} alt="UPI Payment QR" style={{ maxWidth: 220, borderRadius: 12, border: '2px solid var(--accent)' }} />
          </div>
        )}
        <p><strong>UPI ID:</strong> {EVENT.upiId || 'Will be updated soon — contact developer'}</p>
        <p><strong>Amount:</strong> ₹{EVENT.feePerHead} × {team.memberCount || 'team members'} = ₹{EVENT.feePerHead * (team.memberCount || 3)}</p>
        {!upiQrImage && !EVENT.upiId && (
          <p style={{ color: '#FF9800', fontSize: '0.85rem', marginTop: 8 }}>
            <i className="fas fa-exclamation-circle"></i> Payment QR / UPI ID will be updated shortly. Contact the developer if needed.
          </p>
        )}
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

      {/* Developer contact for payment issues */}
      <div className="dash-note dash-note-info" style={{ marginTop: 20 }}>
        <i className="fas fa-headset"></i>
        <span>
          Facing payment issues or need help? Contact the developer:<br/>
          <strong>Email:</strong> <a href={`mailto:${DEVELOPER.email}`}>{DEVELOPER.email}</a> &nbsp;|&nbsp;
          <strong>Phone:</strong> <a href={`tel:+91${DEVELOPER.phoneRaw}`}>{DEVELOPER.phone}</a>
        </span>
      </div>
    </div>
  );
}
