import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EVENTS } from '../config/constants';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { getTeamsByUser } from '../services/teamService';
import '../styles/events.css';

export default function EventSelect() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasTeam, setHasTeam] = useState(false);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    getTeamsByUser(user.uid, user.email).then((teams) => {
      if (teams && teams.length > 0) {
        // Already registered — redirect straight to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setHasTeam(false);
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, [user]);

  if (checking) return <div className="loader">Loading…</div>;

  if (!settings.registrationOpen) {
    return (
      <section className="event-select-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <i className="fas fa-lock" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.2)', marginBottom: 20 }}></i>
          <h2 style={{ color: '#fff', marginBottom: 12 }}>Registrations Closed</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Registrations are currently closed. Please check back later or contact the organisers.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="event-select-page">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Choose Your Event</span>
          <h2 className="section-title">
            Register for <span className="highlight">NIRMAVORA FEST 2026</span>
          </h2>
          <p className="section-description">Select the event you want to participate in</p>
        </div>

        {/* Already registered banner (fallback for mobile) */}
        {hasTeam && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Link to="/dashboard" className="btn btn-primary">
              <i className="fas fa-tachometer-alt" style={{ marginRight: 8 }}></i>Already Registered — Go to My Dashboard
            </Link>
          </div>
        )}

        <div className="event-cards">
          <Link to={`/register/${EVENTS.DESIGNATHON}`} className="event-card designathon-card">
            <div className="event-card-icon">
              <i className="fas fa-pencil-ruler"></i>
            </div>
            <h3>Designathon</h3>
            <p>Design innovative solutions for Civil & Mechanical engineering challenges</p>
            <div className="event-card-details">
              <span><i className="fas fa-palette"></i> 8 Themes</span>
              <span><i className="fas fa-users"></i> 3–4 Members</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: 8, padding: '0 8px' }}>
              <i className="fas fa-info-circle" style={{ marginRight: 4, color: '#fb923c' }}></i>
              Primarily for Civil &amp; Mechanical students. Interdisciplinary teams allowed.
            </div>
            <span className="btn btn-primary">Register →</span>
          </Link>

          <Link to={`/register/${EVENTS.HACKATHON}`} className="event-card hackathon-card">
            <div className="event-card-icon">
              <i className="fas fa-laptop-code"></i>
            </div>
            <h3>Hackathon</h3>
            <p>Build prototypes in an 8-hour hackathon with software & hardware tracks</p>
            <div className="event-card-details">
              <span><i className="fas fa-code"></i> 8 Tracks</span>
              <span><i className="fas fa-users"></i> 3–4 Members</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: 8, padding: '0 8px' }}>
              <i className="fas fa-info-circle" style={{ marginRight: 4, color: '#f472b6' }}></i>
              Open to all departments.
            </div>
            <span className="btn btn-primary">Register →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
