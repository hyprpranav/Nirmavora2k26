import { Link } from 'react-router-dom';
import ThreeBackground from '../layout/ThreeBackground';
import { EVENT, ORGANISERS } from '../../config/constants';
import { useSettings } from '../../contexts/SettingsContext';
import '../../styles/landing.css';

export default function Hero() {
  const { settings } = useSettings();

  return (
    <section id="home" className="hero">
      <ThreeBackground />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-organizers">
          <div className="organizer-departments">
            {ORGANISERS.departments.map((d) => (
              <span key={d} className="dept-badge">{d}</span>
            ))}
          </div>
          <div className="organizer-clubs">
            {ORGANISERS.clubs.map((c) => (
              <span key={c} className="club-name">{c}</span>
            ))}
          </div>
        </div>

        <h1 className="hero-title">
          NIRMAVORA <span className="highlight">FEST 2026</span>
        </h1>

        <p className="hero-subtitle">Designathon × Hackathon</p>
        <p className="hero-date">{EVENT.dateDisplay}</p>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', maxWidth: 600, margin: '16px auto', lineHeight: 1.6, textAlign: 'center' }}>
          Don't miss the <strong style={{ color: '#F5B301' }}>Designathon</strong> — a unique opportunity for Civil & Mechanical students to showcase their creativity and innovation.
          Open to all departments! Compete, collaborate, and win <strong style={{ color: '#F5B301', fontSize: '1.05rem' }}>exciting surprise prizes!</strong>
        </p>

        <div className="hero-cta">
          <a href="#designathon" className="btn btn-secondary">
            <i className="fas fa-compass"></i> Explore Events
          </a>
          {settings.registrationOpen ? (
            <Link to="/auth" className="btn btn-primary">
              <i className="fas fa-rocket"></i> Register Now
            </Link>
          ) : (
            <span className="btn btn-disabled">
              <i className="fas fa-lock"></i> Registrations Closed
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
