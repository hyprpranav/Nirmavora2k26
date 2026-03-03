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
  const { user, profile } = useAuth();
  const [tab, setTab] = useState('Profile');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

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
