import { Link } from 'react-router-dom';
import { EVENTS } from '../config/constants';
import '../styles/events.css';

export default function EventSelect() {
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
            <span className="btn btn-primary">Register →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
