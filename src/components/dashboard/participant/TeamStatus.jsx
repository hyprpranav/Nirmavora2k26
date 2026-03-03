import { TEAM_STATUS, PAYMENT_STATUS } from '../../../config/constants';

const STATUS_LABELS = {
  [TEAM_STATUS.PENDING]: { label: 'Pending Review', color: '#F5B301' },
  [TEAM_STATUS.APPROVED]: { label: 'Approved', color: '#4CAF50' },
  [TEAM_STATUS.WAITLISTED]: { label: 'Waitlisted', color: '#FF9800' },
  [TEAM_STATUS.CANCELLED]: { label: 'Cancelled', color: '#f44336' },
};

const PAYMENT_LABELS = {
  [PAYMENT_STATUS.NOT_PAID]: 'Not Paid',
  [PAYMENT_STATUS.UPLOADED]: 'Payment Uploaded – Pending Verification',
  [PAYMENT_STATUS.VERIFIED]: 'Payment Verified ✓',
  [PAYMENT_STATUS.REJECTED]: 'Payment Rejected – Re-upload required',
};

export default function TeamStatus({ team }) {
  const status = STATUS_LABELS[team.status] || STATUS_LABELS[TEAM_STATUS.PENDING];

  /* Progress steps */
  const steps = ['Registered', 'Reviewed', 'Shortlisted', 'Payment', 'Confirmed'];
  let progressIndex = 0;
  if (team.status === TEAM_STATUS.APPROVED) progressIndex = 2;
  if (team.paymentStatus === PAYMENT_STATUS.UPLOADED) progressIndex = 3;
  if (team.paymentStatus === PAYMENT_STATUS.VERIFIED) progressIndex = 4;
  if (team.status === TEAM_STATUS.WAITLISTED) progressIndex = 1;

  return (
    <div className="team-status">
      <div className="status-header">
        <h3>{team.teamName}</h3>
        <span className="status-badge" style={{ background: status.color }}>{status.label}</span>
      </div>

      {team.teamId && <p className="team-id">Team ID: <strong>{team.teamId}</strong></p>}

      {/* Progress bar */}
      <div className="progress-bar">
        {steps.map((s, i) => (
          <div key={s} className={`progress-step${i <= progressIndex ? ' done' : ''}`}>
            <div className="step-dot" />
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="team-details">
        <p><strong>Event:</strong> {team.eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</p>
        <p><strong>College:</strong> {team.collegeName}</p>
        <p><strong>Problem:</strong> {team.problemTitle}</p>
        <p><strong>Leader:</strong> {team.leaderName} ({team.leaderEmail})</p>
        <p><strong>Payment:</strong> {PAYMENT_LABELS[team.paymentStatus] || 'Not Paid'}</p>
      </div>
    </div>
  );
}
