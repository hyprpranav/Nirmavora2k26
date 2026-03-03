import { Link } from 'react-router-dom';
import ThreeBackground from '../layout/ThreeBackground';
import { EVENT, ORGANISERS } from '../../config/constants';
import '../../styles/landing.css';

export default function Hero() {
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

        <div className="hero-cta">
          <a href="#designathon" className="btn btn-secondary">
            <i className="fas fa-compass"></i> Explore Events
          </a>
          <Link to="/auth" className="btn btn-primary">
            <i className="fas fa-rocket"></i> Register Now
          </Link>
        </div>
      </div>
    </section>
  );
}
