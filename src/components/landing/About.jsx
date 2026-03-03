import { EVENT, ORGANISERS } from '../../config/constants';

export default function About() {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">About The Event</span>
          <h2 className="section-title">
            What is <span className="highlight">NIRMAVORA</span>?
          </h2>
        </div>

        <div className="about-content">
          <p className="about-intro">
            <strong>{EVENT.name}</strong> is a prestigious National-Level{' '}
            <span className="highlight">Designathon cum Hackathon</span> that brings together
            brilliant minds from across the nation to solve real-world challenges through
            innovative engineering solutions.
          </p>
          <p>Nirmāṇa + ora → Creation · Construction · Engineering Excellence</p>

          <div className="about-grid">
            <div className="about-card">
              <i className="fas fa-handshake"></i>
              <h4>Joint Initiative</h4>
              <p>{ORGANISERS.departments.join(' & ')}</p>
            </div>
            <div className="about-card">
              <i className="fas fa-globe-americas"></i>
              <h4>SDG-Focused</h4>
              <p>All projects aligned with UN Sustainable Development Goals</p>
            </div>
            <div className="about-card">
              <i className="fas fa-university"></i>
              <h4>All Departments Welcome</h4>
              <p>ECE, EEE, AI/ML, Data Science, Biotech, and all engineering disciplines</p>
            </div>
            <div className="about-card">
              <i className="fas fa-trophy"></i>
              <h4>National Recognition</h4>
              <p>Platform for showcasing innovation at the national level</p>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card"><h3>2</h3><p>Events</p></div>
            <div className="stat-card"><h3>17</h3><p>SDGs</p></div>
            <div className="stat-card"><h3>8</h3><p>Hour Hackathon</p></div>
            <div className="stat-card"><h3>∞</h3><p>Opportunities</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
