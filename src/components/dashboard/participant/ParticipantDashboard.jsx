import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getTeamsByUser } from '../../../services/teamService';
import { TEAM_STATUS, PAYMENT_STATUS } from '../../../config/constants';
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

  /* Organiser request state */
  const [requestReason, setRequestReason] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [requestBusy, setRequestBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    getTeamsByUser(user.uid).then((t) => {
      setTeams(t);
      setLoading(false);
    });
  }, [user]);

  const team = teams[0]; // primary team

  /* Derive easy booleans for the team CTA logic */
  const teamApproved = team?.status === TEAM_STATUS.APPROVED;
  const paymentVerified = team?.paymentStatus === PAYMENT_STATUS.VERIFIED;
  const paymentUploaded = team?.paymentStatus === PAYMENT_STATUS.UPLOADED;
  const paymentNotPaid = !team?.paymentStatus || team?.paymentStatus === PAYMENT_STATUS.NOT_PAID;

  /* Teams for each event type */
  const designathonTeam = teams.find(t => t.eventType === 'designathon');
  const hackathonTeam = teams.find(t => t.eventType === 'hackathon');
  const canRegisterHackathon = teamApproved && !hackathonTeam;
  const canRegisterDesignathon = teamApproved && !designathonTeam;

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

          {/* ─── Profile ─── */}
          {tab === 'Profile' && !loading && (
            <div className="profile-card">
              {profile?.photoURL && <img src={profile.photoURL} alt="" className="profile-avatar" />}
              <h3>{profile?.displayName || 'Participant'}</h3>
              <p>{profile?.email}</p>
              <span className="role-badge">{profile?.role}</span>

              {/* Organiser Request — only show for participants */}
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
            team ? (
              <>
                <TeamStatus team={team} />

                {/* ─── Status-driven CTAs ─── */}
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Approved + payment needed */}
                  {teamApproved && paymentNotPaid && (
                    <div className="cta-banner cta-success">
                      <span>🎉 Your team has been <strong>approved!</strong> Complete your payment to confirm your slot.</span>
                      <button className="btn btn-primary" onClick={() => setTab('Payment')}>
                        Complete Payment →
                      </button>
                    </div>
                  )}

                  {/* Payment uploaded, waiting verification */}
                  {teamApproved && paymentUploaded && (
                    <div className="cta-banner cta-info">
                      <span>⏳ Payment proof submitted. Admin is reviewing your payment — check back soon.</span>
                    </div>
                  )}

                  {/* Fully confirmed */}
                  {teamApproved && paymentVerified && (
                    <div className="cta-banner cta-success">
                      <span>✅ You are fully confirmed for <strong>{team.eventType === 'designathon' ? 'Designathon' : 'Hackathon'}</strong>!</span>
                    </div>
                  )}

                  {/* Waitlisted */}
                  {team.status === TEAM_STATUS.WAITLISTED && (
                    <div className="cta-banner cta-warning">
                      <span>⏳ Your team is on the <strong>waitlist</strong>. You will be notified if a slot opens up.</span>
                    </div>
                  )}

                  {/* Cancelled */}
                  {team.status === TEAM_STATUS.CANCELLED && (
                    <div className="cta-banner cta-danger">
                      <span>❌ Your team registration was cancelled. Contact the organiser for details.</span>
                    </div>
                  )}

                  {/* Register for second event */}
                  {teamApproved && paymentVerified && (canRegisterHackathon || canRegisterDesignathon) && (
                    <div className="cta-banner cta-info">
                      <span>
                        💡 Your team can also register for the{' '}
                        <strong>{canRegisterHackathon ? 'Hackathon' : 'Designathon'}</strong>{' '}
                        with a new team (different members allowed).
                      </span>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/register/${canRegisterHackathon ? 'hackathon' : 'designathon'}`)}
                      >
                        Register for {canRegisterHackathon ? 'Hackathon' : 'Designathon'}
                      </button>
                    </div>
                  )}
                </div>

                {/* All teams if participant has more than one */}
                {teams.length > 1 && (
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ marginBottom: 10, color: 'var(--soft-white)' }}>Your Registrations</h4>
                    {teams.map(t => (
                      <div key={t.id} style={{ padding: '12px 16px', background: 'var(--dark-base)', border: '1px solid var(--medium-gray)', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: 'var(--soft-white)' }}>{t.teamName}</strong>
                          <span style={{ marginLeft: 10, fontSize: '0.8rem', textTransform: 'capitalize', color: 'var(--light-gray)' }}>{t.eventType}</span>
                        </div>
                        <span className={`status-badge st-${t.status}`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <i className="fas fa-users"></i>
                <p>No team registered yet. <a href="/events">Register now</a></p>
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
