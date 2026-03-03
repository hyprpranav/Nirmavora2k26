import { useState } from 'react';
import { submitFeedback } from '../../../services/teamService';

export default function FeedbackForm({ userId }) {
  const [msg, setMsg] = useState('');
  const [rating, setRating] = useState(0);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!msg.trim()) return;
    setBusy(true);
    await submitFeedback(userId, { message: msg, rating });
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="feedback-section">
        <div className="success-card">
          <i className="fas fa-heart"></i>
          <h3>Thank you for your feedback!</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-section">
      <h3>Share Your Feedback</h3>
      <form onSubmit={handleSubmit}>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`star${n <= rating ? ' active' : ''}`}
              onClick={() => setRating(n)}
            >
              <i className="fas fa-star"></i>
            </button>
          ))}
        </div>
        <div className="form-group">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Your experience, suggestions…"
            rows={4}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Sending…' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
