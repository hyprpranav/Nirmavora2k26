import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getTeamsByUser } from '../../../services/teamService';
import { TEAM_STATUS, PAYMENT_STATUS, DEVELOPER } from '../../../config/constants';
import TeamStatus from './TeamStatus';
import PaymentUpload from './PaymentUpload';
import QRDownload from './QRDownload';
import FeedbackForm from './FeedbackForm';
import '../../../styles/dashboard.css';

const TABS = ['My Teams', 'Payment', 'QR Code', 'Feedback'];

export default function ParticipantDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('My Teams');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setFetchError('');
    getTeamsByUser(user.uid, user.email)
      .then((t) => {
        setTeams(t);
      })
      .catch((err) => {
        console.error('Dashboard fetch error:', err);
        setFetchError('Failed to load your registrations. Please refresh the page.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  /* Teams by event type */
  const designathonTeam = teams.find(t => t.eventType === 'designathon');
  const hackathonTeam = teams.find(t => t.eventType === 'hackathon');
  const team = teams[0]; // primary

  const teamApproved = team?.status === TEAM_STATUS.APPROVED;
  const canRegisterHackathon = teamApproved && !hackathonTeam;
  const canRegisterDesignathon = teamApproved && !designathonTeam;

  /* Helper: readable status message */
  function getStatusMessage(t) {
    if (t.status === TEAM_STATUS.PENDING) {
      return { icon: '⏳', text: `Your idea has been submitted and is waiting for approval.`, type: 'info' };
    }
    if (t.status === TEAM_STATUS.APPROVED) {
      if (t.paymentStatus === PAYMENT_STATUS.VERIFIED) {
        return { icon: '✅', text: `Your team has been shortlisted and payment is confirmed! You're all set for the event.`, type: 'success' };
      }
      if (t.paymentStatus === PAYMENT_STATUS.UPLOADED) {
        return { icon: '⏳', text: `Your team has been shortlisted! Payment proof submitted — admin is reviewing.`, type: 'info' };
      }
      if (t.paymentStatus === PAYMENT_STATUS.REJECTED) {
        return { icon: '⚠️', text: `Your team has been shortlisted but payment was rejected. Please re-upload.`, type: 'warning' };
      }
      return { icon: '🎉', text: `Your team has been shortlisted! Please complete your payment to confirm your spot.`, type: 'success' };
    }
    if (t.status === TEAM_STATUS.WAITLISTED) {
      return {
        icon: '📋',
        text: `Your team has been waitlisted. Your idea is strong, and there is a very high chance of shortlist movement in the next review. Please stay ready and wait for our update.`,
        type: 'warning'
      };
    }
    if (t.status === TEAM_STATUS.CANCELLED) {
      return { icon: '❌', text: `Your registration was cancelled. Contact the organiser for details.`, type: 'danger' };
    }
    return { icon: 'ℹ️', text: 'Status unknown. Please contact the organiser.', type: 'info' };
  }

  /* Render helper: team detail card */
  function renderTeamCard(t) {
    const statusMsg = getStatusMessage(t);
    return (
      <div className="dash-team-card" key={t.id}>
        {/* Status Progress Bar */}
        <TeamStatus team={t} />

        {/* Status Message Banner */}
        <div className={`cta-banner cta-${statusMsg.type}`} style={{ marginTop: 12, marginBottom: 16 }}>
          <span>{statusMsg.icon} {statusMsg.text}</span>
          {t.status === TEAM_STATUS.APPROVED && (!t.paymentStatus || t.paymentStatus === PAYMENT_STATUS.NOT_PAID) && (
            <button className="btn btn-primary" onClick={() => setTab('Payment')} style={{ marginTop: 8 }}>Complete Payment →</button>
          )}
          {t.status === TEAM_STATUS.WAITLISTED && (
            <div style={{ marginTop: 8, color: 'var(--soft-white)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Your team is most probably around 90% likely to be shortlisted. Please wait a little longer while we complete the next round of review.
            </div>
          )}
        </div>

        {/* Team Header */}
        <div className="dash-team-card-header">
          <h4>{t.teamName}</h4>
          <span className={`status-badge st-${t.status}`}>{t.status}</span>
        </div>
        {t.teamId && <p className="team-id">Team ID: <strong>{t.teamId}</strong></p>}

        {/* Team Details Grid */}
        <div className="dash-team-grid">
          <div><span className="dash-lbl">Event</span><span className="dash-val">{t.eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</span></div>
          <div><span className="dash-lbl">College</span><span className="dash-val">{t.collegeName || '—'}</span></div>
          <div><span className="dash-lbl">Department</span><span className="dash-val">{t.department || '—'}</span></div>
          <div><span className="dash-lbl">Year</span><span className="dash-val">{t.year || '—'}</span></div>
          <div><span className="dash-lbl">Problem Title</span><span className="dash-val">{t.problemTitle || '—'}</span></div>
          <div><span className="dash-lbl">SDG Goals</span><span className="dash-val">{(t.sdgGoals && t.sdgGoals.length > 0) ? t.sdgGoals.map(v => `SDG ${v}`).join(', ') : t.sdgGoal ? `SDG ${t.sdgGoal}` : '—'}</span></div>
          {(t.abstractFileUrl || t.abstractLink) && (
            <div><span className="dash-lbl">Abstract</span><span className="dash-val">
              {t.abstractFileUrl
                ? (<><i className="fas fa-file-alt"></i> Submitted </>)
                : (<a href={t.abstractLink} target="_blank" rel="noopener noreferrer">View Abstract ↗</a>)}
            </span></div>
          )}
        </div>

        {/* Team Members */}
        <h5 style={{ marginTop: 16, marginBottom: 8, color: 'var(--accent)' }}>Team Members</h5>
        <div className="dash-members-list">
          <div className="dash-member"><strong>Leader:</strong> {t.leaderName} — {t.leaderEmail} {t.leaderPhone && `— ${t.leaderPhone}`}</div>
          {t.member1Name && <div className="dash-member"><strong>Member 2:</strong> {t.member1Name} — {t.member1Email} {t.member1Phone && `— ${t.member1Phone}`}</div>}
          {t.member2Name && <div className="dash-member"><strong>Member 3:</strong> {t.member2Name} — {t.member2Email} {t.member2Phone && `— ${t.member2Phone}`}</div>}
          {t.member3Name && <div className="dash-member"><strong>Member 4:</strong> {t.member3Name} — {t.member3Email} {t.member3Phone && `— ${t.member3Phone}`}</div>}
        </div>

        {/* Payment Status */}
        <div className="dash-team-payment">
          <span className="dash-lbl">Payment:</span>{' '}
          <span className={`status-badge st-${t.paymentStatus || 'not_paid'}`}>
            {t.paymentStatus === PAYMENT_STATUS.VERIFIED ? 'Verified ✓' : t.paymentStatus === PAYMENT_STATUS.UPLOADED ? 'Uploaded — Pending' : t.paymentStatus === PAYMENT_STATUS.REJECTED ? 'Rejected' : 'Not Paid'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="container">
        <h2 className="dash-title">Participant Dashboard</h2>

        {/* Quick Profile Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--dark-base)', borderRadius: 8, marginBottom: 20, border: '1px solid var(--medium-gray)' }}>
          {profile?.photoURL && <img src={profile.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />}
          <div>
            <strong style={{ color: 'var(--soft-white)' }}>{profile?.displayName || 'Participant'}</strong>
            <span style={{ color: 'var(--light-gray)', fontSize: '0.85rem', marginLeft: 10 }}>{profile?.email}</span>
          </div>
        </div>

        <div className="dash-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`dash-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="dash-content">
          {loading && <p className="loader">Loading…</p>}
          {fetchError && <div className="cta-banner cta-danger"><span>{fetchError}</span></div>}

          {/* ─── My Teams (default tab) ─── */}
          {tab === 'My Teams' && !loading && (
            teams.length > 0 ? (
              <div className="dash-teams-section">
                {teams.map(t => renderTeamCard(t))}

                {/* ⚠️ Important Registration Rule Note */}
                <div className="dash-rule-note" style={{ marginTop: 20 }}>
                  <div className="dash-rule-note-header">
                    <i className="fas fa-exclamation-triangle"></i>
                    <strong>Important: Event Registration Rules</strong>
                  </div>
                  <ul className="dash-rule-list">
                    <li>
                      <i className="fas fa-ban"></i>
                      <span>Both Hackathon &amp; Designathon happen <strong>simultaneously</strong> — the same team member or leader <strong>cannot participate in both events</strong>.</span>
                    </li>
                    <li>
                      <i className="fas fa-ban"></i>
                      <span>If you are already registered for one event, the <strong>same team members and the same leader</strong> are <strong>not allowed</strong> to register under the other event.</span>
                    </li>
                    <li>
                      <i className="fas fa-check-circle" style={{ color: '#4CAF50' }}></i>
                      <span>However, from this account you <strong>can register a brand-new team</strong> — with <strong>entirely different members</strong> — for the other event.</span>
                    </li>
                  </ul>
                </div>

                {/* Need changes? */}
                <div className="dash-note dash-note-warning" style={{ marginTop: 12 }}>
                  <i className="fas fa-edit"></i>
                  <span>
                    Need to change your abstract, team details, or fix an error? Contact the developer:<br/>
                    <strong>Email:</strong> <a href={`mailto:${DEVELOPER.email}`}>{DEVELOPER.email}</a> &nbsp;|&nbsp;
                    <strong>Phone:</strong> <a href={`tel:+91${DEVELOPER.phoneRaw}`}>{DEVELOPER.phone}</a>
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-users"></i>
                <p>No team registered yet.</p>
                <button className="btn btn-primary" onClick={() => navigate('/events')} style={{ marginTop: 12 }}>Register Now</button>
              </div>
            )
          )}

          {/* ─── Payment ─── */}
          {tab === 'Payment' && !loading && (
            team ? <PaymentUpload team={team} /> : (
              <div className="empty-state">
                <i className="fas fa-credit-card"></i>
                <p>Register a team first to access payment.</p>
              </div>
            )
          )}

          {/* ─── QR Code ─── */}
          {tab === 'QR Code' && !loading && (
            team ? <QRDownload team={team} /> : (
              <div className="empty-state">
                <i className="fas fa-qrcode"></i>
                <p>QR code will be available once your team is registered.</p>
              </div>
            )
          )}

          {/* ─── Feedback ─── */}
          {tab === 'Feedback' && !loading && <FeedbackForm userId={user?.uid} />}
        </div>
      </div>
    </section>
  );
}
