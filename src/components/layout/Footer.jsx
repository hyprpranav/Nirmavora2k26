import { Link } from 'react-router-dom';
import { EVENT, ORGANISERS } from '../../config/constants';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>{EVENT.name}</h3>
            <p>{EVENT.tagline}</p>
            <p className="footer-tagline">
              Designathon × Hackathon focused on SDG-aligned innovation and engineering excellence.
            </p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/auth">Register</Link></li>
              <li><Link to="/events">Events</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Organised By</h4>
            <ul>
              {ORGANISERS.departments.map((d) => (
                <li key={d}>{d}</li>
              ))}
              {ORGANISERS.clubs.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>
                <i className="fas fa-envelope"></i>{' '}
                <a href={`mailto:${EVENT.contactEmail}`}>{EVENT.contactEmail}</a>
              </li>
              <li>
                <i className="fas fa-phone"></i>{' '}
                <a href={`tel:${EVENT.contactPhone.replace(/\s/g, '')}`}>{EVENT.contactPhone}</a>
              </li>
            </ul>
            <div className="social-links">
              <a href="https://www.instagram.com/mkcekarur" target="_blank" rel="noopener noreferrer" title="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/in/mkce" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://x.com/KarurMkce" target="_blank" rel="noopener noreferrer" title="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 {EVENT.name}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
