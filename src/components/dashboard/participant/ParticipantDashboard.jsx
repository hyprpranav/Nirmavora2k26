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

const TABS = ['Profile', 'Team', 'Payment', 'QR Code', 'Feedback'];

export default function ParticipantDashboard() {
  const { user, profile, requestOrganiserRole } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Profile');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  /* Organiser request state */
  const [requestReason, setRequestReason] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [requestBusy, setRequestBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setFetchError('');
    getTeamsByUser(user.uid)
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
  const paymentVerified = team?.paymentStatus === PAYMENT_STATUS.VERIFIED;
  const paymentUploaded = team?.paymentStatus === PAYMENT_STATUS.UPLOADED;
  const paymentNotPaid = !team?.paymentStatus || team?.paymentStatus === PAYMENT_STATUS.NOT_PAID;

  const canRegisterHackathon = teamApproved && !hackathonTeam;
  const canRegisterDesignathon = teamApproved && !designathonTeam;

  /* Render helper: team detail card */
  function renderTeamDetails(t) {
    return (
      <div className="dash-team-card" key={t.id}>
        <div className="dash-team-card-header">
          <h4>{t.teamName}</h4>
          <span className={`status-badge st-${t.status}`}>{t.status}</span>
        </div>
        {t.teamId && <p className="team-id">Team ID: <strong>{t.teamId}</strong></p>}
        <div className="dash-team-grid">
          <div><span className="dash-lbl">Event</span><span className="dash-val">{t.eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</span></div>
          <div><span className="dash-lbl">College</span><span className="dash-val">{t.collegeName || '—'}</span></div>
          <div><span className="dash-lbl">Department</span><span className="dash-val">{t.department || '—'}</span></div>
          <div><span className="dash-lbl">Year</span><span className="dash-val">{t.year || '—'}</span></div>
          <div><span className="dash-lbl">Problem Title</span><span className="dash-val">{t.problemTitle || '—'}</span></div>
          <div><span className="dash-lbl">SDG Goal</span><span className="dash-val">{t.sdgGoal || '—'}</span></div>
          {t.abstractLink && <div><span className="dash-lbl">Abstract</span><span className="dash-val"><a href={t.abstractLink} target="_blank" rel="noopener noreferrer">View Abstract ↗</a></span></div>}
        </div>

        <h5 style={{ marginTop: 16, marginBottom: 8, color: 'var(--accent)' }}>Team Members</h5>
        <div className="dash-members-list">
          <div className="dash-member"><strong>Leader:</strong> {t.leaderName} — {t.leaderEmail} {t.leaderPhone && `— ${t.leaderPhone}`}</div>
          {t.member1Name && <div className="dash-member"><strong>Member 2:</strong> {t.member1Name} — {t.member1Email} {t.member1Phone && `— ${t.member1Phone}`}</div>}
          {t.member2Name && <div className="dash-member"><strong>Member 3:</strong> {t.member2Name} — {t.member2Email} {t.member2Phone && `— ${t.member2Phone}`}</div>}
          {t.member3Name && <div className="dash-member"><strong>Member 4:</strong> {t.member3Name} — {t.member3Email} {t.member3Phone && `— ${t.member3Phone}`}</div>}
        </div>

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

          {/* ─── Profile ─── */}
          {tab === 'Profile' && !loading && (
            <div className="profile-card">
              {profile?.photoURL && <img src={profile.photoURL} alt="" className="profile-avatar" />}
              <h3>{profile?.displayName || 'Participant'}</h3>
              <p>{profile?.email}</p>
              <span className="role-badge">{profile?.role}</span>

              {profile?.role === 'participant' && (
                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--dark-base)', borderRadius: '8px', border: '1px solid var(--medium-gray)' }}>
                  <h4 style={{ color: 'var(--primary-gold)', marginBottom: '8px' }}>Want to be an Organiser?</h4>
                  <p style={{ color: 'var(--light-gray)', fontSize: '0.85rem', marginBottom: '12px' }}>
                    Submit a request to the admin. Include your department and reason.
                  </p>
                  <textarea
                    placeholder="e.g. I'm from Civil Dept, member of ICI Club, I'd like to help manage the designathon…"
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '10px', background: 'var(--midnight-bg)', border: '1px solid var(--medium-gray)', borderRadius: '6px', color: 'var(--soft-white)', fontFamily: 'var(--font-primary)', resize: 'vertical', marginBottom: '10px' }}
                  />
                  <button
                    className="btn btn-primary"
                    disabled={requestBusy || !requestReason.trim()}
                    onClick={async () => {
                      setRequestBusy(true);
                      setRequestStatus('');
                      try {
                        await requestOrganiserRole(requestReason);
                        setRequestStatus('✅ Request submitted! Admin will review it.');
                        setRequestReason('');
                      } catch (err) {
                        setRequestStatus('❌ Failed to submit request. Try again.');
                      }
                      setRequestBusy(false);
                    }}
                  >
                    {requestBusy ? 'Submitting…' : 'Request Organiser Role'}
                  </button>
                  {requestStatus && <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>{requestStatus}</p>}
                </div>
              )}
            </div>
          )}

          {/* ─── Team ─── */}
          {tab === 'Team' && !loading && (
            teams.length > 0 ? (
              <div className="dash-teams-section">
                {/* Show each registered team with full details */}
                {teams.map(t => (
                  <div key={t.id}>
                    <TeamStatus team={t} />
                    {renderTeamDetails(t)}

                    {/* Status CTAs for this team */}
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {t.status === TEAM_STATUS.APPROVED && (!t.paymentStatus || t.paymentStatus === PAYMENT_STATUS.NOT_PAID) && (
                        <div className="cta-banner cta-success">
                          <span>🎉 Your team <strong>{t.teamName}</strong> has been <strong>approved!</strong> Complete payment to confirm your slot.</span>
                          <button className="btn btn-primary" onClick={() => setTab('Payment')}>Complete Payment →</button>
                        </div>
                      )}
                      {t.status === TEAM_STATUS.APPROVED && t.paymentStatus === PAYMENT_STATUS.UPLOADED && (
                        <div className="cta-banner cta-info"><span>⏳ Payment proof submitted for <strong>{t.teamName}</strong>. Admin is reviewing — check back soon.</span></div>
                      )}
                      {t.status === TEAM_STATUS.APPROVED && t.paymentStatus === PAYMENT_STATUS.VERIFIED && (
                        <div className="cta-banner cta-success"><span>✅ <strong>{t.teamName}</strong> is fully confirmed for <strong>{t.eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</strong>!</span></div>
                      )}
                      {t.status === TEAM_STATUS.WAITLISTED && (
                        <div className="cta-banner cta-warning"><span>⏳ <strong>{t.teamName}</strong> is on the <strong>waitlist</strong>. You will be notified if a slot opens up.</span></div>
                      )}
                      {t.status === TEAM_STATUS.CANCELLED && (
                        <div className="cta-banner cta-danger"><span>❌ <strong>{t.teamName}</strong> registration was cancelled. Contact the developer for details.</span></div>
                      )}
                      {t.status === TEAM_STATUS.PENDING && (
                        <div className="cta-banner cta-info"><span>⏳ <strong>{t.teamName}</strong> is under review. You'll be updated once the admin reviews your submission.</span></div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Register for another event */}
                {(canRegisterHackathon || canRegisterDesignathon) && (
                  <div className="cta-banner cta-info" style={{ marginTop: 20 }}>
                    <span>
                      💡 You can also register for the{' '}
                      <strong>{canRegisterHackathon ? 'Hackathon' : 'Designathon'}</strong>{' '}
                      with a different team.
                    </span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/register/${canRegisterHackathon ? 'hackathon' : 'designathon'}`)}
                    >
                      Register for {canRegisterHackathon ? 'Hackathon' : 'Designathon'}
                    </button>
                  </div>
                )}

                {/* Important note */}
                <div className="dash-note dash-note-info" style={{ marginTop: 20 }}>
                  <i className="fas fa-info-circle"></i>
                  <span>
                    <strong>Note:</strong> A participant cannot be in the same team for both Hackathon and Designathon.
                    If you are registered in a Hackathon team, you cannot be part of the same members' Designathon team and vice versa.
                    You may register for both events with <strong>different team members</strong>.
                  </span>
                </div>

                {/* Need changes? Contact developer */}
                <div className="dash-note dash-note-warning" style={{ marginTop: 12 }}>
                  <i className="fas fa-edit"></i>
                  <span>
                    Need to change your abstract, team details, or fix an error? Contact the developer as soon as possible:<br/>
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
