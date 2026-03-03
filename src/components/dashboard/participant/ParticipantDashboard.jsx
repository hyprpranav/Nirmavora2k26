import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getTeamsByUser } from '../../../services/teamService';
import TeamStatus from './TeamStatus';
import PaymentUpload from './PaymentUpload';
import QRDownload from './QRDownload';
import FeedbackForm from './FeedbackForm';
import '../../../styles/dashboard.css';

const TABS = ['Profile', 'Team', 'Payment', 'QR Code', 'Feedback'];

export default function ParticipantDashboard() {
  const { user, profile, requestOrganiserRole } = useAuth();
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

          {tab === 'Team' && !loading && (
            team ? <TeamStatus team={team} /> : (
              <div className="empty-state">
                <i className="fas fa-users"></i>
                <p>No team registered yet. <a href="/events">Register now</a></p>
              </div>
            )
          )}

          {tab === 'Payment' && !loading && team && <PaymentUpload team={team} />}

          {tab === 'QR Code' && !loading && team && <QRDownload team={team} />}

          {tab === 'Feedback' && !loading && <FeedbackForm userId={user?.uid} />}
        </div>
      </div>
    </section>
  );
}
